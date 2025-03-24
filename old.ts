import express, { Request, Response } from "express";
import { WebSocket, WebSocketServer } from "ws";
import ollama from "ollama";
import { randomUUID } from "crypto";

const MODEL = 'llama3.2:3b';

const app = express();
app.use(express.json());

const server = app.listen(3000, () => { console.log("Server is running on port 3000") });

const sessions = new Map<string, { socket: WebSocket; messages: any[] }>();

const wsServer = new WebSocketServer({ noServer: true });

wsServer.on("connection", (socket) => {
    const sessionId = randomUUID();
    sessions.set(sessionId, { socket: socket, messages: [] });
    console.log(`🔌 New session started: ${sessionId}`);

    socket.send(JSON.stringify({ sessionId, message: "🔗 Session started!" }));

    socket.on("message", async (data) => {
        const parsed = JSON.parse(data.toString());
        const { sessionId, message } = parsed;

        if (!sessions.has(sessionId)) {
            socket.send("⚠️ Invalid session. Please reconnect.");
            return;
        }

        console.log(`📩 [${sessionId}] User:`, message);

        const session = sessions.get(sessionId);
        if (!session) { // statisfy TS
            socket.send("⚠️ Invalid session. Please reconnect.");
            return;
        }
        session.messages.push({ role: "user", content: message });

        try {
            const steam = await ollama.chat({
                model: MODEL,
                messages: session.messages,
                stream: true,
            });

            let aiResponse = "";
            for await (const part of steam) {
                if (session.socket.readyState === WebSocket.OPEN) {
                    aiResponse += part.message.content;
                    session.socket.send(JSON.stringify({ sessionId, message: part.message.content }));
                }
            }

            session.messages.push({ role: "assistant", content: aiResponse });
            session.socket.send(JSON.stringify({ sessionId, message: "[DONE]" }));
         } catch (error) {
            console.error(`❌ [${sessionId}] Error:`, error);
            socket.send("⚠️ An error occurred while processing your request.");
        }
    });

    socket.on("close", () => {
        sessions.delete(sessionId);
        console.log(`🔌 Session closed: ${sessionId}`);
    });
});

server.on("upgrade", (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (socket) => {
        wsServer.emit("connection", socket, request);
    });
});
