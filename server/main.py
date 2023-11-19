# Michael Chen
# CS361
# Tic Tac Toe backend
import websockets.exceptions
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
import requests
from google.cloud import datastore
import json
import constants
import time
# import re

client = datastore.Client()
app = FastAPI()


class GetUsernameError(Exception):
    pass


class UserNotConnected(Exception):
    pass


class ConnectionManager:
    def __init__(self):
        self._active_users = dict()
        self._broadcast_time = time.time()

    def add_user(self, user_id: int, websocket: WebSocket):
        self._active_users[user_id] = {'websocket': websocket, 'in_game': False}

    def user_in_game(self, user_id, in_game: bool):
        self._active_users[user_id]['in_game'] = in_game

    def remove_user(self, user_id: int):
        self._active_users.pop(user_id)

    async def send_user_json(self, user_id, data):
        if user_id not in self._active_users:
            raise UserNotConnected
        else:
            await self._active_users[user_id]['websocket'].send_json(data)

    async def broadcast_tables(self, wait: bool):
        """Broadcasts all available tables, but not too often"""
        async def broadcast():
            query = client.query(kind=constants.tables)
            query.add_filter('open', '=', True)
            query.projection = ['X_username', 'O_username']
            results = list(query.fetch())
            for e in results:
                e['table_id'] = e.key.id

            for user_id in self._active_users:
                if not self._active_users[user_id]['in_game']:
                    await self._active_users[user_id]['websocket'].send_json({'type': 'all_tables', 'tables': results})

        if time.time() - self._broadcast_time > 0.1:
            await broadcast()
            self._broadcast_time = time.time()
        elif wait:
            time.sleep(0.1)
            # check if broadcast has occurred while waiting.
            if time.time() - self._broadcast_time > 0.1:
                await broadcast()
                self._broadcast_time = time.time()


manager = ConnectionManager()


@app.get("/")
async def get():
    return HTMLResponse("Hello world!")


@app.get("/delete")
async def get():
    query = client.query(kind=constants.tables)
    results1 = list(query.fetch())
    for e in results1:
        client.delete(e.key)
    query = client.query(kind=constants.users)
    results2 = list(query.fetch())
    for e in results2:
        client.delete(e.key)
    return (json.dumps({'deleted_users': results2,
                        'deleted_tables': results1}), 204)


def get_username():
    """GET Request to username microservice."""

    url = "http://cs361-microservice-404417.wl.r.appspot.com/"
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
    except requests.ConnectionError as error:
        raise GetUsernameError(error)
    except requests.exceptions.HTTPError as error:
        raise GetUsernameError(error)
    return response.json()['username'].strip()


