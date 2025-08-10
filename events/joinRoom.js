import { RoomOptionType } from "@prisma/client";
import { SOCKET_EVENTS } from "../constants/socketEvents.js";
import { prisma } from "../utils/prismaClient.js";

export const handleJoinRoom = async (socket, io, { roomId, player }) => {
    console.log(`${player} joined room ${roomId}`);
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            users: {
                select: {
                    id: true,
                    email: true,
                    name: true
                }
            },
            gameMode: true
        },
    });
    if (!room) {
        socket.disconnect();
        return;
    }

    io.to(roomId).emit(SOCKET_EVENTS.JOIN_ROOM, room);
}