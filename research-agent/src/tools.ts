import  { TavilySearch} from "@langchain/tavily"
import  {AIMessage} from "@langchain/core/messages";
import {graphState, type QuestionAnswer} from "./state.ts";

const tavilySearch = new TavilySearch({
    maxResults:2
})

export async  function searchExecutor(state: typeof graphState.State){
    const lastMessage = state.messages[state.messages.length-1] as AIMessage;
    const parsed = JSON.parse(lastMessage.content as string) as QuestionAnswer;


    const structuredQuery = parsed.searchQueries.map((query) => ({
            query:query,
    }))
    const searchResults = await tavilySearch.batch([...structuredQuery]);

    const cleanedResults = []

    for (let i = 0; i < parsed.searchQueries.length;i++){
        const query = parsed.searchQueries[i];
        const searchOutput = searchResults[i];
        const results = searchOutput?.results || [];
        for (const result of results){
            cleanedResults.push({
                query,
                content:result.content||'',
                source:result.url||''
            })
        }

    }

    return {
        messages:[
            new AIMessage(JSON.stringify({
                searchResults:cleanedResults,
            })),
        ],
    };
}