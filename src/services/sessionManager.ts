import { Session } from "../entities/session";
import { createSession, getSessionById, updateSessionMessages } from "../repositories/sessionRepositories";

export const startNewSession = async (userId: string): Promise<Session> => {
    const session = new Session();
    session.userId = userId;
    session.messages = JSON.stringify([]);
    return await createSession(session);
}

export const addMessageToSession = async (sessionId: string, message: string): Promise<Session | null> => {
    const session = await getSessionById(sessionId);
    if (!session) return null;

    const messages = JSON.parse(session.messages);
    messages.push({ role: "user", content: message, timestamp: new Date() });

    updateSessionMessages(sessionId, JSON.stringify(messages));
    return await getSessionById(sessionId);
}