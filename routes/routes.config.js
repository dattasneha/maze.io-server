import express from "express";
import authRouter from "./auth.routes.js"

const routes = new express.Router();
routes.use("/auth", authRouter);
export default routes;