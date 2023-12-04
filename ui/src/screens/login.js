import React, { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';

export const Login = ( {sendJsonMessage} ) => {

    function play_game(){
        sendJsonMessage(
            {'type':'login'}
            )
    }

    return (
        <>
            <Stack spacing={2} direction="column">
            <Button size="large" variant="contained" 
            title='Enter the game lobby. You will be assigned a random username'
             onClick={play_game}>Play Tic Tac Toe!</Button>

            <List
            sx={{
                width: '100%',
                // maxWidth: 360,
                bgcolor: 'background.paper',
                position: 'relative',
                overflow: 'auto',
                maxHeight: 300,
                '& ul': { padding: 0 },
            }}
            subheader={<ListSubheader>Updates and new features</ListSubheader>}
            >
                <ListItem>
                <ListItemText primary="Implemented rematching. Updated UI with Material-UI. Implemented Play Now vs (easy) AI." secondary="12/03/2023" />
                </ListItem>
                <ListItem>
                <ListItemText primary="Added easy and hard AI" secondary="11/27/2023" />
                </ListItem>
                <ListItem>
                <ListItemText primary="Implemented backend logic for win conditions, 
                game over conditions, leaving game, and forfeiting" secondary="11/19/2023" />
                </ListItem>
                <ListItem>
                <ListItemText primary="Hosted on AWS EC2 instance. Implemented backend 
                logic for game board." secondary="11/18/2023" />
                </ListItem>
                <ListItem>
                <ListItemText primary="Implemented backend logic for logging in." secondary="11/13/2023" />
                </ListItem>
                <ListItem>
                <ListItemText primary="Created React.js app for front end." secondary="11/06/2023" />
                </ListItem>
            
            </List>
            </Stack>
        </>
    );
}

export default Login;