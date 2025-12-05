import {calendarAgent, contactAgent, emailAgent, supervisorAgent} from "./src/agents.ts";

async function main(){
    // const query = "Schedule a team meeting next Tuesday at 2pm for 1 hour. there is no attendees for now and use default options";
    // const query = "Send the design team a reminder about reviewing the new mockups";
//  const query = `
//         Schedule a team meeting next Tuesday at 2pm for 1 hour.
//         there is no attendees for now and use default options
//     `;
    // const query = `What is the email address of raj?`;
    const query = "Schedule a design team standup for tomorrow at 9am, use defaults, send everyone a notification about it";


    const stream = await supervisorAgent.stream({
        messages: [{ role: "user", content: query }]
    });

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

main();
