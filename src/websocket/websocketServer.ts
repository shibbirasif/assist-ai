import { WebSocketServer } from "ws";
import { addMessageToSession, startNewSession } from "../services/sessionManager";
import { streamAiResponse } from "../services/ollamaService";

const wsServer = new WebSocketServer({ noServer: true });

wsServer.on("connection", async (socket, request) => {
    const userId = request.headers["user-id"] as string;
    if (!userId) {
        socket.send("⚠️ User ID is required.");
        socket.close();
        return;
    }

    const session = await startNewSession(userId);
    socket.send(JSON.stringify({ sessionId: session.id, message: "Session started!" }));

    socket.on("message", async (data) => {
        try {
            const { sessionId, message } = JSON.parse(data.toString());

            await addMessageToSession(sessionId, message);
            await streamAiResponse(message, socket);
        } catch (error) {
            console.error("WebSocket Error:", error);
            socket.send(JSON.stringify({ type: "error", content: "Invalid message format." }));
        }
    });
});

export default wsServer;