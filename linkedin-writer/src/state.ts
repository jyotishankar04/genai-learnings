import { Annotation ,MessagesAnnotation} from "@langchain/langgraph";

export const StateAnnotation = Annotation.Root({
    ...MessagesAnnotation.spec,
    revisions: Annotation<number>
})