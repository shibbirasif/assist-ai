import { Request, Response } from "express";
import { listModels } from "../utils/ollamaUtil";

export class AiModelsController {

    async getAvailableModels(_req: Request, res: Response): Promise<void> {
        try {
            console.log("Fetching models from Ollama...");
            const models = await listModels();
            const modelNames = models.map(model => model.name);
            res.json({ models: modelNames });
        } catch (error) {
            console.error("Error fetching models from Ollama:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}
