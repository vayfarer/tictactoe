import React, { useEffect, useState } from 'react';

export const Login = ( {sendJsonMessage} ) => {

    function play_game(){
        sendJsonMessage(
            {'type':'login'}
            )
    }

    return (
        <>
            <p>
            <button title='Enter the game lobby. You will be assigned a random username'
             onClick={play_game}>Play Tic Tac Toe!</button>
            </p>
            <p>Updates and new features:</p>
            <p>11/19/2023: Implemented backend logic for win conditions, game over conditions, leaving game, and forfeiting. </p>
            <p>11/18/2023: Hosted on AWS EC2 instance. Implemented backend logic for game board. </p>
            <p>11/13/2023: Backend login implemented. </p>
            <p>11/6/2023: UI without backend.</p>
        </>
    );
}

export default Login;