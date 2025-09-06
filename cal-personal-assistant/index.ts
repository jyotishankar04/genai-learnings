import { ChatGroq } from "@langchain/groq";

const GROQ_MODEL_NAME = process.env.GROQ_MODEL_NAME;
const tools : any[] = []


const model = new ChatGroq({
    model: GROQ_MODEL_NAME!,
    temperature: 0,
}).bindTools(tools);