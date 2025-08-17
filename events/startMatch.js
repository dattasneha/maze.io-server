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
            gameMode: true
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

    io.to(roomId).emit(SOCKET_EVENTS.MAZE_CREATED, {
        gameMode,
        mazeSize: isMazeSize,
        grid
    });
};
