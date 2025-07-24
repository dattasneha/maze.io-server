import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { guestLogin, login } from "../controllers/auth.controller.js";

const router = Router();
router.route("/guest-login").post(guestLogin);
router.route("/login").post(verifyJwt, login);

export default router;