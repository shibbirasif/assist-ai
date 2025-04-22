import { Router } from 'express';
import { AiModelsController } from '../controllers/AiModelsController';

const router = Router();
const aiModelsController = new AiModelsController();

// Route to get available AI models
router.get('/', aiModelsController.getAvailableModels);

export default router;