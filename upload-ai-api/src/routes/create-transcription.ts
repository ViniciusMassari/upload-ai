import { FastifyInstance } from "fastify";
import { VideosController } from "../controller/VideosController";

export async function createTranscriptionRoute(app:FastifyInstance){
  app.post('/videos/:videoId/transcription', VideosController.createTranscription)
}