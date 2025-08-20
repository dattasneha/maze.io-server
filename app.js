import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/routes.config.js";
import { errorHandler, notFoundErrorHandler } from "@snehadatta/super-middleware";
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

app.use(notFoundErrorHandler);
app.use(errorHandler);
export { app };