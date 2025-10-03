import { StateGraph } from "@langchain/langgraph";
import { StateAnnotation } from "./state";
import { model } from "./model";
import { AIMessage, HumanMessage, isAIMessage, isHumanMessage, SystemMessage } from "@langchain/core/messages";

async function writer(state: typeof StateAnnotation.State) {
    const SYSTEM_PROMPT = `
        You are a linkedin writing assistant. for devs.
        Your task is to generate a Linkedin post on a given topic.
        Goal: Helpful, Human, Friendly, Buzzword Free posts.

        Style & Format:
        - Conversational, authentic, short lines, whitespace friendly, simple friendly english.
        - Max 2 relevent emojis.
        - By default, Minimum 150 to 200 words. if explicitly asked then increase or decrease accordingly.
        - Hook in the first 2 lines. Give 1 - 2 concrete examples. Clear takeway.
        - Explain any jargon with a quick analogy or simple example.
        - Avoid controversy, Include a simple CTA to follow for more.

        Behavior:
        - If the latest human message contains critique or says "Revise Now", treat it as an explicit order to revise the previous draft. Apply all requested changes.
        - Do NOT ask questions or seek confirmation.
        - output only the post text (no preamble)
    `

    const response = await model.invoke([new SystemMessage(SYSTEM_PROMPT), ...state.messages]);
    return {
        messages: [response]
    }
}

async function critique(state: typeof StateAnnotation.State) {
    const SYSTEM_PROMPT = `
        You are a tough Linkedin post writing critic. Your task is to give feedback on previously generated linkedin posts by a linkedin writer agent.

        Check Against:
        - Strong hook in 1 - 2 lines
        - By default, Minimum 150 to 200 words. if explicitly asked then increase or decrease accordingly
        - Beginner-friendly clarity: explain jargon with analogy/example
        - Specific Insights and concrete examples(not generic advice)
        - Skimmable formatting(short lines, whitespace friendly)
        - Clear CTA to follow for more
        - max 2 relevent type emojis, authentic tone, no controversy, simple friendly english

        Output format(no scores, no questions, no meta):
        Start with exactly:
        "Revise now. Apply all changes below. Output only the revised post text. "
            
        Then list ONLY bullet-points FIXES that(edit instructions).
        DO NOT include any rewritten sentences or paragraph. Do NOT write the post

        Return only the fixes.
    `
    const firstUserMessage = state.messages.find(m => isHumanMessage(m))
    console.log("firstUserMessage", firstUserMessage)
    const LastAiMessage = state.messages.slice().reverse().find(m => isAIMessage(m))
    const response = await model.invoke([new SystemMessage(SYSTEM_PROMPT),  firstUserMessage as any, LastAiMessage]);

    return {
        messages: [new HumanMessage(response.content as string)],
        revisions: state.revisions ? state.revisions + 1 : 1
    }
}

async function whoNext(state: typeof StateAnnotation.State) {
    if (state.revisions >= 3) {
        return "__end__"
    }

    return "critique"
}

const graph = new StateGraph(StateAnnotation)
    .addNode("writer", writer)
    .addNode("critique", critique)
    .addEdge("__start__", "writer")
    .addEdge("critique", "writer")
    .addConditionalEdges("writer", whoNext, {

        "__end__": "__end__",
        critique: "critique"
    })


export default graph