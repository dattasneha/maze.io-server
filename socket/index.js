import { Server } from "socket.io";
import { SOCKET_EVENTS } from "../constants/socketEvents.js";
import { handleConnction } from "./connection.js";
import { verifyJwt } from "../middlewares/authSocket.middleware.js";

let io;

export const initSocketServer = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        }
    });

    io.use(verifyJwt);
    io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
        handleConnction(socket, io);
    });

    return io;
}

export const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};