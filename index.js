import dotenv from "dotenv"
import { app } from "./app.js"
import { initSocketServer } from "./socket/index.js";

dotenv.config({
    path: "./.env",
});


const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
    console.log(`Server is listening at PORT: ${port}`);
});

initSocketServer(server);