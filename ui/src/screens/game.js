import React, { useEffect, useState } from 'react';

export const Game = ( {username, opponent, setTable, gameState, sendJsonMessage, userId, tableId, turn, setTurn} ) => {

    function leave_table(){
        if (window.confirm('Are you sure? Leaving the table will forfeit the game')) {
            setTable(null)
        } 
    }

    function move(square){
        if (turn){
            setTurn(false);
            sendJsonMessage({'type': 'turn', 'user_id': userId, 'table_id': tableId, 'square':square})
        }
        else{
            // It is not your turn!!
        }
    }

    return (
        <>
        <p>
            Logged in as <b>{username}</b> <br/>
            You are player <b>{gameState[9]}</b>. It is {!turn &&<>not</>} your turn.<br/>
            {opponent===""? <>Waiting for opponent to join.</> : <>Your opponent is {opponent}</>}
        </p>
        
        <p>
            <button title='Forfeit and leave tic tac toe table. (not fully implemented)' onClick={leave_table}>Back</button>
        </p>


        <div className="board-area">
            <table className="board">
            <tbody>
            <tr>
                <td onClick={()=>move(0)} className={gameState[0]!==" "? "" : "empty"}> {gameState[0]} </td>
                <td onClick={()=>move(1)} className={gameState[1]!==" "? "" : "empty"}> {gameState[1]} </td>
                <td onClick={()=>move(2)} className={gameState[2]!==" "? "" : "empty"}> {gameState[2]} </td>
            </tr>
            <tr>
                <td onClick={()=>move(3)} className={gameState[3]!==" "? "" : "empty"}> {gameState[3]} </td>
                <td onClick={()=>move(4)} className={gameState[4]!==" "? "" : "empty"}> {gameState[4]} </td>
                <td onClick={()=>move(5)} className={gameState[5]!==" "? "" : "empty"}> {gameState[5]} </td>
            </tr>
            <tr>
                <td onClick={()=>move(6)} className={gameState[6]!==" "? "" : "empty"}> {gameState[6]} </td>
                <td onClick={()=>move(7)} className={gameState[7]!==" "? "" : "empty"}> {gameState[7]} </td>
                <td onClick={()=>move(8)} className={gameState[8]!==" "? "" : "empty"}> {gameState[8]} </td>
            </tr>
            </tbody>
            </table>
        </div>

        <p></p>
        </>
    );
}

export default Game;