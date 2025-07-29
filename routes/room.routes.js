import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createRoom, joinRoom } from "../controllers/room.controller.js";

const router = Router();
router.route("/create").post(verifyJwt, createRoom);
router.route("/join").post(verifyJwt, joinRoom);
export default router;