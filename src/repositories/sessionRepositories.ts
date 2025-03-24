import { Repository } from "typeorm";
import { Session } from "../entities/session";
import { AppDataSource } from "../config/database";

let sessionRepository: Repository<Session>;

AppDataSource.initialize().then(() => {
    sessionRepository = AppDataSource.getRepository(Session);
});

export const getSessionById = async (sessionId: string): Promise<Session | null> => {
    return await sessionRepository.findOne({ where: { id: sessionId } });
};

export const createSession = async (session: Session): Promise<Session> => {
    return await sessionRepository.save(session);
}

export const updateSessionMessages = async (sessionId: string, messages: string): Promise<Session | null> => {
    const session = await sessionRepository.findOne({ where: { id: sessionId } });
    if (!session) return null;

    session.messages = messages;
    return await sessionRepository.save(session);
};