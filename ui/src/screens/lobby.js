import React, { useEffect, useState } from 'react';

export const Lobby = ( {set_login, username, set_username, set_table, set_make_table} ) => {

    const tables_list = [
        {id:123,x:'Abe',o:'vacant'},
        {id:124,x:'vacant',o:'Julie'}
    ]

    function logout(){
        set_login(false);
        set_username('');
    }

    function join_random(){

    }



    // useEffect(() => {
    //     loadCustomers();
    // }, []);

    return (
        <>
            <p>
            Logged in as <b>{username}</b> <br/>
            (user identification eventually to be validated by back end)
            </p>
            <p>
            <button title='Join a game immediately! (not implemented)' onClick={join_random}><b>Play Now!</b></button>&nbsp;
            <button title='Make a game table (not implemented)' onClick={join_random}>Make a table</button>&nbsp;
            <button title='Leave tic tac toe lobby.' onClick={logout}>Back</button>
            </p>
            {/* <h2>Game Lobby</h2> */}
            <div className='App'><LobbyList tables_list={tables_list} set_table={set_table} /></div>
        </>
    );
}

const LobbyList = ({tables_list, set_table}) => {
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
                {tables_list.map((table_row, i) => <LobbyRow table_row={table_row}
                    key={i} set_table={set_table}/>)}
            </tbody>
        </table>
    );
}


const LobbyRow = ({ table_row, set_table }) => {

    function sit_table(){
        set_table(table_row.id);
    }

    return (
        <tr>
            <td>{table_row.id}</td>
            <td>{(table_row.x !== 'vacant') ? table_row.x : <button onClick={sit_table} title='Join game as Player X'>Join</button>}</td>
            <td>{(table_row.o !== 'vacant') ? table_row.o : <button onClick={sit_table} title='Join game as Player O'>Join</button>}</td>
        </tr>
    );
}

export default Lobby;