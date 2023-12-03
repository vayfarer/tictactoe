# Michael Chen
# Users logic for google datastore database.

from google.cloud import datastore
import requests
import constants
import time
from collections import deque
import asyncio
from tictactoe import win_condition, draw_condition, hard_ai, easy_ai


client = datastore.Client()


class GetUsernameError(Exception):
    pass


class UserNotConnected(Exception):
    pass


class UsernameManager():
    def __init__(self):
        """Maintains a cached queue of 10 usernames."""
        self._q_lock = asyncio.Lock()
        self._q = deque()
        self._url = "http://cs361-microservice-404417.wl.r.appspot.com/"
        asyncio.run(self.q_usernames())

    async def q_usernames(self):

        while len(self._q) < 10:
            try:
                print("Requesting username from microservice: GET " + self._url)
                response = requests.get(self._url, timeout=5)
                response.raise_for_status()
                async with self._q_lock:
                    self._q.append(response.json()['username'].strip())
                    print("Response received: " + response.json()['username'])
            except (requests.ConnectionError, requests.exceptions.HTTPError) as error:
                print("username service error:", error)
                print("Trying again in 10 seconds")
                time.sleep(10)

    async def get_username(self, websocket, manager):
        """GET Request to username microservice."""

        url = "http://cs361-microservice-404417.wl.r.appspot.com/"
        has_username = False
        username = None

        while not has_username:
            try:
                async with self._q_lock:
                    username = self._q.popleft()
            except IndexError:
                try:
                    response = requests.get(url, timeout=5)
                    response.raise_for_status()
                    username = response.json()['username'].strip()
                except (requests.ConnectionError, requests.exceptions.HTTPError) as error:
                    print("username service error:", error)

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
            return user_id


def db_delete_user(user_id):
    """Also deletes their present from any related tables."""
    user_key = client.key(constants.users, user_id)
    user = client.get(key=user_key)
    if user:
        if user['table']:
            table_key = client.key(constants.tables, user['table'])
            table = client.get(key=table_key)
            if table:
                if user.key.id == table['X']:
                    table['X'] = None
                    table['X_username'] = ''
                if user.key.id == table['O']:
                    table['O'] = None
                    table['O_username'] = ''
                if table['O'] is None and table['X'] is None:
                    client.delete(table_key)
                    print(f'table id {table.key.id} removed')
                else:
                    table['open'] = True
                    client.put(table)
        client.delete(user_key)
        print(f'user id {user_id} removed')


def db_get_tables():
    query = client.query(kind=constants.tables)
    query.add_filter('open', '=', True)
    query.projection = ['X_username', 'O_username']
    results = list(query.fetch())
    for e in results:
        e['table_id'] = e.key.id
    return results


async def db_make_table(websocket, manager, data):
    """Makes a table for a player"""
    user_key = client.key(constants.users, data['user_id'])
    user = client.get(key=user_key)
    if not user:
        await websocket.send_json({'type': 'error', 'error': 'user does not exist'})
    else:
        table = datastore.entity.Entity(key=client.key(constants.tables))
        table.update({'turn': 'X', 'game_state': "         "})
        if data['X'] == "player":
            table.update({'X': user.key.id, 'X_username': user['username'], 'X_rematch': False})
            if data['O'] == 'vacant':
                table.update({'open': True, 'O': None, 'O_username': ''})
            elif data['O'] == 'easy_ai' or data['O'] ==  'hard_ai':
                table.update({'open': False, 'O': None, 'O_username': data['O']})
            else:
                await websocket.send_json({'type': 'error', 'error': 'Invalid opponent'})
                return
        else:
            table.update({'O': user.key.id, 'O_username': user['username'], 'O_rematch': False})
            if data['X'] == 'vacant':
                table.update({'open': True, 'X': None, 'X_username': ''})
            elif data['X'] == 'easy_ai' or data['X'] == 'hard_ai':
                table.update({'open': False, 'X': None, 'X_username': data['X']})
            else:
                await websocket.send_json({'type': 'error', 'error': 'Invalid opponent'})
                return

        if table:
            client.put(table)
            table_id = table.key.id
            user.update({'table': table_id})
            client.put(user)
            manager.user_in_game(user.key.id, True)
            await websocket.send_json({'type': 'accept_table', 'table_id': table_id})
        else:
            await websocket.send_json({'type': 'accept_table_ai'})


