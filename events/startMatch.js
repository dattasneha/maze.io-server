import { SOCKET_EVENTS } from "../constants/socketEvents.js";
import { mazeSize as mazeSizeConfig } from "../constants/mazeSize.js"
import { recursiveDivisionMaze } from "../utils/maze.js";
import { createMazeArray } from "../utils/converter.js";
import { prisma } from "../utils/prismaClient.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const startMatch = async (socket, io, { roomId }) => {

    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            creator: true,
            gameMode: true,
            users: true
        }
    });

    if (!room) {
        socket.emit('error-message', { message: 'Room not found.' });
        return;
    }

    const mazeSizeOption = await prisma.roomOption.findFirst({
        where: {
            roomId: roomId,
            name: "mazeSize"
        }
    });
    console.log(mazeSizeOption);
    const gameMode = room.selectedMode;
    const mazeSize = mazeSizeOption?.value;


    const isGameMode = mazeSizeConfig[gameMode];
    if (!isGameMode) {
        socket.emit('error-message', { message: 'Invalid game mode.' });
        return;
    }

    const isMazeSize = isGameMode[mazeSize];
    if (!isMazeSize) {
        socket.emit('error-message', { message: 'Invalid maze size.' });
        return;
    }

    const array = Array.from({ length: isMazeSize.row }, () =>
        Array(isMazeSize.col).fill(0)
    );
    const maze = recursiveDivisionMaze(array);
    const grid = createMazeArray(isMazeSize.row, isMazeSize.col, maze);

    for (let r = 0; r < isMazeSize.row; r++) {
        grid[r][0] = 1;
        grid[r][isMazeSize.col - 1] = 1;
    }
    for (let c = 0; c < isMazeSize.col; c++) {
        grid[0][c] = 1;
        grid[isMazeSize.row - 1][c] = 1;
    }
    await prisma.room.update({
        where: { id: roomId },
        data: {
            mazeLayout: grid
        }
    });

    const players = room.users;
    const playerPositions = Array.from({ length: players.length }, () => [0, 0]);

    for (let i = 0; i < players.length; i++) {
        let placed = false;

        while (!placed) {
            const r = Math.floor(Math.random() * isMazeSize.row);
            const c = Math.floor(Math.random() * isMazeSize.col);

            // Check if cell is open and not already taken
            if (grid[r][c] === 0 && !playerPositions.some(pos => pos[0] === r && pos[1] === c)) {
                playerPositions[i] = [r, c];
                placed = true;
            }
        }
    }
    console.log(room)
    await Promise.all(players.map((player, index) =>
        prisma.playerMove.create({
            data: {
                roomId,
                selectedMode: gameMode,
                row: playerPositions[index][0],
                col: playerPositions[index][1],
                tag: player.id,
            },
        })
    ));


    io.to(roomId).emit(SOCKET_EVENTS.MAZE_CREATED, {
        gameMode,
        mazeSize: isMazeSize,
        grid
    });
};
