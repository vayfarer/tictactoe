import React, { useEffect, useState } from 'react';
import { Stack, Box, Button, Grid} from '@mui/material';
import {InputLabel, MenuItem, FormControl, Select} from '@mui/material';


export const MakeTable = ( {sendJsonMessage, userId, setMakingTable} ) => {

    const [player, setPlayer] = useState('X');
    const [opponent, setOpponent] = useState('vacant');

    const changePlayer = (event)=>{
        setPlayer(event.target.value);
    }

    const changeOpponent = (event)=>{
        setOpponent(event.target.value);
    }

    function make_table(event){
        event.preventDefault();
        let tableData = {'type':'make_table',
        'X': null,
        'O': null,
        'user_id': userId}

        if (player === "X"){
            tableData.X = "player";
            tableData.O = opponent;
        } else {
            tableData.X = opponent;
            tableData.O = "player";
        }

        sendJsonMessage(tableData)
    }

    function to_lobby(){
        setMakingTable(false);
    }

    return (
        <>
        <form onSubmit={make_table}>
        <Stack direction={'column'}>
            <Grid container direction={'row'} spacing={2}>
                <Grid item xs={6}>
                <FormControl fullWidth variant='standard'>
                    <InputLabel>Play as</InputLabel>
                    <Select onChange={changePlayer} id="make_table_player"  defaultValue='X'>
                        <MenuItem value="X">X</MenuItem>
                        <MenuItem value="O">O</MenuItem>
                    </Select>
                </FormControl>
                </Grid>
                <Grid item xs={6}>
                <FormControl fullWidth variant='standard'>
                <InputLabel>Select Opponent</InputLabel>
                    <Select onChange={changeOpponent} id="make_table_opponent" defaultValue='vacant'>
                        <MenuItem value={'vacant'}>Human (vacant)</MenuItem>
                        <MenuItem value={'easy_ai'}>Easy AI</MenuItem>
                        <MenuItem value={'hard_ai'}>Hard AI</MenuItem>
                    </Select>
                </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <Button variant='outlined' fullWidth type='submit'>Make Game Table!</Button>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <Button  fullWidth title='Exit making table.' onClick={to_lobby}>Back</Button>
                </Grid>
            </Grid>
        </Stack>
        </form>
        </>
    );
}

export default MakeTable;