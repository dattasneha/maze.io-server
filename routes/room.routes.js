import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createRoom } from "../controllers/room.controller.js";

const router = Router();
router.route("/create").post(verifyJwt, createRoom);

export default router;