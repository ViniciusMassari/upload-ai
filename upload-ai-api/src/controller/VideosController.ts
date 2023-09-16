
import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from "../lib/prisma";
import {z} from 'zod'
import {streamToResponse, OpenAIStream } from 'ai'

import path from "node:path";
import {promisify} from "node:util"
import fs from 'node:fs'
import { randomUUID } from "node:crypto";
import { pipeline } from "node:stream";
import { openai } from '../lib/openai';

const pump = promisify(pipeline)

export class VideosController{

    static async postVideo(req:FastifyRequest,rep:FastifyReply){
       const data = await req.file()
       if(!data){
        return rep.status(400).send({error: "Missing file input"})
       }

       const extension:string= path.extname(data.filename)

       if(extension !== '.mp3'){
          return rep.status(400).send({error: "Invalid input type, please upload a mp3"})
       }

       const fileBaseName:string = path.basename(data.filename, extension)

       const fileUploadNewName:string = `${fileBaseName}-${randomUUID()}${extension}`

       const uploadDestination:string = path.resolve(__dirname, "../../tmp", fileUploadNewName)

       await pump(data.file,fs.createWriteStream(uploadDestination))

       const video = await prisma.video.create({
        data:{
            name:data.filename,
            path:uploadDestination
        }
       })

       return {
        video
       }
    }

    static async createTranscription(req:FastifyRequest,rep:FastifyReply){
        const paramsSchema = z.object({
            videoId: z.string().uuid()
        })
        const { videoId } = paramsSchema.parse(req.params)
        const bodySchema = z.object({
            prompt: z.string({
                required_error:"Prompt is required",
                invalid_type_error: "Prompt must be not empty",
            })
        })

        const {prompt} = bodySchema.parse(req.body)

        const video = await prisma.video.findUniqueOrThrow({
            where:{
                id: videoId,
            }
        })

        const videoPath = video.path
    

        const audioReadStream = fs.createReadStream(videoPath)

        const response = await openai.audio.transcriptions.create({
            file:audioReadStream,
            model:'whisper-1',
            language:'pt',
            response_format:'json',
            temperature:0,
             prompt:prompt
        })

        const transcription = response.text

        await prisma.video.update({
            where:{
                id:videoId
            },
            data:{
                transcription: response.text
            }
        })

        return {transcription}
    }

    static async generateCompletion(req:FastifyRequest,rep:FastifyReply){
        const bodySchema = z.object({
            videoId: z.string().uuid(),
            prompt: z.string(),
            temperature: z.number().min(0).max(1).default(0.5)
        })

        const {videoId,prompt,temperature} = bodySchema.parse(req.body)

        const video = await prisma.video.findUniqueOrThrow({
            where:{
                id: videoId,
            }
        })

        if(!video.transcription)  return rep.status(400).send({error:"Video transcription was not generated yet"})
        
        const promptMessage = prompt.replace("{transcription}", video.transcription)

        const response = await openai.chat.completions.create({
            model:'gpt-3.5-turbo-16k',
            temperature: temperature,
            messages:[
                {role:'user', content: promptMessage}
            ],
            stream: true,
        })
        const stream = OpenAIStream(response)

        streamToResponse(stream, rep.raw,{
            headers:{
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods':'GET, POST, PUT, DELETE, OPTIONS'
            }
        })
    }
}
