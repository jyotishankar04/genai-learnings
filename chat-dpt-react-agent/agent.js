import { ChatGroq } from "@langchain/groq";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { writeFileSync } from "fs";
import { createInterface } from "readline";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";

const GROQ_MODEL_NAME = process.env.GROQ_MODEL_NAME;

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  const model = new ChatGroq({
    model: GROQ_MODEL_NAME,
    temperature: 0,
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
  const checkpointer = new MemorySaver();

  const agent = createReactAgent({
    llm: model,
    tools: [search, calendar],
    checkpointer,
  });

  try {
    while (true) {
      const input = await question("You: ");
      if (input === "exit") {
        break;
      }

      // Use proper LangChain message format
      const result = await agent.invoke(
        {
          messages: [
            new SystemMessage(`
              You are a personal assistant. Use provided tools to answer user queries if you don't know the answer. 
              Current date: ${new Date().toISOString().split("T")[0]}
            `),
            new HumanMessage(input),
          ],
        },
        {
          configurable: { thread_id: "1" },
        }
      );

      console.log(
        "Assistant: ",
        result.messages[result.messages.length - 1].content
      );
    }
  } finally {
    rl.close();
  }

  try {
    const drawableGraphState = await agent.getGraphAsync();
    const graphStateImage = await drawableGraphState.drawMermaidPng();
    const graphStateArrayBuffer = await graphStateImage.arrayBuffer();
    const filePath = "./graph.png";
    writeFileSync(filePath, Buffer.from(graphStateArrayBuffer));
    console.log("Graph saved to graph.png");
  } catch (error) {
    console.log("Could not save graph visualization:", error.message);
  }
}

main().catch(console.error);
