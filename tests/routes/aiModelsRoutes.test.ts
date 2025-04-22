import request from "supertest";
import express from "express";
import aiModelsRoutes from "../../src/routes/aiModelsRoutes";

describe("AI Models API", () => {
    const app = express();
    app.use(express.json());
    app.use("/ai-models", aiModelsRoutes);

    it("should get all available AI models", async () => {
        const res = await request(app).get("/ai-models");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("models");
        expect(res.body.models).toBeInstanceOf(Array);
        expect(res.body.models.length).toBeGreaterThan(0);
        expect(res.body.models.every((model: any) => typeof model === "string")).toBe(true);
    });

    it("should return 404 for invalid model", async () => {
        const res = await request(app).get("/api/models/nonexistent-model");
        expect(res.statusCode).toEqual(404);
    });
});
