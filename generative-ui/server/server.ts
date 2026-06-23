import express from "express";
import cors from "cors";
import agent from "./agents.ts";
import z from "zod";
import type { StreamMessage } from "./types.ts";

const messageSchema = z.object({
    message: z.string().describe("The message to send to the agent"),
});

const app = express();

app.use(express.json());
app.use(cors(
    {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    }
));

app.get("/", (req, res) => {
    res.json({
        message: "Hello World",
    });
});


app.post("/chat", async (req, res) => {

    // SSE
    // 1. Add special header to the response
    // 2. Send data in special format
    const { message: userMessage } = messageSchema.parse(req.body);
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
    });

    const response = await agent.stream({
        messages: [
            {
                role: "user",
                content: userMessage
            }
        ]
    }, {
        configurable: {
            thread_id: '1'
        },
        streamMode: ["messages"]
    })


    for await (const [eventType, chunk] of response) {
        const messageType = chunk[0].type;
        let streamMessage: StreamMessage | null = null;

        if(messageType === "ai") {
            streamMessage = {
                payload: {
                    type: "assistant",
                    payload: {
                        content: chunk[0].content as string,
                    }
                }
            }
        }

        if (!streamMessage) {
            continue;
        }

        res.write(`event: message\n`);
        res.write(`data: ${JSON.stringify(streamMessage)}\n\n`);
    }
    res.end();
    return;
});


app.listen(3000, () => {
    console.log("Server is running on port http://localhost:3000");
});

