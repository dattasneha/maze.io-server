import { Router } from "express";
import { gameModes } from "../controllers/gameModes.controller.js";

const router = Router();
router.route("/modes").get(gameModes);
export default router;