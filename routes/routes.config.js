import express from "express";
import authRouter from "./auth.routes.js"

const routes = new express.Router();
routes.route("/auth", authRouter);
export default routes;