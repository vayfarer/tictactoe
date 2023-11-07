import React, { useEffect, useState } from 'react';

export const Login = ( {set_login, username, set_username} ) => {


    function random_name(){
        set_username('A random name!');
    }

    function play_game(){
        if (username === ''){
            alert('Username is required.');
        }
        else {
            set_login(true)
        }
    }



    // useEffect(() => {
    //     loadCustomers();
    // }, []);

    return (
        <>
            <p>
            Username:&nbsp;
            <input
                type="text"
                placeholder="(Required)"
                value={username}
                onChange={e => set_username(e.target.value)} />
                &nbsp;
            OR&nbsp;
            <button title='Generate a random name' onClick={random_name}>Random Name</button>
            </p>
            <p>
            <button title='Enter the game lobby' onClick={play_game}>Play Tic Tac Toe!</button>
            </p>
            <p>Updates and new features:</p>
            <p>11/6/2023: UI without backend.</p>
        </>
    );
}

export default Login;