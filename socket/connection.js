import { SOCKET_EVENTS } from "../constants/socketEvents.js";
import { handleJoinRoom } from "../events/joinRoom.js";
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

    socket.on(SOCKET_EVENTS.DISCONNECT, async (reason) => {
        console.log(`Socket disconnected:${socket.id},reason:${reason}`);

        const roomMember = await prisma.room.findUnique({
            where: { id: roomId },
            select: {
                _count: {
                    select: { users: true },
                },
            }
        });

        if (!roomMember) return;
        console.log(roomMember);
        if (roomMember?._count.users === 1) {
            await prisma.roomOption.deleteMany({ where: { roomId } });
            await prisma.room.delete({
                where: { id: roomId }
            })
        } else {
            const room = await prisma.room.update({
                where: {
                    id: roomId,
                },
                data: {
                    users: {
                        disconnect: { id: socket.user.id },
                    },
                },
                include: {
                    users: true
                }
            });
            console.log(room);
            console.log("Disconnecting user ID:", socket.user.id);
            io.to(roomId).emit(SOCKET_EVENTS.LEFT_ROOM, room)
        }


    });
}