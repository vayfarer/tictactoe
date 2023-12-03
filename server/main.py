# Michael Chen
# CS361
# Tic Tac Toe backend
import websockets.exceptions
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from google.cloud import datastore
import json
import constants
import time
from tictactoe import win_condition, draw_condition, hard_ai, easy_ai
from db import (db_delete_user, db_get_tables, db_make_table, db_join_table,
                db_get_table, db_game_turn, UsernameManager, leave_table,
                db_rematch_table)

client = datastore.Client()
app = FastAPI()


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
        if user_id in self._active_users:
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
usernames = UsernameManager()


@app.get("/")
async def get():
    return HTMLResponse("Hello world!")


@app.get("/delete")
async def get():
    """Convenient function to empty the database during development."""
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
                user_id = await usernames.get_username(websocket, manager)
                await usernames.q_usernames()
            # logout
            elif data['type'] == 'logout':
                if user_id:
                    manager.remove_user(user_id)
                    db_delete_user(user_id)

            # get all tables
            elif data['type'] == 'get_all_tables':
                await websocket.send_json({'type': 'all_tables', 'tables': db_get_tables()})

            # make a table
            elif data['type'] == 'make_table':
                print(f'make_table received')
                await db_make_table(websocket, manager, data)

            # join table
            elif data['type'] == 'join_table':
                await db_join_table(websocket, manager, data)

            # get singular table upon making or joining.
            elif data['type'] == 'get_table':
                await db_get_table(websocket, data)

            # player submits a turn
            elif data['type'] == 'turn':
                await db_game_turn(websocket, manager, data)

            # player requests a rematch
            elif data['type'] == 'rematch':
                await db_rematch_table(websocket, manager, data)

            # player leaves a table
            elif data['type'] == 'leave_table':
                await leave_table(websocket, manager, data)

    except (WebSocketDisconnect, websockets.exceptions.ConnectionClosedOK):
        if user_id:
            manager.remove_user(user_id)
            db_delete_user(user_id)





