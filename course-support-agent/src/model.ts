import { ChatGroq } from "@langchain/groq";

const GROQ_MODEL_NAME = process.env.GROQ_MODEL_NAME


export const model = new ChatGroq({
    model: GROQ_MODEL_NAME!,
    temperature: 0
})