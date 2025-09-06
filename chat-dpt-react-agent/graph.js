/* 

1. Bring in LLM
2. Build the graph
3. invoke the agent
4. add the memory


**/

import { tool } from "@langchain/core/tools";
import { ChatGroq } from "@langchain/groq";
import {
  END,
  MemorySaver,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";
import { z } from "zod";
import { printGraph } from "./utils";
import readline from "readline/promises";

const GROQ_MODEL_NAME = process.env.GROQ_MODEL_NAME;
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const search = new TavilySearch({
  maxResults: 3,
  topic: "general",
});

const calendar = tool(
  async ({ query }) => {
    return JSON.stringify([
      {
        title: "Meeting with John",
        description: "Meeting with John about project X",
        date: "2023-05-01",
        time: "10:00 AM",
        location: "Google Meet",
        link: "https://meet.google.com/abc123",
      },
      {
        title: "Meeting with Jane",
        description: "Meeting with Jane about project Y",
        date: "2023-05-02",
        time: "11:00 AM",
        location: "Google Meet",
        link: "https://meet.google.com/def456",
      },
      {
        title: "Meeting with Bob",
        description: "Meeting with Bob about project Z",
        date: "2023-05-03",
        time: "12:00 PM",
        location: "Google Meet",
        link: "https://meet.google.com/ghi789",
      },
      {
        title: "Meeting with Alice",
        description: "Meeting with Alice about project A",
        date: "2023-05-04",
        time: "1:00 PM",
        location: "Google Meet",
        link: "https://meet.google.com/jkl012",
      },
      {
        title: "Meeting with Bob",
        description: "Meeting with Bob about project Z",
        date: "2025-08-30",
        time: "12:00 PM",
        location: "Google Meet",
        link: "https://meet.google.com/ghi789",
      },
    ]);
  },
  {
    name: "get-calendar-events",
    description: "Call to get the calendar events.",
    schema: z.object({
      query: z.string().describe("The query to search calendar events."),
    }),
  }
);

const tools = [search, calendar];
const toolNode = new ToolNode(tools);

const model = new ChatGroq({
  model: GROQ_MODEL_NAME,
  temperature: 0,
}).bindTools(tools);
const checkpointer = new MemorySaver();
async function callModel(state) {
  // call the llm
  console.log("call the llm");
  const response = await model.invoke(state.messages);
  //   console.log("Response in call model:", response);
  return {
    messages: [response],
  };
}

const shouldCountinue = async (state) => {
  // Check the previous message if tool call, return "tools" if tool call
  // else return "__end__"

  const lastMessage = state.messages[state.messages.length - 1];
  console.log("Last message:", lastMessage.tool_calls.length);
  if (lastMessage?.tool_calls.length > 0) {
    return "tools";
  }
  return "__end__";
};

const graph = new StateGraph(MessagesAnnotation)
  .addNode("callModel", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "callModel")
  .addEdge("tools", "callModel")
  .addConditionalEdges("callModel", shouldCountinue, {
    tools: "tools",
    __end__: END,
  });

const app = graph.compile({
  checkpointer: checkpointer,
});
await printGraph(app, "./customGraph.png");
async function main() {
  let config = {configurable:{
    thread_id: "1"
  } };
  while (true) {
    const question = await rl.question("Ask me a question: ");
    if (question === "exit") break;
    const finalState = await app.invoke(
      {
        messages: [
          {
            role: "user",
            content: question,
          },
        ],
        console: true,
      },
      config
    );
    console.log(
      "Final state:",
      finalState.messages[finalState.messages.length - 1].content
    );
  }
}

main();
