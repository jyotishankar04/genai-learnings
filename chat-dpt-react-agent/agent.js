import { ChatGroq } from "@langchain/groq";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";
import { z } from "zod";
import { tool } from "@langchain/core/tools";

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_MODEL_NAME = process.env.GROQ_MODEL_NAME



async function main() {
    const model = new ChatGroq({
      model: GROQ_MODEL_NAME,
      temperature: 0,
    });

    const search = new TavilySearch({
      maxResults: 3,
      topic: "general"
    });

    const calendar = tool(
      async ({ query }) => {
      
        // Google Calendar logic goes here



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
            },{
                title: "Meeting with Bob",
                description: "Meeting with Bob about project Z",
                date: "2025-08-30",
                time: "12:00 PM",
                location: "Google Meet",
                link: "https://meet.google.com/ghi789",
            }
        ])
      },
      {
        name: "get-calendar-events",
        description: "Call to get the calendar events.",
        schema: z.object({
          query: z.string().describe("The query to search calendar events."),
        }),
      }
    );



    const agent = createReactAgent({
      llm: model,
      tools: [search,calendar],
    });

    const result = await agent.invoke({
      messages: [
        {
          role:"system",
          content: `
           You are a personal assistant. Use provided tools to answer user queries if you don't know the answer. 
           Current date: ${new Date().toISOString().split("T")[0]}
          `
        },
        {
          role: "user",
          content: "Can u give events name and email in the year 2023?",
        },
      ],
    });
    // console.log("result: ", result);
    console.log("result: ", result.messages[result.messages.length - 1].content);
}


main()

