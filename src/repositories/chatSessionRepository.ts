import { AppDataSource } from "../config/database";
import { ChatSession } from "../entities/ChatSession";

export const chatSessionRepository = AppDataSource.getRepository(ChatSession);
