import React, { useEffect, useState } from 'react';
import { Stack, Box, Button, Grid} from '@mui/material';

export const Game = ( {username, opponent, setTable, gameState, sendJsonMessage, userId, tableId, turn, setTurn,
    winner, gameOver, oppForfeit, rematchButton, setRematchButton, } ) => {

    function leave_table(){
        if (oppForfeit || gameOver || opponent === ''){
            sendJsonMessage({'type': 'leave_table', 'user_id': userId, 'table_id': tableId})
        }
        else if (window.confirm('Are you sure? Leaving the table will forfeit the game')) {
            sendJsonMessage({'type': 'leave_table', 'user_id': userId, 'table_id': tableId})
        } 
    }    

    function requestRematch(){
        sendJsonMessage({'type': 'rematch', 'user_id': userId, 'table_id': tableId})
        setRematchButton('Rematch Requested')
    }

    function move(square){
        if (turn && !gameOver && !oppForfeit){
            // setTurn(false);
            sendJsonMessage({'type': 'turn', 'user_id': userId, 'table_id': tableId, 'square':square})
        }
        else{
            // It is not your turn!!
        }
    }


    return (
        <>
        <Stack direction={'column'} spacing={2}>
        <Box>
            Logged in as <b>{username}</b> <br/>
            {!gameOver && <>You are player <b>{gameState[9]}</b>. It is {!turn &&<>not</>} your turn.<br/>
            {opponent===""? <>Waiting for opponent to join.</> : !oppForfeit&&<>Your opponent is {opponent}</>}<br/></>}
            {!gameOver && oppForfeit && <>{opponent} has left the game and forfeited.<br/>
            </>}
            {gameOver && (winner===''? <><b>Game over in draw!</b></>:<><b>Game over!<br/> {winner} is victorious!</b></>)}
        </Box>
        
        <Box>
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
        </Box>
        <Grid container>{ gameOver && <>
            <Grid item xs>
            <Button variant='outlined' fullWidth title='Request Rematch.' onClick={requestRematch}>{rematchButton}</Button>
            </Grid></>}
            <Grid item xs>
            <Button fullWidth variant={oppForfeit?'contained':'text'} title='Leave tic tac toe game.' onClick={leave_table}>Back to Lobby</Button>
            </Grid>
        </Grid>
        </Stack>

        </>
    );
}

export default Game;