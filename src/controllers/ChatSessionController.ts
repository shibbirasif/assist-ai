import { Request, Response } from "express";
import sessionService from "../services/ChatSessionService";

export class ChatSessionController {
    async getAllChatSessions(_req: Request, res: Response): Promise<void> {
        try {
            const chatSession = await sessionService.findAllChatSessions();
            res.json({ chatSession: chatSession });
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async getChatSession(req: Request, res: Response): Promise<void> {
        try {
            const chatSession = await sessionService.findChatSession(req.params.id);
            if (!chatSession) {
                res.status(404).json({ error: "Session not found" });
                return;
            }
            res.json({ chatSession: chatSession });
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async createChatSession(req: Request, res: Response): Promise<void> {
        try {
            const { model } = req.body;
            const chatSession = await sessionService.createChatSession('New Session', model);
            res.status(201).json({ id: chatSession.id, title: chatSession.title, model: chatSession.model });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async deleteChatSession(req: Request, res: Response): Promise<void> {
        try {
            await sessionService.deleteChatSession(req.params.id);
            res.status(204).json({ message: "Chat Session deleted" });
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}