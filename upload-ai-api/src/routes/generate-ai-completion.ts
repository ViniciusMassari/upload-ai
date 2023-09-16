import { FastifyInstance } from "fastify";
import { VideosController } from "../controller/VideosController";

export async function generateAiCompletionRoute(app:FastifyInstance){
  app.post('/ai/complete', VideosController.generateCompletion)
}