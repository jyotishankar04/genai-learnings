import {tool} from "@langchain/core/tools"
import { createRetrieverTool}from "langchain/tools/retriever"
import { vectorStore } from "./indexStore"

export const getOffers = tool(async () => {
    return JSON.stringify([
        {
            code: "DEVCOURSES10",
            description: "10% discount on your first purchase",
        }, {
            code: "DEVCOURSES20",
            description: "20% discount on your first purchase",
        }, {
            code: "DIWALI50",
            description: "50% discount on your first purchase",
        }
    ])
}, {
    name: `offers_query_tool`,
    description: "Use this tool to get offers and discounts for DEVCourses courses"
})
const retriever = vectorStore.asRetriever()

export const  KBRetrieverTool = createRetrieverTool(retriever,{
    name: `retrive_learning_knowledge_base`,
    description: "Use this tool to get information about DEVCourses courses, syllabus coverage, learning paths, study strategies, and study material"
})