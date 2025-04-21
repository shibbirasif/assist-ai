import { chatSessionRepository } from "../repositories/chatSessionRepository";
import { ChatSession } from "../entities/ChatSession";
import { Message } from "ollama";

export class ChatSessionService {
    async createChatSession(title: string, model: string): Promise<ChatSession> {
        const chatSession = new ChatSession();
        chatSession.title = title;
        chatSession.model = model;
        chatSession.messages = [];
        return chatSessionRepository.save(chatSession);
    }

    async findChatSession(id: string): Promise<ChatSession | null> {
        return chatSessionRepository.findOneBy({ id });
    }

    async updateChatSession(id: string, messages: Message[]): Promise<ChatSession | null> {
        const chatSession = await chatSessionRepository.findOneBy({ id });
        if (chatSession) {
            chatSession.messages = messages;
            return chatSessionRepository.save(chatSession);
        }
        return null;
    }

    async deleteChatSession(id: string): Promise<void> {
        await chatSessionRepository.delete(id);
    }

    async findAllChatSessions(): Promise<ChatSession[]> {
        return chatSessionRepository.find({
            select: {
                id: true,
                title: true,
                model: true
            },
            order: {
                createdAt: "DESC"
            }
        });
    }
}

export default new ChatSessionService();