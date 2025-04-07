import express from "express";
import { AppDataSource } from "./config/database";
import chatSessionRoutes from "./routes/chatSessionRoutes";
import * as dotenv from 'dotenv';
import { findAvailablePort } from "./utils/portUtil";
import { setupWebSocketServer } from "./websocket/websocket";

dotenv.config();

async function main() {
    try {
        await AppDataSource.initialize();
        console.log('Data Source has been initialized!');

        const app = express();
        app.use(express.json());
        app.use('/sessions', chatSessionRoutes);

        const port = await findAvailablePort(3000);
        const server = app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });

        setupWebSocketServer(server);
        console.log('WebSocket server is set up');

    } catch (error) {
        console.error('Error during startup:', error);
    }
}

main();