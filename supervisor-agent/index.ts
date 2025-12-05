import {calendarAgent, contactAgent, emailAgent, supervisorAgent} from "./src/agents.ts";
import {createInterface} from "readline/promises";

async function main(){
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    
    // const query = "Schedule a team meeting next Tuesday at 2pm for 1 hour. there is no attendees for now and use default options";
    // const query = "Send the design team a reminder about reviewing the new mockups";
//  const query = `
//         Schedule a team meeting next Tuesday at 2pm for 1 hour.
//         there is no attendees for now and use default options
//     `;
    // const query = `What is the email address of raj?`;
    const config = {
        configurable: {
            thread_id: "1"
        }
    };
    while(true){
        const query = await rl.question("Enter a query: ");
        if(query === "exit") break;
        const stream = await supervisorAgent.stream({
            messages: [{ role: "user", content: query }]
        },config);
    
        for await (const step of stream) {
            for (const update of Object.values(step)) {
                if (update && typeof update === "object" && "messages" in update) {
                    for (const message of update.messages) {
                        console.log(message.toFormattedString());
                    }
                }
            }
        }
    }
}

main();
