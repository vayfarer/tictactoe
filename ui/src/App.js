import './App.css';
import React, { useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from "react-use-websocket"

// import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import { Grid } from '@mui/material';
import Button from '@mui/material/Button';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import Login from './screens/login';
import Lobby from './screens/lobby';
import Game from './screens/game';
import MakeTable from './screens/make_table';
import AboutPage from './screens/aboutPage';

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
  const [rematchButton, setRematchButton] = useState('Request Rematch'); 
  const [about, setAbout] = useState(false);
  
  const WS_URL=`ws://ec2-35-89-77-105.us-west-2.compute.amazonaws.com:8000/ws`
  // const WS_URL = `ws://127.0.0.1:8000/ws`
  const [socketUrl, setSocketUrl] = useState(WS_URL);


  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    socketUrl,
    {
      share: true,
      shouldReconnect: () => false,
      onError: () => {console.error("WebSocket error observed.")},
      // onClose: (event) => {
      //   alert("Connection lost, reloading page.");
      //   window.location.reload(false);
      // },
      heartbeat: {
        message: '{"type":"ping"}',
        returnMessage: "ping",
        timeout: 60000, // 60s, if no response is received, the connection will be closed
        interval: 29000, // every 29 seconds, a ping message will be sent
      },
    },
  )

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  useEffect(() => {
    if (readyState === ReadyState.CLOSED){
      alert("Websocket connection lost.");
    }
  }, [readyState])


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
        else {setTurn(false);}
        if (lastJsonMessage.game_state === "         OX" && lastJsonMessage.opponent.slice(4) === "_ai"){console.log('woo');sendJsonMessage({'type':'ai_first_move','user_id':userId, 'table_id':tableId});}
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
        setGameState('         --');
        setTable(false);
        setWinner('');
      }
      else if (lastJsonMessage && lastJsonMessage.type === 'opponent_forfeit'){
        setOppForfeit(true);
      }
      else if (lastJsonMessage && lastJsonMessage.type === 'accept_rematch'){
        sendJsonMessage({'type':'get_table', 'user_id':userId, 'table_id':tableId})
        setWinner('');
        setGameOver(false)
        setRematchButton('Request Rematch')
      }
      else if (lastJsonMessage && lastJsonMessage.type === 'request_rematch'){
        setRematchButton('Accept Rematch')
      }
      else if (lastJsonMessage && lastJsonMessage.type === 'error_rematch'){ 
        alert(lastJsonMessage.error);
        sendJsonMessage({'type': 'leave_table', 'user_id': userId, 'table_id': tableId})
        setWinner('');
      }
      else{
      }
    }
    ,[lastJsonMessage]
  );

  const displayAbout = () => {
    setAbout(!about);
  }

  return (
    <>

  <Container maxWidth="sm">

  {/* <CssBaseline /> */}
    <Grid container>
      <Grid item xs={7}>
        <h1>Tic Tac Toe!</h1>
      </Grid>
    <Grid item xs={4} margin='auto'>Websocket: {connectionStatus}</Grid>
    <Grid item xs={1} margin='auto'>
      <Button onClick={displayAbout} title='How to play, and About'>
        <HelpOutlineIcon fontSize='large'/>
      </Button>
    </Grid>
    </Grid>

    {about && <Stack spacing={2}>
    <AboutPage /> 
    <Button variant='outlined' onClick={displayAbout} title='Close How to play and About'>
    Close
    </Button><br/></Stack>
    }


    {!login && 
    <Login sendJsonMessage={sendJsonMessage} setLogin={setLogin} username={username} setUsername={setUsername} 
    readyState={readyState} />}

    {login && !table && !makingTable && 
    <Lobby setLogin={setLogin} username={username} setUsername={setUsername}
     setTable={setTable} setMakingTable={setMakingTable} sendJsonMessage={sendJsonMessage} tablesList={tablesList} 
     userId={userId} />}

    {table && <Game username={username} setTable={setTable} gameState={gameState} sendJsonMessage={sendJsonMessage} userId={userId}
    tableId={tableId} turn={turn} setTurn={setTurn} opponent={opponent} winner={winner} gameOver={gameOver} oppForfeit={oppForfeit}
    rematchButton={rematchButton} setRematchButton={setRematchButton} />}

    {makingTable === true && <MakeTable sendJsonMessage={sendJsonMessage} userId={userId} setMakingTable={setMakingTable} />}



      <br/>
      <footer>CS 361 project by Michael Chen</footer>
    

    </Container>
    </>
  );
}

export default App;
