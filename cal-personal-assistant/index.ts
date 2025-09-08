import { ChatGroq } from "@langchain/groq";
import { createCalendarEvent, getCalendarEvents } from "./tools";

const GROQ_MODEL_NAME = process.env.GROQ_MODEL_NAME;
const tools  = [
    createCalendarEvent,
    getCalendarEvents
]

const model = new ChatGroq({
    model: GROQ_MODEL_NAME!,
    temperature: 0,
}).bindTools(tools);


