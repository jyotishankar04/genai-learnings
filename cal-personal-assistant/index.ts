import { ChatGroq } from "@langchain/groq";
import { createCalendarEvent, getCalendarEvents, } from "./tools";
import { END, MessagesAnnotation, StateGraph } from "@langchain/langgraph"
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { type AIMessage, isAIMessage } from "@langchain/core/messages";

const GROQ_MODEL_NAME = process.env.GROQ_MODEL_NAME;
const tools = [
    createCalendarEvent,
    getCalendarEvents
]



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

const app = graph.compile()
 
async function main() {
    const result = await app.invoke({ 
        messages: [
            { role: "user", content: "Is there any kafka class in my calendar from last 3 years" }
        ]
     })
    console.log('AI: ',result.messages[result.messages.length - 1]?.content);
}

main()

