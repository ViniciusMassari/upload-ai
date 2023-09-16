import { FastifyInstance } from "fastify";
import { PromptsController } from "../controller/PromptsController";

export async function getAllPromptsRoute(app:FastifyInstance){
    app.get('/prompts', PromptsController.getAllPrompts)
}