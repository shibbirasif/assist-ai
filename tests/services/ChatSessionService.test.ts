import { AppDataSource } from "../../src/config/database";
import chatSessionService from "../../src/services/ChatSessionService";
import { ChatSession } from "../../src/entities/ChatSession";



let sessionId: string;

describe("SessionService Tests", () => {
    beforeAll(async () => {
        await AppDataSource.initialize();
    });

    afterAll(async () => {
        await AppDataSource.dropDatabase();
        await AppDataSource.destroy();
    });

    it("should create a new session", async () => {
        const title = "test title";
        const model = "test-model";

        const chatSession = await chatSessionService.createChatSession(title, model);
        sessionId = chatSession.id;

        expect(chatSession).toBeInstanceOf(ChatSession);
        expect(chatSession.title).toBe(title);
        expect(chatSession.model).toBe(model);
        expect(chatSession.messages).toBeInstanceOf(Array);
        expect(chatSession.messages.length).toBe(0);
    });

    it("should retrieve a session by ID", async () => {
        const chatSession = await chatSessionService.findChatSession(sessionId);

        expect(chatSession).not.toBeNull();
        expect(chatSession?.id).toBe(sessionId);
    });

    it("should retrieve all sessions", async () => {
        const chatSession = await chatSessionService.findAllChatSessions();

        expect(chatSession).toBeInstanceOf(Array);
        expect(chatSession.length).toBeGreaterThan(0);
    });

    it("should update session messages", async () => {
        const newMessage = { role: "user", content: "hi" };

        const updatedSession = await chatSessionService.updateChatSession(sessionId, [newMessage]);

        expect(updatedSession).not.toBeNull();
        expect(updatedSession!.messages).toBeInstanceOf(Array);
        expect(updatedSession!.messages[0]).toEqual(newMessage);
    });

    it("should delete a session", async () => {
        await chatSessionService.deleteChatSession(sessionId);

        const session = await chatSessionService.findChatSession(sessionId);

        expect(session).toBeNull();
    });
});