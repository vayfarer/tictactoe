# tictactoe
This project is currently in development. I created **tictactoe** as a course project for OSU CS 361 Software Engineering I (Fall 2023). Tictactoe demonstrates a number of technologies including React.js, Python FastAPI, Websockets, and Google Datastore. Users can enter an online game lobby and play tic-tac-toe live against other online users or AI. 

# Software Design Narrative
Several design choices in **tictactoe** were made for exploring and demonstrating technologies and would otherwise appear nonsensical for a tic-tac-toe online lobby. The game itself was chosen because of its simplicity. With unlimited time it would have been interesting to attempt a more complex game such as chinese checkers or go; however I did not want the project to focus on coding game logic. 

### Python FastAPI and React.js
I chose these frameworks because I wanted to learn more about them. 

### Backend instances and scalability
A single **tictactoe** backend instance supports one lobby and stores Websocket objects in memory and coordinates the transmission of game data between the database and two tic-tac-toe players in a game. I run only one instance at a time for the purposes of class. It is likely a single backend instance can support thousands of simultaneous games in a lobby. 

It is fairly simple to run multiple instances of the FastAPI backend. However if there were multiple instances of the FastAPI backend running simultaneously via gunicorn/uvicorn worker processes, each instance would host its own lobby and would not be able to communicate to users connected via websocket to other instances. This is probably an acceptable outcome if there were ever thousands of tic-tac-toe games simultaneously. However a user in such a scenario may want to play games against a specific opponent. In that situation there should be a service to connect users across multiple instances and transfer the user's individual websocket connection from one instance to another in order to play a game against another user on a different instance. 

### Database 
Each connected user and ongoing game is stored in Google Datastore, which is for practice and demonstrational purposes only. I am also in CS 493 Cloud Application Development this term, which is based on Google Cloud Platform products including Datastore. 

User and game information is temporary and is deleted when the user disconnects from the application. Each tic-tac-toe game would be more practically stored in memory, which is much lower latency and less resource intensive.  One effect of using the database is that all backend instances connected to the same database would see the same list of users and games. This would not be the intended behavior of each backend instance being its own lobby. 

An extension of **tictactoe** with an appropriate use of a database would be to store a persistent user account with a record of user games and social connection information (a friends list). 

### AI
I had initially intended for the AI logic to run on the front end at the client computer. There is minimal need to validate inputs in a single-player tic tac toe game, and it would distribute the AI logic computation. However in dicussion with a friend, we reasoned that the AI is hosted on the backend for most common online games (eg. chess).

# How to use
In progress
