import { Message } from "ollama";
import { Session } from "../entities/Session";
import { sessionRepository } from "../repositories/sessionRepository";

export const createSession = async (userId: string, model: string): Promise<Session> => {
    const session = new Session();
    session.userId = userId;
    session.model = model;
    session.messages = [];
    return sessionRepository.save(session);
};

export const getSession = async (sessionId: string): Promise<Session | null> => {
    return sessionRepository.findOne({ where: { id: sessionId } });
};

export const getAllUserSessions = async (userId: string): Promise<Session[]> => {
    return sessionRepository.find({ where: { userId } });
}

export const updateSessionMessages = async (sessionId: string, messages: Message): Promise<Session | null> => {
    const session = await getSession(sessionId);
    if (!session) {
        return null;
    }

    session.messages.push(messages);
    return sessionRepository.save(session);
};

export const deleteSession = async (sessionId: string): Promise<void> => {
    await sessionRepository.delete(sessionId);
};