async def db_join_table(websocket, manager, data):
    """User1 joins table created by user2"""
    table_key = client.key(constants.tables, data['table_id'])
    table = client.get(key=table_key)
    user_key = client.key(constants.users, data['user_id'])
    user = client.get(key=user_key)
    if not user or not table:
        await websocket.send_json({'type': 'error', 'error': 'user or table does not exist'})
        return
    elif table[data['as']] is not None:
        await websocket.send_json({'type': 'error', 'error': 'position is not vacant'})
        return

    table.update({data['as']: user.key.id, data['as'] + '_username': user['username'], 'open': False})
    user.update({'table': table.key.id})
    client.put(table)
    client.put(user)

    opp_as = 'O' if data['as'] == 'X' else 'X'
    opponent_id = table[opp_as]
    next_turn = 'O' if table['turn'] == 'X' else 'X'

    if opponent_id:
        try:
            await manager.send_user_json(
                opponent_id,
                {'type': 'game_state',
                 'opponent': user['username'], # you are your opponent's opponent.
                 'game_state': table['game_state'] + table['turn'] + next_turn})
        except UserNotConnected:
            opp_key = client.key(constants.users, user.key.id)
            if client.get(key=opp_key):
                client.delete(opp_key)
            await websocket.send_json({'type': 'error', 'error': 'opponent not connected'})

    await websocket.send_json({'type': 'accept_join', 'table_id': table.key.id})
    await manager.broadcast_tables(True)


async def db_get_table(websocket, data):
    """User get a table upon joining"""
    table_key = client.key(constants.tables, data['table_id'])
    table = client.get(key=table_key)
    user_key = client.key(constants.users, data['user_id'])
    user = client.get(key=user_key)
    if not user or not table:
        await websocket.send_json({'type': 'error', 'error': 'user or table does not exist'})
        return
    elif user.key.id == table['X']:
        player = 'X'
        opponent = table['O_username']
    elif user.key.id == table['O']:
        player = 'O'
        opponent = table['X_username']
    else:
        await websocket.send_json({'type': 'error', 'error': 'user not at this table'})
        return

    game = table['game_state'] + player + table['turn']
    await websocket.send_json({'type': 'game_state', 'opponent': opponent, 'game_state': game,
                               'game_over': False, 'winner': ''})


async def db_game_turn(websocket, manager, data):
    """User submits a turn."""
    table_key = client.key(constants.tables, data['table_id'])
    table = client.get(key=table_key)
    user_key = client.key(constants.users, data['user_id'])
    user = client.get(key=user_key)
    if not user or not table:
        await websocket.send_json({'type': 'error', 'error': 'user or table does not exist'})
        return
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
        return

    if player != table['turn']:
        await websocket.send_json({'type': 'error', 'error': 'not your turn'})
    else:
        game_state_list = list(table['game_state'])
        if game_state_list[data['square']] == " ":
            game_state_list[data['square']] = player
        else:
            # illegal move
            await websocket.send_json({'type': 'error', 'error': 'illegal move'})
            return
        table['game_state'] = "".join(game_state_list)

        # test win condition
        game_over = False
        winner = ''
        if win_condition(player, table['game_state']):
            game_over = True
            winner = user['username']
        # test game over or draw
        if draw_condition(table['game_state']):
            game_over = True

        table['turn'] = next_turn
        client.put(table)

        if opponent_id:
            try:
                await manager.send_user_json(
                    opponent_id,
                    {'type': 'game_state',
                     'opponent': user['username'], # you are your opponent's opponent.
                     'game_state': table['game_state'] + next_turn + next_turn, 'game_over': game_over,
                     'winner': winner})
            except UserNotConnected:
                opp_key = client.key(constants.users, user.key.id)
                if client.get(key=opp_key):
                    client.delete(opp_key)
                await websocket.send_json({'type': 'error', 'error': 'opponent not connected'})

        elif (opponent == 'easy_ai' or opponent == 'hard_ai') and not game_over:
            if opponent == 'easy_ai':
                ai_move = easy_ai(next_turn, data['square'], table['game_state'])
            else:
                ai_move = hard_ai(next_turn, data['square'], table['game_state'])

            game_state_list = list(table['game_state'])
            game_state_list[ai_move] = next_turn
            table['game_state'] = "".join(game_state_list)

            # test win condition
            if win_condition(next_turn, table['game_state']):
                game_over = True
                winner = opponent
            # test game over or draw
            if draw_condition(table['game_state']):
                game_over = True

            next_turn = player # player's turn again
            table['turn'] = next_turn
            client.put(table)


        await websocket.send_json({'type': 'game_state', 'opponent': opponent,
                                   'game_state': table['game_state'] + player + next_turn,
                                   'game_over': game_over, 'winner': winner})


