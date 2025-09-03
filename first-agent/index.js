import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Configuration constants
const MODEL = "llama-3.3-70b-versatile";
const SYSTEM_PROMPT = `
You are Josh, a personal financial assistant. Your task is to assist users with their expenses, budgeting, balances, and financial planning. 
You are very helpful and knowledgeable about budgeting and personal finance. 
You are excellent at explaining complex topics in a simple way.

Current date: ${new Date().toISOString()}

Available tools:
1. getTotalExpense - Get total expense of user from date to date (format: "YYYY-MM-DD")
`;



// Tools configuration
const TOOLS = [
  {
    type: "function",
    function: {
      name: "getTotalExpense",
      description: "Get total expense of user from date to date",
      parameters: {
        type: "object",
        properties: {
          from: {
            type: "string",
            description: "From date in YYYY-MM-DD format",
          },
          to: {
            type: "string",
            description: "To date in YYYY-MM-DD format",
          },
        },
        required: ["from", "to"],
      },
    },
  },
];

async function callAgent() {
  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: "What is the total expense from 2023-01-01 to 2023-12-31?",
    },
  ];

  try {
    // Initial completion to determine if tool calling is needed
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages,
      tools: TOOLS,
    });

    const assistantMessage = completion.choices[0].message;
    messages.push(assistantMessage);

    // Check if tool calls are required
    const toolCalls = assistantMessage.tool_calls;

    if (!toolCalls || toolCalls.length === 0) {
      console.log("Response:", assistantMessage.content);
      return assistantMessage.content;
    }

    // Process each tool callb
    for (const toolCall of toolCalls) {
      if (toolCall.function.name === "getTotalExpense") {
        const args = JSON.parse(toolCall.function.arguments);
        const totalExpense = await getTotalExpense(args.to, args.from);
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({ totalExpense }),
        });
      }
    }

    // Get final response after tool execution
    const finalCompletion = await groq.chat.completions.create({
      model: MODEL,
      messages,
      tools: TOOLS,
    });

    const finalResponse = finalCompletion.choices[0].message.content;
    console.log("Final Response:", finalResponse);
    return finalResponse;
  } catch (error) {
    console.error("Error in callAgent:", error);
    throw error;
  }
}

/**
 * Get total expense for a given date range
 * @param {string} from - Start date in YYYY-MM-DD format
 * @param {string} to - End date in YYYY-MM-DD format
 * @returns {number} Total expense amount
 */
async function getTotalExpense(from, to) {
  console.log(`TOOL CALLED: getTotalExpense from ${from} to ${to}`);

  // In a real implementation, this would query a database or API
  // For now, return a mock value
  const mockExpense = 12500.75;

  console.log(`Total expense: $${mockExpense}`);
  return mockExpense;
}

// Execute the agent
callAgent().catch(console.error);
