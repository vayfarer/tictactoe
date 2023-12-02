import React, { useEffect, useState } from 'react';

export const MakeTable = ( {sendJsonMessage, userId, setMakingTable} ) => {

    function make_table(event){
        event.preventDefault();
        let tableData = {'type':'make_table',
        'X': null,
        'O': null,
        'user_id': userId}

        if (document.getElementById('make_table_player').value === "X"){
            tableData.X = "player";
            tableData.O = document.getElementById('make_table_opponent').value;
        } else {
            tableData.X = document.getElementById('make_table_opponent').value;
            tableData.O = "player";
        }

        sendJsonMessage(tableData)
    }

    function to_lobby(){
        setMakingTable(false);
    }

    return (
        <>
        <form onSubmit={make_table}>
            <div>
            <span>
            Play As:&nbsp;
            </span>
            <span>
                <select id="make_table_player">
                <option value="X">X</option>
                <option value="O">O</option>
            </select>
            </span></div>
            <div><span>
            Opponent:&nbsp;
            </span><span>
            <select id="make_table_opponent">
                <option value="vacant">Vacant</option>
                <option value="easy_ai">Easy AI</option>
                <option value="hard_ai">Hard AI</option>
            </select>
            </span></div>
            <button type="submit">Make Game Table!</button>
            <button title='Exit making table.' onClick={to_lobby}>Back</button>
            </form>

            <p>AI not implemented yet.</p>
        </>
    );
}

export default MakeTable;