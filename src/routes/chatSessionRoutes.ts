import express from "express";
import { ChatSessionController } from "../controllers/ChatSessionController";

const router = express.Router();
const chatSessionController = new ChatSessionController();

router.post("/", chatSessionController.createChatSession);
router.get("/:id", chatSessionController.getChatSession);
router.delete("/:id", chatSessionController.deleteChatSession);
router.get("/", chatSessionController.getAllChatSessions);

export default router;