import { Router, Request, Response } from "express";
import { getSessionById } from "../repositories/sessionRepositories";

const router = Router();

router.get("/session/:id", async (req: Request, res: Response) => {
    const session = await getSessionById(req.params.id);
    if (!session) {
        res.status(404).json({ error: "Session not found." });
        return;
    }

    res.json({ session });
});

export default router;