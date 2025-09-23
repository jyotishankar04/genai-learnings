import { ChatGroq } from "@langchain/groq";
import { createCalendarEvent, deleteCalendarEvent, getCalendarEvents, TavilyWebSearch, updateCalendarEvent, } from "./tools";
import { END, MemorySaver, MessagesAnnotation, StateGraph } from "@langchain/langgraph"
import { ToolNode } from "@langchain/langgraph/prebuilt";
import readline from "readline/promises";
import { type AIMessage, isAIMessage } from "@langchain/core/messages";



const GROQ_MODEL_NAME = process.env.GROQ_MODEL_NAME;
const tools = [
    createCalendarEvent,
    getCalendarEvents,
    updateCalendarEvent,
    deleteCalendarEvent,
    TavilyWebSearch
]

const checkpointer = new MemorySaver()


const model = new ChatGroq({
    model: GROQ_MODEL_NAME!,
    temperature: 0,
}).bindTools(tools);


// Assistant Node
const callModel = async (state: typeof MessagesAnnotation.State) => {
    const response = await model.invoke(state.messages)
    return { messages: [response] }
}

// Tool node
const toolNode = new ToolNode(tools)
const conditionalEdge = (state: typeof MessagesAnnotation.State) => {
    const lastMessage = state.messages[state.messages.length - 1] as AIMessage

    if (isAIMessage(lastMessage) && lastMessage.tool_calls && lastMessage?.tool_calls?.length > 0) {
        return "toolNode"
    }
    return "__end__"
}

// Build the graph
const graph = new StateGraph(MessagesAnnotation).addNode("callModel", callModel)
    .addNode("toolNode", toolNode)
    .addEdge("__start__", "callModel")
    .addEdge("toolNode", "callModel")
    .addConditionalEdges("callModel", conditionalEdge, {
        __end__: END,
        toolNode: "toolNode"
    })

const app = graph.compile({
    checkpointer
})

async function main() {
    const config = {
        configurable: {
            thread_id: "1"
        }
    }
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    while (true) {
        const userInput = await rl.question("You: ");
        if (userInput === "exit") {
            break;
        }
        const currentDateTime = new Date().toLocaleString("sv-SE").replace(" ", "T");
        const timeZoneString = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const result = await app.invoke({
            messages: [
                {
                    role: "system",
                    content: `
                        You are a smart personal assistant. Your name is CAL AI 
                    - You should avoid to create or update calendar events that is before the current datetime. 

                        current datetime: ${currentDateTime}   
                        timezone: ${timeZoneString}
                    `
                }
                , {
                    role: "user",
                    content: userInput
                }
            ]
        }, config)
        console.log(`AI: ${result.messages?.[result.messages.length - 1]?.content ?? 'No messages found'}`);
    }
    rl.close()
}

main()