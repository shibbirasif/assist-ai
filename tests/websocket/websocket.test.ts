import { createServer } from "http";
import { WebSocket } from 'ws';
import { AppDataSource } from "../../src/config/database";
import { setupWebSocketServer } from "../../src/websocket/websocket";
import { generateResponse } from '../../src/utils/ollamaUtil';
import { findAvailablePort } from "../../src/utils/portUtil";
import chatSessionService from "../../src/services/ChatSessionService";
import { setCommentRange } from "typescript";

// Mock the generateResponse function to avoid actual Ollama calls during testing
jest.mock('../../src/utils/ollamaUtil', () => ({
    generateResponse: jest.fn(async function* () {
        yield { message: { content: "mocked response" } };
        yield { message: { content: "another part of mocked response" } };
        yield { message: { content: "final part of mocked response" } };
    }),
}));


describe('WebSocket Server', () => {
    let port: number;
    let server: ReturnType<typeof createServer>;
    let websocketClient: WebSocket;
    let chatSessionId: string;

    beforeAll(async () => {
        await AppDataSource.initialize();
        const chatSession = await chatSessionService.createChatSession("test title", "llama2");
        chatSessionId = chatSession.id;
        port = await findAvailablePort(4000);
        server = createServer();
        setupWebSocketServer(server);
        server.listen(port);
    });

    afterAll(async () => {
        if (websocketClient?.readyState === WebSocket.OPEN) {
            websocketClient.terminate();
        }
        await new Promise(res => setTimeout(res, 200));
        server.close();
        // await AppDataSource.dropDatabase();
        await AppDataSource.destroy();
    });



    beforeEach(async () => {
        websocketClient = new WebSocket(`ws://localhost:${port}`);
        await new Promise((resolve) => websocketClient.once('open', resolve));
        (generateResponse as jest.Mock).mockClear(); // Clear mock calls before each test
    });

    afterEach(async () => {
        if (websocketClient && websocketClient.readyState === WebSocket.OPEN) {
            websocketClient.close();
        }
        // await AppDataSource.dropDatabase();
        // await AppDataSource.initialize();

    });

    it('should establish a WebSocket connection', () => {
        expect(websocketClient.readyState).toBe(WebSocket.OPEN);
    });

    it('should handle user message and receive streamed bot response', async () => {
        const userMessage = { chatSessionId, message: "Hello, how are you?" };
        websocketClient.send(JSON.stringify(userMessage));
        const responses: any[] = [];

        await new Promise((resolve) => {
            websocketClient.on('message', (data) => {
                const parsedData = JSON.parse(data.toString());
                responses.push(parsedData);
                if (responses.length === 3) {
                    resolve(responses);
                }
            });
        });

        expect(responses.length).toBe(3);
        responses.forEach(response => {
            expect(response).toHaveProperty('content');
            expect(response.content).toContain('mocked response');
        });
        expect(generateResponse).toHaveBeenCalledTimes(1);

        await new Promise(res => setTimeout(res, 200)); // Wait for the database operations to complete
        const chatSessionAfter = await chatSessionService.findChatSession(chatSessionId);
        expect(chatSessionAfter?.messages.length).toBe(2); // Initial empty + user + assistant
        expect(chatSessionAfter?.messages[0].role).toBe('user');
        expect(chatSessionAfter?.messages[1].role).toBe('assistant');
        expect(chatSessionAfter?.messages[0].content).toBe(userMessage.message);
        expect(chatSessionAfter?.messages[1].content).toContain('mocked response');
    }, 10000); // Increase timeout for async operations

    it('should handle ping from client and respond with pong', async () => {
        const pongResponse = new Promise((resolve) => {
            websocketClient.on('message', (data) => {
                const parsedData = JSON.parse(data.toString());
                if (parsedData.type === 'pong') {
                    resolve(parsedData);
                }
            });
        });
        websocketClient.send(JSON.stringify({ type: 'ping' }));
        const response = await pongResponse;
        expect(response).toHaveProperty('type', 'pong');
    });

    it('should handle invalid message format', async () => {
        websocketClient.send(JSON.stringify({ invalid: 'format' }));

        const response = await new Promise((resolve) => {
            websocketClient.once('message', (data) => {
                resolve(JSON.parse(data.toString()));
            });
        });

        expect(response).toHaveProperty('error', 'Invalid message format');
    });

});
