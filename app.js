import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/routes.config.js";

const app = express();

app.use(express.json());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
);
app.use(cookieParser());
app.use("/api/v1", routes);

export { app };