async def leave_table(websocket, manager, data):
    table_key = client.key(constants.tables, data['table_id'])
    table = client.get(key=table_key)
    user_key = client.key(constants.users, data['user_id'])
    user = client.get(key=user_key)
    if not user or not table:
        await websocket.send_json({'type': 'error', 'error': 'user or table does not exist'})
        return
    elif user.key.id == table['X']:
        table['X'] = None
        table['X_username'] = ''
        opponent_id = table['O']
    elif user.key.id == table['O']:
        table['O'] = None
        table['O_username'] = ''
        opponent_id = table['X']
    else:
        await websocket.send_json({'type': 'error', 'error': 'user not at this table'})
        return

    user['table'] = None
    client.put(user)
    client.put(table)
    if table['O'] is None and table['X'] is None:
        # table is empty
        client.delete(table_key)
        print(f'table id {table.key.id} removed')
        await manager.broadcast_tables(False)
    await websocket.send_json({'type': 'accept_leave_table'})

    if opponent_id:
        try:
            await manager.send_user_json(opponent_id, {'type': 'opponent_forfeit'})
        except UserNotConnected:
            opp_key = client.key(constants.users, opponent_id)
            if client.get(key=opp_key):
                client.delete(opp_key)
            client.delete(table_key)
            print(f'table id {table.key.id} removed')
            pass


async def db_rematch_table(websocket, manager, data):
    """Received request for rematch."""
    table_key = client.key(constants.tables, data['table_id'])
    table = client.get(key=table_key)
    user_key = client.key(constants.users, data['user_id'])
    user = client.get(key=user_key)
    if not user or not table:
        await websocket.send_json({'type': 'error', 'error': 'user or table does not exist'})
        return
    elif user.key.id == table['X']:
        player = 'X'
        opponent = 'O'
        opponent_id = table['O']
    elif user.key.id == table['O']:
        player = 'O'
        opponent = 'X'
        opponent_id = table['X']
    else:
        await websocket.send_json({'type': 'error', 'error': 'user not at this table'})
        return

    if not (draw_condition(table['game_state']) or win_condition('O',table['game_state'])
            or win_condition('X', table['game_state'])):
        await websocket.send_json({'type': 'error', 'error': 'game is not over yet.'})
        return

    if table[opponent+'_rematch']:
        # other player already requested rematch
        table.update({'game_state': "         ", 'turn': 'X', 'X_rematch': False, 'O_rematch': False})
        # swap player positions for rematch.
        table['X'], table['X_username'], table['O'], table['O_username'], player \
            = table['O'], table['O_username'], table['X'], table['X_username'], opponent
        client.put(table)
        if opponent_id:
            try:
                await manager.send_user_json(opponent_id, {'type': 'accept_rematch'})
                return
            except UserNotConnected:
                client.delete(table_key)
                opp_key = client.key(constants.users, opponent_id)
                if client.get(key=opp_key):
                    client.delete(opp_key)
                await websocket.send_json({'type': 'error_rematch', 'error': 'rematch opponent not connected'})

    if opponent_id:
        table.update({player+'_rematch': True})
        client.put(table)
        try:
            await manager.send_user_json(opponent_id, {'type': 'request_rematch'})
            return
        except UserNotConnected:
            client.delete(table_key)
            opp_key = client.key(constants.users, opponent_id)
            if client.get(key=opp_key):
                client.delete(opp_key)
            await websocket.send_json({'type': 'error_rematch', 'error': 'rematch opponent not connected'})

    table['X'], table['X_username'], table['O'], table['O_username'], player \
        = table['O'], table['O_username'], table['X'], table['X_username'], opponent
    table.update({opponent: None, opponent+'_username': '', 'turn': 'X', 'open': True})
    client.put(table)
    await websocket.send_json({'type': 'accept_table', 'table_id': table.key.id})
    await manager.broadcast_tables(True)
