import { FastifyInstance } from "fastify";
import { VideosController } from "../controller/VideosController";
import fastifyMultipart from "@fastify/multipart";

export async function uploadVideosRoute(app:FastifyInstance){
    app.register(fastifyMultipart,{
        limits:{
            fileSize: 1_048_576 * 25
        }
    })
    app.post('/videos', VideosController.postVideo)
}