import { SOCKET_EVENTS } from "../constants/socketEvents.js";
import { handleJoinRoom } from "../events/joinRoom.js";
import { selectGoal } from "../events/mazeDuelEvents.js";
import { startMatch } from "../events/startMatch.js";
import { prisma } from "../utils/prismaClient.js";

export const handleConnction = (socket, io) => {
    console.log(`Socket connected:${socket.id}`);

    const { roomId } = socket.handshake.query;

    if (!roomId) {
        socket.disconnect();
        return;
    }
    socket.join(roomId);

    handleJoinRoom(socket, io, { roomId: roomId, player: socket.user });

    socket.on(SOCKET_EVENTS.START_MATCH, async () => {
        console.log("START_MATCH event received");
        await startMatch(socket, io, { roomId: roomId });
    });
    socket.on(SOCKET_EVENTS.SELECT_GOAL, async (data) => {
        console.log("SELECT_GOAL event received");
        await selectGoal(socket, io, {
            roomId: roomId,
            position: data,
            userId: socket.user.id
        });
    });
    socket.on(SOCKET_EVENTS.DISCONNECT, async (reason) => {
        console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`);

        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: { users: true }
        });

        if (!room) return;

        // Remove user from room
        await prisma.room.update({
            where: { id: roomId },
            data: { users: { disconnect: { id: socket.user.id } } }
        });

        // Re-fetch room to get current users
        const updatedRoom = await prisma.room.findUnique({
            where: { id: roomId },
            include: {
                users: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                },
                gameMode: true,
                options: true
            }
        });

        // If no users left, delete room and its options
        if (room.users.length < 1) {
            await prisma.roomOption.deleteMany({ where: { roomId } });
            await prisma.room.delete({ where: { id: roomId } });
            console.log(`Room ${roomId} deleted`);
        } else {
            console.log(updatedRoom);
            io.to(roomId).emit(SOCKET_EVENTS.LEFT_ROOM, { updatedRoom });
        }
    });
}