import jwt from "jsonwebtoken";
import { prisma } from "../utils/prismaClient.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJwt = asyncHandler(async (socket, next) => {
    try {

        const token = socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization?.replace("Bearer ", "");

        if (!token) {
            console.log("No token provided");
            return next(new Error("No token provided"));
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userId = decodedToken?.id;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            console.log("No user in token DB");
            return next(new Error("Invalid token payload"));
        }

        socket.user = user;
        next();
    } catch (error) {
        console.error("JWT verification error:", error);
        next(new Error("Authentication failed"));
    }
});