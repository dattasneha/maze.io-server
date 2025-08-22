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
            options: true
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
    const playerMove = await prisma.playerMove.create({
        data: {
            roomId: roomId,
            selectedMode: room.selectedMode,
            row: position[0],
            col: position[1],
            tag: `G-${otherPlayer.id}`
        }
    });


    const goals = await prisma.playerMove.findMany({
        where: {
            roomId,
            tag: { startsWith: 'G-' }
        }
    });

    if (goals.length == 2) {
        io.to(roomId).emit(SOCKET_EVENTS.READY_TO_PLAY, {
            goals
        });
    } else {
        io.to(roomId).emit(SOCKET_EVENTS.WAITING_FOR_OPPONENT_GOAL_SELECTION);
    }

}