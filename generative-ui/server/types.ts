export type StreamMessage = {
    payload: AssistantMessage | ToolCallStartMessage | ToolMessage;
}

export type AssistantMessage = {
    type: "assistant";
    payload: {
        content: string;
    }
}

export type ToolCallStartMessage = {
    type: "toolCall:start";
    payload: {
        name: string;
        args: Record<string, any>;
    }
}

export type ToolMessage = {
    type: "tool";
    payload: {
        name: string;
        result: Record<string, any>;
    }
}