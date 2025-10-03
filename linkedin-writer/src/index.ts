import { HumanMessage } from "@langchain/core/messages";
import graph from "./graph";
import readline from 'node:readline/promises';

async function main() {
    const app = graph.compile()
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });


    while (true) {
        const input = await rl.question("Enter a command: ");
        if (input === "exit") {
            break;
        }
        const result = await app.invoke({
            messages: [new HumanMessage(input)]
        })
        console.log('Result:', result?.messages[result.messages.length - 1]?.content)
    }
    rl.close();
}

main()