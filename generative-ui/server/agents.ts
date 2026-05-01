import { ChatOpenAI } from "@langchain/openai";
import { type LangGraphRunnableConfig, MemorySaver, MessagesAnnotation, StateGraph } from "@langchain/langgraph"
import { initDB } from "./db.ts";
import { ToolNode } from "@langchain/langgraph/prebuilt"
import { initTools } from "./tools.ts";
import { AIMessage, context, SystemMessage, ToolMessage } from "langchain";
// Initialize DB

const db = initDB("./expenses.db");

const llm = new ChatOpenAI({
    model: "gpt-5-nano-2025-08-07",
});

const tools = initTools(db);



const toolNodes = new ToolNode(tools)


async function callModel(state: typeof MessagesAnnotation.State,
    config:LangGraphRunnableConfig
) {
    const llmWithTools = llm.bindTools(tools);


    config.writer?.(
        `Calling model >>>>`
    )
    const response = await llmWithTools.invoke([
        {
            role: "system",
            content: `
            You are a helpful expanse tracking assistant. Current datetime: ${new Date().toISOString()}.
            Call add_expance tool to add expenses to database.
            Call get_expenses tool to get expenses from database between the given start and end date.
            Call generate_chart tool to generate a chart of the expenses by querying the database between the given start and end date.
            `
        },
        ...state.messages
    ])


    return {
        messages: [response],
    };
}


// Graph

function shouldContinue(state: typeof MessagesAnnotation.State) {
    const lastMessage = state.messages.at(-1) as AIMessage;

    if (lastMessage.tool_calls?.length) {
        return "tools"
    }
    return "__end__"
}

function shouldCallModel(state: typeof MessagesAnnotation.State) {
    const lastMessage = state.messages.at(-1) as ToolMessage;

    const message = JSON.parse(lastMessage.content as string);
    if (message.type === "chart") {
        return "__end__"
    }
    return "callModel"
}


const graph = new StateGraph(MessagesAnnotation)
    .addNode("callModel", callModel)
    .addNode("tools", toolNodes)
    .addEdge("__start__", "callModel")
    .addConditionalEdges("callModel", shouldContinue, {
        "__end__": "__end__",
        "tools": "tools"
    })
    .addConditionalEdges("tools", shouldCallModel, {
        "callModel": "callModel",
        "__end__": "__end__"
    })

const agent = graph.compile(
    {
        checkpointer: new MemorySaver()
    }
);


async function main() {
    const response = await agent.stream({
        messages: [
            {
                role: "user",
                content: "Give me a summary of the expenses in the year 2026"
            }
        ]
    }, {
        configurable: {
            thread_id: '1'
        },
        streamMode: ["custom","updates"]
    })
    let messageContent = "";
    for await (const chunk of response) {
        console.log(`chunk: ${chunk[1]}`);
     // messageContent +=
    }
}

main()
