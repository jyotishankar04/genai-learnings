import app from "./src/graph";
import readline from 'readline';
const config = { configurable: { thread_id: "1" } }

// Define a type for the response structure
interface AgentResponse {
    messages: Array<{
        content?: string;
        tool_calls?: Array<{
            name: string;
            [key: string]: any;
        }>;
        [key: string]: any;
    }>;
    nextRepresentative?: string;
}

interface StreamValue {
    frontdeskSupport?: AgentResponse;
    marketingSupport?: AgentResponse;
    learningSupport?: AgentResponse;
    marketingToolNode?: any;
    learningToolNode?: any;
    [key: string]: any; // Allow other properties
}

async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    function askQuestion() {
        rl.question('\nEnter your question (or type "exit" to quit): ', async (userInput) => {
            if (userInput.toLowerCase() === 'exit') {
                console.log('Goodbye!');
                rl.close();
                return;
            }

            try {
                console.log('\nProcessing your question...\n');

                const stream = await app.stream({
                    messages: [
                        {
                            role: "user",
                            content: userInput
                        }
                    ]
                }, config);

                let stepCount = 1;

                for await (const value of stream as AsyncIterable<StreamValue>) {
                    console.log(`\n---- STEP ${stepCount} ----`);

                    // Check for next representative in frontdeskSupport
                    if (value?.frontdeskSupport?.nextRepresentative) {
                        console.log(`[TRANSFERRING TO: ${value.frontdeskSupport.nextRepresentative}]`);
                    }

                    // Display content from all agents in the response
                    for (const [agentKey, agentData] of Object.entries(value)) {
                        if (agentData && typeof agentData === 'object' && 'messages' in agentData) {
                            const agentResponse = agentData as AgentResponse;

                            if (agentResponse.messages?.[0]?.content) {
                                console.log(`[${agentKey.toUpperCase()}]: ${agentResponse.messages[0].content}`);
                            }
                        }
                    }

                    // Show the raw value structure for debugging
                    // console.log('\nRaw response structure:');
                    // console.log(JSON.stringify(value, null, 2));

                    stepCount++;
                }

                console.log('\nResponse completed.\n');

            } catch (error) {
                console.error('Error:', error);
            }

            askQuestion();
        });
    }

    console.log('Welcome to the AI assistant!');
    askQuestion();
}

process.on('SIGINT', () => {
    console.log('\nGoodbye!');
    process.exit(0);
});

main().catch(console.error);