@app.websocket("/ws")
async def websocket_login(websocket: WebSocket):
    await websocket.accept()
    user_id = None
    try:
        while True:
            data = await websocket.receive_json() #json
            print(data)
            if data['type'] == 'ping':
                await websocket.send_text('ping')

            # Login
            elif data['type'] == 'login':
                # get a username

                has_username = False
                username = None
                while not has_username:
                    try:
                        username = get_username()
                    except GetUsernameError:
                        await websocket.send_json({
                            'type': 'error',
                            'error': f'Get username microservice error'})
                        break

                    query = client.query(kind=constants.users)
                    query.add_filter('username', '=', username)
                    results = list(query.fetch())
                    if not results:
                        has_username = True

                if has_username and username:
                    user = datastore.entity.Entity(key=client.key(constants.users))
                    user.update({'username': username, 'table': None})
                    client.put(user)
                    user_id = user.key.id
                    manager.add_user(user_id, websocket)
                    print(f'user_id {user_id} created')
                    await websocket.send_json({'type': 'accept_user', 'username': username, 'user_id': user_id})

            # logout
            elif data['type'] == 'logout':
                if user_id:
                    manager.remove_user(user_id)
                    user_key = client.key(constants.users, user_id)
                    user = client.get(key=user_key)
                    if user:
                        client.delete(user_key)
                        print(f'user_id {user_id} removed')

            # get all tables
            elif data['type'] == 'get_all_tables':
                query = client.query(kind=constants.tables)
                query.add_filter('open', '=', True)
                query.projection = ['X_username', 'O_username']
                results = list(query.fetch())
                for e in results:
                    e['table_id'] = e.key.id
                await websocket.send_json({'type': 'all_tables', 'tables': results})

            # make a table
            elif data['type'] == 'make_table':
                print(f'make_table received')

                user_key = client.key(constants.users, data['user_id'])
                user = client.get(key=user_key)
                if not user:
                    await websocket.send_json({'type': 'error', 'error': 'user does not exist'})
                else:
                    table = datastore.entity.Entity(key=client.key(constants.tables))
                    if data['X'] == "player":
                        table.update({'X': user.key.id, 'X_username': user['username']})
                        if data['O'] == 'vacant':
                            table.update({'open': True, 'O': None, 'O_username': ''})
                        else:
                            table.update({'open': False})
                    else:
                        table.update({'O': user.key.id, 'O_username': user['username']})
                        if data['X'] == 'vacant':
                            table.update({'open': True, 'X': None, 'X_username': ''})
                        else:
                            table.update({'open': False})

                    if table['open']:
                        table.update({'turn': 'X', 'game_state': "         "})
                        client.put(table)
                        table_id = table.key.id
                        user.update({'table': table_id})
                        client.put(user)
                        manager.user_in_game(user.key.id, True)
                        await websocket.send_json({'type': 'accept_table', 'table_id': table_id})
                        await manager.broadcast_tables(True)
                    else:
                        # client code should make this redundant in future update.
                        await websocket.send_json({'type': 'accept_table_ai'})

            # join table
            elif data['type'] == 'join_table':
                table_key = client.key(constants.tables, data['table_id'])
                table = client.get(key=table_key)
                user_key = client.key(constants.users, data['user_id'])
                user = client.get(key=user_key)
                if not user or not table:
                    await websocket.send_json({'type': 'error', 'error': 'user or table does not exist'})
                    continue
                elif table[data['as']] is not None:
                    await websocket.send_json({'type': 'error', 'error': 'position is not vacant'})
                    continue

                table.update({data['as']: user.key.id, data['as'] + '_username': user['username'], 'open': False})
                user.update({'table': table.key.id})
                client.put(table)
                client.put(user)

                opp_as = 'O' if data['as'] == 'X' else 'X'
                opponent_id = table[opp_as]
                next_turn = 'O' if table['turn'] == 'X' else 'X'

                try:
                    if opponent_id:
                        await manager.send_user_json(
                            opponent_id,
                            {'type': 'game_state',
                             'opponent': user['username'], # you are your opponent's opponent.
                             'game_state': table['game_state'] + table['turn'] + next_turn})
                except UserNotConnected:
                    await websocket.send_json({'type': 'error', 'error': 'opponent not connected'})

                await websocket.send_json({'type': 'accept_join', 'table_id': table.key.id})
                await manager.broadcast_tables(True)

            # get singular table upon making or joining.
            elif data['type'] == 'get_table':
                table_key = client.key(constants.tables, data['table_id'])
                table = client.get(key=table_key)
                user_key = client.key(constants.users, data['user_id'])
                user = client.get(key=user_key)
                if not user or not table:
                    await websocket.send_json({'type': 'error', 'error': 'user or table does not exist'})
                    continue
                elif user.key.id == table['X']:
                    player = 'X'
                    opponent = table['O_username']
                elif user.key.id == table['O']:
                    player = 'O'
                    opponent = table['X_username']
                else:
                    await websocket.send_json({'type': 'error', 'error': 'user not at this table'})
                    continue

                game = table['game_state'] + player + table['turn']
                await websocket.send_json({'type': 'game_state', 'opponent': opponent, 'game_state': game})

            # player submits a turn
            elif data['type'] == 'turn':
                table_key = client.key(constants.tables, data['table_id'])
                table = client.get(key=table_key)
                user_key = client.key(constants.users, data['user_id'])
                user = client.get(key=user_key)
                if not user or not table:
                    await websocket.send_json({'type': 'error', 'error': 'user or table does not exist'})
                    continue
                elif user.key.id == table['X']:
                    player = 'X'
                    next_turn = 'O'
                    opponent = table['O_username']
                    opponent_id = table['O']
                elif user.key.id == table['O']:
                    player = 'O'
                    next_turn = 'X'
                    opponent = table['X_username']
                    opponent_id = table['X']
                else:
                    await websocket.send_json({'type': 'error', 'error': 'user not at this table'})
                    continue

                if player != table['turn']:
                    await websocket.send_json({'type': 'error', 'error': 'not your turn'})
                else:
                    game_state_list = list(table['game_state'])
                    if game_state_list[data['square']] == " ":
                        game_state_list[data['square']] = player
                    else:
                        # illegal move
                        await websocket.send_json({'type': 'error','error': 'illegal move'})
                        continue
                    table['game_state'] = "".join(game_state_list)
                    table['turn'] = next_turn
                    client.put(table)

                    try:
                        if opponent_id:
                            await manager.send_user_json(
                                opponent_id,
                                {'type': 'game_state',
                                 'opponent': user['username'], # you are your opponent's opponent.
                                 'game_state': table['game_state'] + next_turn + next_turn})
                    except UserNotConnected:
                        await websocket.send_json({'type': 'error', 'error': 'opponent not connected'})

                    await websocket.send_json({'type': 'game_state', 'opponent': opponent,
                                               'game_state': table['game_state'] + player + next_turn})

    except (WebSocketDisconnect, websockets.exceptions.ConnectionClosedOK):
        if user_id:
            manager.remove_user(user_id)
            user_key = client.key(constants.users, user_id)
            if client.get(key=user_key):
                client.delete(user_key)
                print(f'user id {user_id} removed')


# @app.websocket("/ws/{user_id}")
# async def websocket_endpoint(websocket: WebSocket, username: str):
#     """Attempt websocket connection by user"""
#     username = username.strip()
#     if not re.match(r"^[a-zA-Z0-9 ]*$", username):
#         return json.dumps({'error': f'Username {username} is invalid'}), 400
#     query = client.query(kind=constants.users)
#     query.add_filter("username", "=", username)
#     if query.fetch():
#         return json.dumps({'error': f'Username {username} already in use'}), 403
#
#     user = datastore.entity.Entity(key=client.key(constants.users))
#     user.update({'username': username})
#     client.put(user)
#
#     await manager.connect(websocket)
#     try:
#         while True:
#             data = await websocket.receive_json() #json
#             print(data)
#             if data['type'] == 'ping':
#                 print(f'User {username} pinged.')
#                 await manager.send_message('ping', websocket)
#             # await manager.send_personal_message(f"You wrote: {data}", websocket)
#             # await manager.broadcast(f"Client #{username} says: {data}")
#     except WebSocketDisconnect:
#         manager.disconnect(websocket)
#         client.delete(key=user.key)
#         # await manager.broadcast(f"Client #{username} left the chat")






