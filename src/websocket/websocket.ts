import { Server } from 'http';
import { WebSocketServer } from 'ws';
import chatSessionService from '../services/ChatSessionService';
import { generateResponse } from '../utils/ollamaUtil';
import { parse } from 'url';

export function setupWebSocketServer(server: Server, existingSessionIds: Set<string> = new Set()) {
    const websocketServer = new WebSocketServer({ server });

    websocketServer.on('connection', (socket, req) => {
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

        // Extract chatSessionId from the URL
        const parsedUrl = parse(req.url || '', true);
        const chatSessionIdFromUrl = parsedUrl.query.chatSessionId as string | undefined;

        if (!chatSessionIdFromUrl) {
            console.error('chatSessionId missing in the WebSocket URL');
            socket.send(JSON.stringify({ error: 'chatSessionId is required in the URL' }));
            socket.close();
            return;
        }

        socket.on('message', async (socketMessage: string) => {
            try {
                const parsedMessage = JSON.parse(socketMessage);
                if (parsedMessage.type === 'ping') {
                    socket.send(JSON.stringify({ type: 'pong' }));
                    return;
                }

                const { message } = parsedMessage;
                const chatSessionId = chatSessionIdFromUrl; // Use the ID from the URL

                if (!message) {
                    socket.send(JSON.stringify({ error: 'Message content is required' }));
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
                        socket.send(JSON.stringify({ role: 'assistant', content: part.message.content, stream: '[IN_PROGRESS]' }));
                        streamMessage += ' ' + part.message.content;
                    }
                    socket.send(JSON.stringify({ role: 'assistant', content: '', stream: '[DONE]' }));

                    messages.push({ role: "assistant", content: streamMessage });
                    await chatSessionService.updateChatSession(chatSession.id, messages);
                } else {
                    socket.send(JSON.stringify({ error: `Chat session with ID ${chatSessionId} not found` }));
                    socket.close();
                }
            } catch (error) {
                console.error('Error processing message:', error);
                socket.send(JSON.stringify({ error: 'Internal server error' }));
            }
        });
    });
}