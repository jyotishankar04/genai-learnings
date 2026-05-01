import { useState } from "react";
import {
  Header,
  WelcomeScreen,
  ChatArea,
  ChatInput,
  type Message,
  type SuggestionPrompt,
} from "./components";

const APP_NAME = "Expense Tracker";
const APP_DESCRIPTION =
  "Track spending, set budgets, and visualize your finances — just chat naturally.";

const SUGGESTIONS: SuggestionPrompt[] = [
  {
    id: "1",
    text: "Add coffee $4.50",
    icon: "pencil",
    description: "Log a quick expense",
  },
  {
    id: "2",
    text: "Show this month's expenses",
    icon: "list",
    description: "View transactions",
  },
  {
    id: "3",
    text: "Set a $500 food budget",
    icon: "target",
    description: "Budget planning",
  },
  {
    id: "4",
    text: "Generate spending chart",
    icon: "chart",
    description: "Visualize your data",
  },
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = (text?: string) => {
    const content = text ?? inputValue;
    if (!content.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "I can help you track expenses! Tell me what you'd like to do — add an expense, view transactions, or set a budget.",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInputValue("");
  };

  const handleSuggestion = (text: string) => {
    handleSendMessage(text);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header title={APP_NAME} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {messages.length === 0 ? (
          <WelcomeScreen
            appName={APP_NAME}
            appDescription={APP_DESCRIPTION}
            suggestions={SUGGESTIONS}
            onSuggestionClick={handleSuggestion}
          />
        ) : (
          <ChatArea messages={messages} />
        )}

        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={() => handleSendMessage()}
        />
      </main>
    </div>
  );
}
