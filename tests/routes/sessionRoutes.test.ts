import request from "supertest";
import express from "express";
import { AppDataSource } from "../../src/config/database";
import chatSessionRoutes from "../../src/routes/chatSessionRoutes";


describe("Session API", () => {
    beforeAll(async () => {
        await AppDataSource.initialize();
    });

    afterAll(async () => {
        await AppDataSource.dropDatabase();
        await AppDataSource.destroy();
    });


    const app = express();
    app.use(express.json());
    app.use("/chat-sessions", chatSessionRoutes);

    let sessionId: string;

    it("should create a new chat-session", async () => {
        const res = await request(app)
            .post("/chat-sessions")
            .send({ model: "llama3.2:7b" });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body).toHaveProperty("title");
        expect(res.body).toHaveProperty("model");
        sessionId = res.body.id;
    });

    it("should get a chat-session by id", async () => {
        const res = await request(app).get(`/chat-sessions/${sessionId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("chatSession");
        expect(res.body.chatSession).toHaveProperty("id");
        expect(res.body.chatSession.id).toEqual(sessionId);
    });

    it("should return 404 for a non-existent chat-session", async () => {
        const res = await request(app).get("/chat-sessions/123");
        expect(res.statusCode).toEqual(404);
    });

    it("should get all chat-sessions", async () => {
        const res = await request(app).get("/chat-sessions");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("chatSessions");
        expect(res.body.chatSessions).toBeInstanceOf(Array);
    });

    it("should delete a chat-session by id", async () => {
        const res = await request(app).delete(`/chat-sessions/${sessionId}`);
        expect(res.statusCode).toEqual(204);
    });

});