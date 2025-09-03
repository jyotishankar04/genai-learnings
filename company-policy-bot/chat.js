import Groq from "groq-sdk";
import readline from "readline";
import { vectorStore } from "./prepare.js";
import dotenv from "dotenv";
dotenv.config();
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,       
});

export async function chat() {
  while (true) {
    const question = await new Promise((resolve) =>
      rl.question("Ask a question: ", resolve)
    );
    if (question === "exit" || question === "quit") {
      rl.close();
      break;
    }
    // Retrive
    const relevantChunks =   await vectorStore.similaritySearch(question,3);
    const context = relevantChunks.map((chunk) => chunk.pageContent).join("\n\n");
    const SYSTEM_PROMPT = `You are an assistant for a company policy. Use the following context to answer the question at the end. If you don't know the answer, just say that you don't know with the help contact info, don't try to make up an answer.`;
    const USER_PROMPT = `Question: ${question}
    Context: ${context}
    Answer:`;
    const completion = await groqClient.chat.completions.create({
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: USER_PROMPT,
          },
        ],
        model: "openai/gpt-oss-20b",
      })
      
    console.log(`Assistant: ${completion.choices[0].message.content}`);
  }
}


chat();