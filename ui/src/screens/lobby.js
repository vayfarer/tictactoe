import React, { useEffect, useState } from 'react';

export const Lobby = ( {setLogin, username, setUsername, userId, setMakingTable, sendJsonMessage, tablesList} ) => {

    function logout() {
        sendJsonMessage({'type': 'logout'});
        setLogin(false);
        setUsername('');
    }

    function joinRandom() {

    }

    function makeTable() {
        setMakingTable(true);
    }

    function getAllTables() {
        sendJsonMessage({'type': 'get_all_tables'});
    }

    function joinTable(as, tableId) {
        sendJsonMessage({'type': 'join_table', 'as': as, 'user_id': userId, 'table_id': tableId});

    }

    return (
        <>
            <p>
            Logged in as <b>{username}</b> <br/>
            </p>
            <p>
            <button title='Join a game immediately! (not implemented)' onClick={joinRandom}><b>Play Now!</b></button>&nbsp;
            <button title='Make a game table' onClick={makeTable}>Make a table</button>&nbsp;
            <button title='Leave tic tac toe lobby.' onClick={logout}>Back</button>
            </p>
            <div className='App'><LobbyList tablesList={tablesList} joinTable={joinTable} /></div>

            <button title='Refresh the list of game tables.' onClick={getAllTables}>Refresh</button>


        </>
    );
}

const LobbyList = ({tablesList, joinTable}) => {
    return (
        <table className="entity">
            <thead>
                <tr>
                    <th>Table</th>
                    <th>Player X</th>
                    <th>Player O</th>
                </tr>
            </thead>
            <tbody>
                {tablesList.map((tableRow, i) => <LobbyRow tableRow={tableRow}
                    key={i} joinTable={joinTable} />)}
            </tbody>
        </table>
    );
}


const LobbyRow = ({ tableRow, joinTable }) => {

    return (
        <tr>
            <td>{tableRow.table_id}</td>
            <td>{(tableRow.X_username !== "") ? tableRow.X_username : <button onClick={()=>joinTable('X', tableRow.table_id)} title='Join game as Player X'>Join</button>}</td>
            <td>{(tableRow.O_username !== "") ? tableRow.O_username : <button onClick={()=>joinTable('O', tableRow.table_id)} title='Join game as Player O'>Join</button>}</td>
        </tr>
    );
}

export default Lobby;