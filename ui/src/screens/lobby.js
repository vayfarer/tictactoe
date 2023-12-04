import React, { useEffect, useState } from 'react';

import { Stack, Box, Button, Grid} from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


export const Lobby = ( {setLogin, username, setUsername, userId, setMakingTable, sendJsonMessage, tablesList} ) => {

    function logout() {
        sendJsonMessage({'type': 'logout'});
        setLogin(false);
        setUsername('');
    }

    function playAI() {
        
        let tableData = {'type':'make_table',
        'X': 'player',
        'O': 'easy_ai',
        'user_id': userId}
        if (Math.floor(Math.random() * 2)){
            tableData.O = 'player'
            tableData.X = 'easy_ai'
        }
        sendJsonMessage(tableData)
    }

    function makeTable() {
        setMakingTable(true);
    }

    function getAllTables() {
        sendJsonMessage({'type': 'get_all_tables'});
    }

    function joinTable(as, tableId) {
        sendJsonMessage({'type': 'join_table', 'as': as, 'user_id': userId, 'table_id': tableId});

    }

    return (
        <>
            <Box>
            Logged in as <b>{username}</b> <br/>
            </Box>
            <Stack direction={'column'} spacing={2}>
                <Grid container spacing={2} direction="row">
                    <Grid item xs>
                    <Button fullWidth variant='contained' title='Play against easy AI immediately' onClick={playAI}><b>Play Now vs AI</b></Button>
                    </Grid>
                    <Grid item xs>
                    <Button fullWidth variant='outlined' title='Make a game table' onClick={makeTable}>Make a table</Button>
                    </Grid>
                    <Grid item xs>
                    <Button fullWidth variant='outlined' title='Leave tic tac toe lobby.' onClick={logout}>Back</Button>
                    </Grid>
                </Grid>

                <Box>
                    <LobbyList tablesList={tablesList} joinTable={joinTable} />
                </Box>

            <Button variant='outlined' title='Refresh the list of game tables.' onClick={getAllTables}>Refresh</Button>
            </Stack>

        </>
    );
}

const LobbyList = ({tablesList, joinTable}) => {
    return (
        <>
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell align='left'>Table</TableCell>
                        <TableCell align='right'>Player X</TableCell>
                        <TableCell align='right'>Player O</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tablesList.length ? tablesList.map((tableRow, i) => <LobbyRow tableRow={tableRow}
                    key={i} joinTable={joinTable} />) : <><TableRow><TableCell colSpan={3}>No games available to join! Why don't you make one?</TableCell></TableRow></>}
                </TableBody>
            </Table>
        </TableContainer>
        </>
    );
}


const LobbyRow = ({ tableRow, joinTable }) => {

    return (
        <TableRow>
            <TableCell>{tableRow.table_id}</TableCell>
            <TableCell align='right'>{(tableRow.X_username !== "") ? tableRow.X_username : <Button onClick={()=>joinTable('X', tableRow.table_id)} title='Join game as Player X'>Join</Button>}</TableCell>
            <TableCell align='right'>{(tableRow.O_username !== "") ? tableRow.O_username : <Button onClick={()=>joinTable('O', tableRow.table_id)} title='Join game as Player O'>Join</Button>}</TableCell>
        </TableRow>
    );
}

export default Lobby;