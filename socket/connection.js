import { SOCKET_EVENTS } from "../constants/socketEvents.js";
import { handleJoinRoom } from "../events/joinRoom.js";
import { startMatch } from "../events/startMatch.js";

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

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
        console.log(`Socket disconnected:${socket.id},reason:${reason}`);
    });
}