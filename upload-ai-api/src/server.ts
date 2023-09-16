import { fastify } from "fastify";
import {fastifyCors} from '@fastify/cors'
import { getAllPromptsRoute } from "./routes/get-all-prompts";
import { uploadVideosRoute } from "./routes/upload-videos";
import { createTranscriptionRoute } from "./routes/create-transcription";
import { generateAiCompletionRoute } from "./routes/generate-ai-completion";

const app = fastify()

app.register(fastifyCors, {
    origin: '*'
})

app.register(getAllPromptsRoute)
app.register(uploadVideosRoute)
app.register(createTranscriptionRoute)
app.register(generateAiCompletionRoute)

try {
    app.listen({port:3333})
    console.log("HTTP server running");
} catch (error) {
    throw new Error("Failed to connect to the server")
}
