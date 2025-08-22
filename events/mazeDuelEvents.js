import { SOCKET_EVENTS } from "../constants/socketEvents.js";
import { prisma } from "../utils/prismaClient.js";

export const selectGoal = async (socket, io, { roomId, position, userId }) => {

    if (typeof position === "string") {
        try {
            position = JSON.parse(position);
        } catch (err) {
            socket.emit('error-message', { message: 'Invalid position format' });
            return;
        }
    }
    if (!Array.isArray(position) || position.length !== 2) {
        socket.emit('error-message', { message: 'Goal position must be a [row, col] array.' });
        return;
    }
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            users: { select: { id: true, email: true, name: true } },
            gameMode: true,
            options: true,

        },
    });
    if (!room) {
        return;
    }

    if (room.mazeLayout[position[0]][position[1]] === 1) {
        socket.emit('error-message', { message: 'Can not set wall as a goal position.' });
        return;
    }
    const otherPlayer = room.users.find(player => player.id !== userId);

    if (!otherPlayer) {
        socket.emit('error-message', { message: 'No opponent found to assign goal.' });
        return;
    }
    const goals = await prisma.playerMove.findMany({
        where: {
            roomId,
            tag: { startsWith: 'G-' }
        }
    });
    console.log(goals);
    if (goals === undefined || goals.length < 2) {
        await prisma.playerMove.create({
            data: {
                roomId: roomId,
                selectedMode: room.selectedMode,
                row: position[0],
                col: position[1],
                tag: `G-${otherPlayer.id}`
            }
        });
    }
    const playerMove = await prisma.playerMove.findMany({
        where: {
            roomId,
            tag: { startsWith: 'G-' }
        }
    });

    if (playerMove.length === 2) {
        io.to(roomId).emit(SOCKET_EVENTS.READY_TO_PLAY, {
            playerMove
        });
    }
    if (playerMove.length === 1) {
        io.to(roomId).emit(SOCKET_EVENTS.WAITING_FOR_OPPONENT_GOAL_SELECTION);
    }

}

export const movePlayer = async (socket, io, { roomId, position, userId }) => {
    if (typeof position === "string") {
        try {
            position = JSON.parse(position);
        } catch (err) {
            socket.emit(SOCKET_EVENTS.ERROR_MESSAGE, { message: 'Invalid position format' });
            return;
        }
    }
    if (!Array.isArray(position) || position.length !== 2) {
        socket.emit(SOCKET_EVENTS.ERROR_MESSAGE, { message: 'Goal position must be a [row, col] array.' });
        return;
    }

    if (grid[position[0]][position[1]] != 0) {
        socket.emit(SOCKET_EVENTS.ERROR_MESSAGE, { message: 'Wall is not a valid move' });
        return;
    }
    const room = await prisma.room.findUnique({
        where: { id: roomId }
    })
    const currentPos = await prisma.playerMove.findFirst({
        where: {
            roomId: roomId,
            selectedMode: room.selectedMode,
            tag: userId
        }
    });

    const dr = [0, -1, 0, 1];
    const dc = [-1, 0, 1, 0];

    for (let i = 0; i < 4; i++) {
        if (currentPos?.row + dr[i] != position[0] || currentPos?.col + dc[i] != position[1]) {
            socket.emit(SOCKET_EVENTS.ERROR_MESSAGE, { message: 'Invalid move' });
            return;
        }
    }

    const playerMove = await prisma.playerMove.update({
        where: { id: currentPos.id },
        data: {
            row: position[0],
            col: position[1]
        }
    });

    io.to(roomId).emit(SOCKET_EVENTS.PLAYER_MOVED, playerMove);

    const isGoal = await prisma.playerMove.findFirst({
        roomId: roomId,
        selectedMode: room.selectedMode,
        tag: `G-${userId}`
    });

    if (isGoal?.row == position[0] && isGoal?.col == position[1]) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        io.to(roomId).emit(SOCKET_EVENTS.GAME_OVER, user);
    }

    await prisma.room.delete({
        where: { id: roomId }
    });
}