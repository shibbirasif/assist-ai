import { Server } from 'http';
import { WebSocketServer } from 'ws';
import chatSessionService from '../services/ChatSessionService';
import { generateResponse } from '../utils/ollamaUtil';

export function setupWebSocketServer(server: Server, existingSessionIds: Set<string> = new Set()) {
    const websocketServer = new WebSocketServer({ server });

    websocketServer.on('connection', (socket) => {
        let isAlive = true;

        socket.on('pong', () => {
            isAlive = true;
        });

        const pingInterval = setInterval(() => {
            if (!isAlive) {
                socket.terminate();
                return;
            }
            isAlive = false;
            socket.ping();
        }, 30000);

        socket.on('close', () => {
            clearInterval(pingInterval);
        });

        socket.on('message', async (socketMessage: string) => {
            try {
                const parsedMessage = JSON.parse(socketMessage);
                if (parsedMessage.type === 'ping') {
                    socket.send(JSON.stringify({ type: 'pong' }));
                    return;
                }

                const { chatSessionId, message } = parsedMessage;

                if (!chatSessionId || !message) {
                    socket.send(JSON.stringify({ error: 'Invalid message format' }));
                    return;
                }

                if (existingSessionIds.has(chatSessionId)) {
                    socket.close();
                    existingSessionIds.delete(chatSessionId);
                    setupWebSocketServer(server, existingSessionIds);
                    return;
                }


                const chatSession = await chatSessionService.findChatSession(chatSessionId);

                if (chatSession) {
                    const messages = [...chatSession.messages, { role: "user", content: message }];
                    const stream = await generateResponse(chatSession.model, messages);

                    let streamMessage = "";

                    for await (const part of stream) {
                        socket.send(JSON.stringify({ content: part.message.content }));
                        streamMessage += ' ' + part.message.content;
                    }

                    messages.push({ role: "assistant", content: streamMessage });
                    const updatedSession = await chatSessionService.updateChatSession(chatSession.id, messages);
                }
            } catch (error) {
                console.error('Error processing message:', error);
                socket.send(JSON.stringify({ error: 'Internal server error' }));
            }

         });

    });

}