import { Annotation,MessagesAnnotation } from "@langchain/langgraph";


export  const StateAnnotation = Annotation.Root({
    ...MessagesAnnotation.spec,
    nextRepresentative: Annotation<string>,// Its value will be what is next representative marketing or learning
});