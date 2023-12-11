import Stack from '@mui/material/Stack';
import { Box } from '@mui/material';

export const AboutPage = ({}) => {

    return (
        <>
            <Stack>
                <Box>
                    <h2>
                        How to play Tic Tac Toe
                    </h2>
                    <p>
                        Tic-tac-toe is played on a three-by-three square grid by two players. 
                        Players alternately place their marks in one of the nine spaces in the grid. 
                        The convention in this implementation is the player with the first turn places X marks, and the second 
                        player places O marks. 
                        The player who succeeds first in placing three of their marks in a horizontal, vertical, or diagonal 
                        line across the grid is the winner.  
                    </p>
                </Box>
                <Box>
                    <h2>
                        About
                    </h2>
                    This is an OSU CS 361 project by Michael Chen. Visit the&nbsp;
                    <a href='https://github.com/vayfarer/tictactoe'>github page</a> for more information. 

                </Box>
            </Stack>
        </>
    )

}

export default AboutPage;