import { AppDataSource } from "../../src/config/database";
import { createSession, getSession, getAllUserSessions, updateSessionMessages, deleteSession } from "../../src/services/sessionService";
import { Session } from "../../src/entities/Session";
import e from "express";

beforeAll(async () => {
    await AppDataSource.initialize();
});

afterAll(async () => {
    await AppDataSource.destroy();
});

let sessionId: string;

test("Create a new session", async () => {
    const userId = "test-user";
    const model = "test-model";

    const session = await createSession(userId, model);
    sessionId = session.id;

    expect(session).toBeInstanceOf(Session);
    expect(session.userId).toBe(userId);
    expect(session.model).toBe(model);
    expect(session.messages).toBeInstanceOf(Array);
    expect(session.messages.length).toBe(0);
});

test("Retrieve a session by ID", async () => {
    const session = await getSession(sessionId);

    expect(session).not.toBeNull();
    expect(session?.id).toBe(sessionId);
});

test("Retrieve all sessions for a user", async () => {
    const userId = "test-user";

    const sessions = await getAllUserSessions(userId);

    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBeGreaterThan(0);
    expect(sessions[0].userId).toBe(userId);
});

test("Update session messages", async () => {
    const newMessages1 = { role: "user", content: "hi" };
    const newMessages2 = { role: "ass", content: "hello" };

    let updatedSession = await updateSessionMessages(sessionId, newMessages1);

    expect(updatedSession).not.toBeNull();
    expect(updatedSession!.messages[0]).toBe(newMessages1);

    updatedSession = await updateSessionMessages(sessionId, newMessages2);
    expect(updatedSession!.messages[1]).toBe(newMessages2);
});

test("Delete a session", async () => {
    await deleteSession(sessionId);

    const session = await getSession(sessionId);

    expect(session).toBeNull();
});
