import ollama from 'ollama';
import { WebSocket } from "ws";

const MODEL = 'llama3.2:3b';

export const streamAiResponse = async (message: string, socket: WebSocket) => {
    try {
        const stream = await ollama.chat({
            model: MODEL,
            messages: [{ role: "user", content: message }],
            stream: true,
        });

        for await (const part of stream) {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: "partial", content: part.message.content }));
            }
        }

        socket.send(JSON.stringify({ type: "final" }));
    }
    catch (error) {
        console.error("Ollama Streaming Error:", error);
        socket.send(JSON.stringify({ type: "error", content: "An error occurred while processing your request." }));
    }
};