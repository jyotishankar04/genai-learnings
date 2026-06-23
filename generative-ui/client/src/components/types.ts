export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  timestamp: Date;
}

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  category?: string;
  amount?: number;
}

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