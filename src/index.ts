import express from "express";
import { AppDataSource } from "./config/database";
import chatSessionRoutes from "./routes/chatSessionRoutes";
import * as dotenv from 'dotenv';
import cors from 'cors';
import { setupWebSocketServer } from "./websocket/websocket";
import aiModelsRoutes from "./routes/aiModelsRoutes";

dotenv.config();

async function main() {
    try {
        await AppDataSource.initialize();
        console.log('Data Source has been initialized!');

        const app = express();
        app.use(cors());
        app.use(express.json());

        // Routes
        app.use('/chat-sessions', chatSessionRoutes);
        app.use('/ai-models', aiModelsRoutes);

        const port = process.env.PORT
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