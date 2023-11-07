import React, { useEffect, useState } from 'react';

export const Game = ( {username, set_table} ) => {

    const game_state = {'0':'X','1':'O','2':null,'3':'O','4':'X','5':null,'6':null,'7':null,'8':null}

    function leave_table(){
        // let forfeit = window.confirm('Are you sure? Leaving the table will forfeit the game')
        if (window.confirm('Are you sure? Leaving the table will forfeit the game')) {
            set_table(null)
        } 
    }

    // useEffect(() => {
    //     loadCustomers();
    // }, []);

    return (
        <>
        <p>
            Logged in as <b>{username}</b> <br/>
            You are playing as [X, O]
        </p>
        
        <p>
            <button title='Forfeit and leave tic tac toe table.' onClick={leave_table}>Back</button>
        </p>


        <div class="board-area">
        <p>
            <table class="board">
            <tr>
                <td class={game_state['0']? "" : "empty"}>  {game_state['0']} </td>
                <td class={game_state['1']? "" : "empty"}> {game_state['1']} </td>
                <td class={game_state['2']? "" : "empty"}> {game_state['2']} </td>
            </tr>
            <tr>
                <td class={game_state['3']? "" : "empty"}> {game_state['3']} </td>
                <td class={game_state['4']? "" : "empty"}> {game_state['4']} </td>
                <td class={game_state['5']? "" : "empty"}> {game_state['5']} </td>
            </tr>
            <tr>
                <td class={game_state['6']? "" : "empty"}> {game_state['6']} </td>
                <td class={game_state['7']? "" : "empty"}> {game_state['7']} </td>
                <td class={game_state['8']? "" : "empty"}> {game_state['8']} </td>
            </tr>
            </table>
        </p>
        </div>
        </>
    );
}

export default Game;