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