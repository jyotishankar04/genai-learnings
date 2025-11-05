import { AIMessage } from "@langchain/core/messages";
import model from "./model";
import { graphState, questionAnswerSchema } from "./state";
import { StateGraph } from "@langchain/langgraph";
import {searchExecutor} from "./tools.ts";
import { CallbackHandler } from "@langfuse/langchain";


// Initialize the Langfuse CallbackHandler
export  const langfuseHandler = new CallbackHandler();


async function responder(state: typeof graphState.State) {
    const SYSTEM_PROMPT = `
        You are an expert researcher.
        Current Time: ${new Date().toLocaleString("sv-SE")}
        1. Provide a detailed ~250 word answer.
        2. Reflect and critique your answer. Be severe to maximize improvement.
        3. Recommend max 3 search queries to research information and improve your answer.
    `;

    // We need structued data
    // 1. By tool calling
    // 2. withStructuredOutput()

    const llmWithStructured = model.withStructuredOutput(questionAnswerSchema);

    const response = await llmWithStructured.invoke([
        {
            role: "system",
            content: SYSTEM_PROMPT,
        },
        ...state.messages,
        {
            role: "system",
            content: `Reflect on the user's original question a the actions taken thus far. Respond using structured output.`,
        }
    ]);

    return {
        messages: [
            new AIMessage(JSON.stringify(response)),
        ],
        iteration: 0,
    };
}

async function revisor(state: typeof graphState.State){
    const SYSTEM_PROMPT = `
      You are an expert researcher.
      Current Time: ${new Date().toLocaleString("sv-SE")}
      Your task is to revise your previous answer using the search results provided 
      
      CRITICAL - Answer format Requirement:
      Your "answer" field must have this exact structure.
      
      [Main answer with citations like [1], [2] etc]
      
      References:
       - [1] https://actul-url-from-search-results.com
       - [2] https://another-url-from-search-results.com
       - [3] https://third-url-from-search-results.com
       
       Instructions:
       1. Write your main answer (~250 words) using information from the search results.
       2. Use inline citations [1], [2], [3]   in your answer text when referencing sources.
       3. MANDATORY: End your answer field wit "References:" section listing all sources used.
       4. The references section is part of the answer field. not a separate field.
       5. Extract the actual URLs from the search results provided in the conversation.
       6. Use the previous critique to remove superfluous informations.
       7. Recomend max 3 search queries to research information and improve your answer.
       
       Example:
        Javascript is evolving rapidly with new features [1]. WebAssembly Integration is improving [2].
        
        References:
         - [1] https://actul-url-from-search-results.com/js-features
         - [2] https://another-url-from-search-results.com/wasm-integration
    `;
    const llmWithStructured = model.withStructuredOutput(questionAnswerSchema);

    const response = await llmWithStructured.invoke([
        {
            role: "system",
            content: SYSTEM_PROMPT,
        },
        ...state.messages,
        {
            role: "system",
            content: `Reflect on the user's original question a the actions taken thus far. Respond using structured output.`,
        }
    ]);

    return {
        messages: [
            new AIMessage(JSON.stringify(response, null, 2)),
        ],
        iteration: state.iteration + 1,
    };
}


const workflow = new StateGraph(graphState)
    .addNode("responder", responder)
    .addNode("search", searchExecutor)
    .addNode("revisor", revisor)
    .addEdge("__start__","responder")
    .addEdge("responder", "search")
    .addEdge("search", "revisor")
    .addConditionalEdges('revisor',(state: typeof graphState.State)=>{
        const MAX_ITERATIONS = 2;
        if(state.iteration >= MAX_ITERATIONS){
            return "__end__";
        }
        return "search";
    },{
        "__end__":"__end__",
        "search":"search",
    })


export default workflow;
