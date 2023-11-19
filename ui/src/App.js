import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from "react-use-websocket"

import Login from './screens/login';
import Lobby from './screens/lobby';
import Game from './screens/game';
import MakeTable from './screens/make_table';

function App() {

  const [username, setUsername] = useState('');  
  const [userId, setUserId] = useState(null);
  const [login, setLogin] = useState(false);
  const [tablesList, setTablesList] = useState([]);
  const [table, setTable] = useState(false);
  const [tableId, setTableId] = useState(null);
  const [makingTable, setMakingTable] = useState(false);
  const [gameState, setGameState] = useState("         --");
  const [turn, setTurn] = useState(false);
  const [opponent, setOpponent] = useState('');
  const [winner, setWinner] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [oppForfeit, setOppForfeit] = useState(false);


  const WS_URL = `ws://127.0.0.1:8000/ws`
  const [socketUrl, setSocketUrl] = useState(WS_URL);


  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    socketUrl,
    {
      share: true,
      shouldReconnect: () => false,
      onError: () => {console.error("WebSocket error observed.")},
      heartbeat: {
        message: '{"type":"ping"}',
        returnMessage: "ping",
        timeout: 60000, // 60s, if no response is received, the connection will be closed
        interval: 29000, // every 29 seconds, a ping message will be sent
      },
    },
  )

  useEffect(() => {
      if (lastJsonMessage && lastJsonMessage.type === 'error'){
        alert(lastJsonMessage.error);
      }
      else if (lastJsonMessage && lastJsonMessage.type === 'accept_user'){
        setUsername(lastJsonMessage.username);
        setUserId(lastJsonMessage.user_id);
        sendJsonMessage({'type':'get_all_tables'});
        setLogin(true);
      }      
      else if (lastJsonMessage && lastJsonMessage.type === 'accept_table'){
        setMakingTable(false);
        setTableId(lastJsonMessage.table_id)
        sendJsonMessage({'type':'get_table', 'user_id':userId, 'table_id':lastJsonMessage.table_id})
        setTable(true);
        setOppForfeit(false);
      }
      else if (lastJsonMessage && lastJsonMessage.type === 'game_state'){
        setGameState(lastJsonMessage.game_state);
        setOpponent(lastJsonMessage.opponent);
        setGameOver(lastJsonMessage.game_over);
        if (lastJsonMessage.game_over){setWinner(lastJsonMessage.winner);}
        else if (lastJsonMessage.game_state[9] === lastJsonMessage.game_state[10]){setTurn(true);}
      }
      else if (lastJsonMessage && lastJsonMessage.type === 'all_tables'){
        setTablesList(lastJsonMessage.tables)
      }
      else if (lastJsonMessage && lastJsonMessage.type === 'accept_join'){
        setTableId(lastJsonMessage.table_id)
        sendJsonMessage({'type':'get_table', 'user_id':userId, 'table_id':lastJsonMessage.table_id})
        setTable(true);
        setOppForfeit(false);
      }
      else if (lastJsonMessage && lastJsonMessage.type === 'accept_leave_table'){
        sendJsonMessage({'type':'get_all_tables'});
        setTable(false);
        setWinner('');
      }
      else if (lastJsonMessage && lastJsonMessage.type === 'opponent_forfeit'){
        setOppForfeit(true);
      }
      else{
      }
    }
    ,[lastJsonMessage]
  )




  return (
    <>
    <div className='App'>
      <header>
        <h1>Tic Tac Toe!</h1>
      </header>

    {!login && <Login sendJsonMessage={sendJsonMessage} setLogin={setLogin} username={username} setUsername={setUsername} />}

    {login && !table && !makingTable && 
    <Lobby setLogin={setLogin} username={username} setUsername={setUsername}
     setTable={setTable} setMakingTable={setMakingTable} sendJsonMessage={sendJsonMessage} tablesList={tablesList} 
     userId={userId} />}

    {table && <Game username={username} setTable={setTable} gameState={gameState} sendJsonMessage={sendJsonMessage} userId={userId}
    tableId={tableId} turn={turn} setTurn={setTurn} opponent={opponent} winner={winner} gameOver={gameOver} oppForfeit={oppForfeit}
     />}

    {makingTable === true && <MakeTable sendJsonMessage={sendJsonMessage} userId={userId} setMakingTable={setMakingTable} />}

      <br/>
      <footer>CS 361 project by Michael Chen</footer>
    </div>
    
    </>
  );
}

export default App;
