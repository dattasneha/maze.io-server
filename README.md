# maze.io-server

## Project Overview

This repository contains the server-side implementation for maze.io, a real-time multiplayer maze game. Built with Node.js and JavaScript, the server handles game logic, user authentication, and communication via WebSockets.

## Key Features & Benefits

-   **Real-time Gameplay:**  Provides a seamless and responsive multiplayer maze experience.
-   **Multiple Game Modes:** Supports various game modes, including Maze Duel and Maze Royale.
-   **User Authentication:** Secure user authentication process.
-   **Configurable Game Options:** Offers customizable game settings such as maze size, player count, and visibility.
-   **Scalable Architecture:** Designed for handling a large number of concurrent players.

## Prerequisites & Dependencies

Before you begin, ensure you have the following installed:

-   **Node.js:** (Version >= 14)  Download from [nodejs.org](https://nodejs.org/).
-   **npm:** (Usually bundled with Node.js)
-   **A suitable code editor:** (e.g., VS Code, Sublime Text, Atom)

## Installation & Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/dattasneha/maze.io-server.git
    cd maze.io-server
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure environment variables:**

    -   Create a `.env` file in the root directory.
    -   Copy the contents of `.env.sample` into your `.env` file.
    -   Update the variables with your desired configurations (e.g., `CORS_ORIGIN`).  Example:

        ```
        CORS_ORIGIN=http://localhost:3000
        ```

4.  **Start the server:**

    ```bash
    npm start
    ```

    Or for development with nodemon:

    ```bash
    npm run dev
    ```

    The server should now be running on the specified port (default: 8000, configurable in `.env`).

## API Documentation
### Authentication Routes (/auth)
POST /auth/guest

Login as a guest.

Response
```javascript
{
  "success": true,
  "message": "Guest user created successfully",
  "data": {
    "user": {
      "id": "cl123...",
      "name": "guest_xyz",
      "isGuest": true
    },
    "accessToken": "jwt.token.here"
  }
}
```

POST /auth/login

Convert guest account to permanent or login existing user.

Body
```javascriot
{
  "email": "test@example.com",
  "password": "mypassword"
}
```

Response
```javascript
{
  "success": true,
  "message": "User logged in successfully.",
  "data": {
    "user": {
      "id": "cl123...",
      "email": "test@example.com",
      "isGuest": false
    },
    "accessToken": "jwt.token.here"
  }
}
```
### Game Modes (/game)
GET /game/modes

Fetch all available game modes and their options.

Response
```javascript
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "mode1",
      "name": "Classic",
      "options": [
        { "key": "PLAYERCOUNT", "type": "number", "min": 2, "max": 6 }
      ]
    }
  ]
}
```
### Rooms (/room)
POST /room/create

Create a new game room.

Headers:
Authorization: Bearer <jwt>

Body
```javascript
{
  "name": "My Room",
  "type": "public",
  "selectedMode": "classic_mode_id",
  "options": [
    { "name": "PLAYERCOUNT", "value": 4 }
  ]
}
```

Response
```javascript
{
  "id": "room1",
  "name": "My Room",
  "type": "public",
  "roomCode": "ABC123",
  "users": [{ "id": "user1" }],
  "options": [...]
}
```
POST /room/join?code=ROOMCODE

Join a room by its code.

Headers:
Authorization: Bearer <jwt>

Response
```javascript
{
  "success": true,
  "message": "Room joined successfully!",
  "data": {
    "id": "room1",
    "name": "My Room",
    "users": [{ "id": "user1" }, { "id": "user2" }]
  }
}
```
## Socket.IO Events

The server uses Socket.IO for real-time gameplay (maze duel, player moves, goals, etc).
Clients must connect with a valid roomId and authenticated user attached to the socket.

### Connection

Client connects with query params:
```javascript
const socket = io("http://localhost:5000", {
  query: { roomId: "ROOM_ID" },
  auth: { token: "JWT_ACCESS_TOKEN" }
});
```

On connection:

The socket joins the room (socket.join(roomId)).

The server broadcasts JOIN_ROOM to all clients in the room.

### Socket Events
JOIN_ROOM

Sent by the server when a new player joins.

Payload (example):
```javascript
{
  "id": "room1",
  "users": [
    { "id": "u1", "email": "p1@mail.com", "name": "Player 1" },
    { "id": "u2", "email": "p2@mail.com", "name": "Player 2" }
  ],
  "gameMode": { "id": "classic", "name": "Classic Mode" },
  "options": [...]
}
```
START_MATCH

Client → Server
Trigger maze generation and start match.

socket.emit("START_MATCH");


Server → Clients:
```javascript
{
  "gameMode": "classic",
  "grid": [[1,0,1,0], [0,0,1,0], ...], // maze layout
  "playerMove": [
    { "row": 2, "col": 1, "tag": "userId1" },
    { "row": 5, "col": 3, "tag": "userId2" }
  ]
}

```
Event name: MAZE_CREATED

SELECT_GOAL

Client → Server
Each player selects a goal position for the opponent.

socket.emit("SELECT_GOAL", [row, col]);


Server Responses:

If one goal selected → WAITING_FOR_OPPONENT_GOAL_SELECTION

If both selected → READY_TO_PLAY
```javascript
{
  "playerMove": [
    { "row": 0, "col": 4, "tag": "G-userId1" },
    { "row": 5, "col": 7, "tag": "G-userId2" }
  ]
}
```
MOVE_PLAYER

Client → Server
Make a move to an adjacent cell.

socket.emit("MOVE_PLAYER", [newRow, newCol]);


Server Responses:

PLAYER_MOVED
```javascript
{ "row": 1, "col": 2, "tag": "userId1" }

```
If player reaches goal → GAME_OVER
```javascript
{ "id": "u1", "email": "p1@mail.com", "name": "Winner!" }
```
LEFT_ROOM

Emitted when a player disconnects.
```javascript
{
  "id": "room1",
  "users": [
    { "id": "u2", "name": "Remaining Player" }
  ]
}
```

If no users remain → the room is deleted.

ERROR_MESSAGE

Server emits this event when a validation or game rule fails.

Example:

{ "message": "Invalid move" }


## Configuration Options

The following environment variables can be configured in the `.env` file:

| Variable       | Description                                       | Default Value |
|----------------|---------------------------------------------------|---------------|
| `PORT`         | The port the server listens on.                     | 8000          |
| `CORS_ORIGIN`  | The allowed origin for CORS requests.               | `*`           |

Game-specific options can also be configured when creating a new game room, such as `mazeSize`, `playerCount`, and `visibility`.

## Contributing Guideline

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with descriptive messages.
4.  Submit a pull request.

