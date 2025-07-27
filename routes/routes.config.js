import express from "express";
import authRouter from "./auth.routes.js"
import gameModeRouter from "./gameModes.routes.js"
import RoomRouter from "./room.routes.js"

const routes = new express.Router();
routes.use("/auth", authRouter);
routes.use("/game", gameModeRouter);
routes.use("/room", RoomRouter);
export default routes;