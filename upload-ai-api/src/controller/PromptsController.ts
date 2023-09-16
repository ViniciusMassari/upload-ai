import { prisma } from "../lib/prisma";
import { FastifyRequest, FastifyReply } from 'fastify'

export class PromptsController{
   static async getAllPrompts(req:FastifyRequest, res:FastifyReply){
        const prompts = await prisma.prompt.findMany()
        return prompts
    }
}