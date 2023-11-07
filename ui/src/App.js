import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';

import Login from './screens/login';
import Lobby from './screens/lobby';
import Game from './screens/game';

function App() {

  const [username, set_username] = useState('');  
  const [login, set_login] = useState(false)
  const [table, set_table] = useState(null);
  const [make_table, set_make_table] = useState(false);

  return (
    <>
    <div className='App'>
      <header>
        <h1>Tic Tac Toe!</h1>
      </header>

    {!login && <Login set_login={set_login} username={username} set_username={set_username} />}

    {login && table === null && !make_table && 
    <Lobby set_login={set_login} username={username} set_username={set_username}
     set_table={set_table} set_make_table={set_make_table}/>}

    {table !== null && <Game username={username} set_table={set_table} />}

    {make_table === true && <p>Make table</p>}


      <footer>CS 361 project by Michael Chen</footer>
    </div>
    
    </>
  );
}

export default App;
