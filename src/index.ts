import express from "express";
import http from "http";
import sessionRoutes from "./routes/sessionRoutes";
import wsServer from "./websocket/websocketServer";
import { initializeDatabase } from "./config/database";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use("/api", sessionRoutes);

server.on("upgrade", (req, socket, head) => {
    wsServer.handleUpgrade(req, socket, head, (socket) => {
        wsServer.emit("connection", socket, req);
    });
});

server.listen(3000, async () => {
    await initializeDatabase();
    console.log("Server is running on port 3000");
});
