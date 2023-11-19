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
            <p>11/13/2023: Backend login implemented.</p>
            <p>11/6/2023: UI without backend.</p>
        </>
    );
}

export default Login;