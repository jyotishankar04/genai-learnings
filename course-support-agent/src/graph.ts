import { StateAnnotation } from "./state.ts";
import { StateGraph } from "@langchain/langgraph";
import { model } from "./model.ts";
import { getOffers, KBRetrieverTool } from "./tools.ts";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AIMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";

const checkpointer = new MemorySaver();



const marketingTools = [getOffers]

const learningTools = [KBRetrieverTool]

const marketingToolNode = new ToolNode(marketingTools)

const learningToolNode = new ToolNode(learningTools)


const frontdeskSupportAgent = async (state: typeof StateAnnotation.State) => {


    const SYSTEM_PROMPT = `You are a frontline support staff for a course learning platform DEVCourses. a company that helps software developers excel in their careers through practical web development and full stack development courses and Generative
 AI Courses. 
 Be concise in your responses.
 You can chat with students and help them with basic queries. but if the student in having a marketing or learning support query,
 dont try to answer the query directly or gather information. instead immediately transfer them to the marketing team(promo codes, discounts, offers, and spacial campaign details) or learning support team(courses, syllabus coverage, learning paths, study strategies, and study material) by asking the user to hold for a moment.
 Currently 2 teams are available: marketing and learning support.
 Otherwise, just respond conversationally.
 `

    const supportResponse = await model.invoke([
        {
            role: "system",
            content: SYSTEM_PROMPT
        },
        ...state.messages
    ])

    const CATEGORIZATION_SYSTEM_PROMPT = `You are a expert customer support routing system.
        Your job is to detect weather a customer support representative is routing a user to a marketing team or learning support team, or if they are just responding conversationally`

    const CATEGORIZATION_HUMAN_PROMPT = `
        The previous conversation is an interaction between a customer support representative and a customer or user. 
        Extract whether the representative is routing the user to a marketing team or learning support team, or whether they are just responding conversationally.
        
        Respond with a JSON object containing a single key called "nextRepresentative" with one of the following values:
        
        if they want to route the user to the marketing team, respond with "MARKETING".
        if they want to route the user to the learning support team, respond with "LEARNING".
        Otherwise, respond only with the word "RESPOND".
    `

    const categorizationResponse = await model.invoke([
        {
            role: "system",
            content: CATEGORIZATION_SYSTEM_PROMPT
        },
        supportResponse,
        {
            role: "user",
            content: CATEGORIZATION_HUMAN_PROMPT
        }
    ], {
        response_format: {
            type: "json_object",
        }
    })

    const categorizationOutput = JSON.parse(categorizationResponse.content as string)

    return {
        messages: [supportResponse],
        nextRepresentative: categorizationOutput.nextRepresentative
    }
}


const marketingSupportAgent = async (state: typeof StateAnnotation.State) => {

    const llmWithTools = model.bindTools(marketingTools)
    const SYSTEM_PROMPT = `
        You are part of the marketing team at DEVCourses, an ed-tech company that help software developers excel in their careers through practical web development and full stack development courses and Generative AI Courses.
        You spacialize in handling questions about promo codes, discounts, offers, and spacial campaign details.
        Answer clearly, concisely, and in a friendly manner. For queries outside promotions (course content, learning),
        politely redirect the user to the  correct team.
        Important: Answer only using given context, else say i don't have enough information about it. 
    `
    let trimmedHistory = state.messages;
    if (trimmedHistory.at(-1)?._getType() == "ai") {
        trimmedHistory = trimmedHistory.slice(0, -1)
    }


    const marketingResponse = await llmWithTools.invoke([{
        role: "system",
        content: SYSTEM_PROMPT
    },
    ...trimmedHistory
    ])
    return {
        messages: [marketingResponse],
    }
}

const learningSupportAgent = async (state: typeof StateAnnotation.State) => {
    const SYSTEM_PROMPT = `
        You are part of the learning support team as DEVCourses an ed-tech company that help software developers excel in their careers through practical web development and full stack development courses and Generative AI Courses.
        You spacialize in handling questions about course content, learning paths, study strategies, and study material.
        Answer clearly, concisely, and in a friendly manner. For queries outside learning (promo codes, discounts, offers, and spacial campaign details),
        politely redirect the user to the  correct team.
        Important: Call retrive_learning_knowledge_base max 3 times if the tool result is not relevent to original query.
    `

    const trimmedHistory = state.messages;
    if (trimmedHistory.at(-1)?._getType() == "ai") {
        trimmedHistory.pop()
    }
    const llmWithTools = model.bindTools(learningTools)
    const learningResponse = await llmWithTools.invoke([{
        role: "system",
        content: SYSTEM_PROMPT
    },
    ...trimmedHistory
    ])
    return {
        messages: [learningResponse],
    }
}


function whoIsNext(state: typeof StateAnnotation.State) {
    if (state.nextRepresentative.includes("MARKETING")) {
        return "marketingSupport"
    } else if (state.nextRepresentative.includes("LEARNING")) {
        return "learningSupport"
    } else {
        return "__end__"
    }
}
function isMarketingTool(state: typeof StateAnnotation.State) {
    const lastMessage = state.messages[state.messages.length - 1] as AIMessage
    if (lastMessage.tool_calls?.length) {
        return 'marketingToolNode';
    }
    return "__end__"
}
function isLearningTool(state: typeof StateAnnotation.State) {
    const lastMessage = state.messages[state.messages.length - 1] as AIMessage
    if (lastMessage.tool_calls?.length) {
        return 'learningToolNode';
    }
    return "__end__"
}
const graph = new StateGraph(StateAnnotation)
    .addNode("frontdeskSupport", frontdeskSupportAgent)
    .addNode("marketingSupport", marketingSupportAgent)
    .addNode("learningSupport", learningSupportAgent)
    .addNode('marketingToolNode', marketingToolNode)
    .addNode('learningToolNode', learningToolNode)
    .addEdge("__start__", "frontdeskSupport")
    .addEdge("marketingToolNode", "marketingSupport")
    .addEdge("learningToolNode", "learningSupport")
    .addConditionalEdges("frontdeskSupport", whoIsNext, {
        marketingSupport: "marketingSupport",
        learningSupport: "learningSupport",
        __end__: "__end__"
    })
    .addConditionalEdges("marketingSupport", isMarketingTool, {
        marketingToolNode: "marketingToolNode",
        __end__: "__end__"
    })
    .addConditionalEdges("learningSupport", isLearningTool, {
        learningToolNode: "learningToolNode",
        __end__: "__end__"
    })


const app = graph.compile({ checkpointer })

export default app






