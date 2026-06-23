import { useState } from "react";
import {
  Header,
  WelcomeScreen,
  ChatArea,
  ChatInput,
  type Message,
  type SuggestionPrompt,
} from "./components";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import type { StreamMessage } from "./components/types";


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
  const [isThinking, setIsThinking] = useState(false);

  const sendQuery = async (query: string) => {
    setMessages((prev) => [...prev, {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
    }]);

    setIsThinking(true);
      await fetchEventSource("http://localhost:3000/chat", {
        method: "POST",
        body: JSON.stringify({
          message: query,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        onmessage: (event) => {
          setIsThinking(false);
          const streamMessage: StreamMessage = JSON.parse(event.data);
          const messagePayload = streamMessage.payload;
          if (messagePayload.type === "assistant") {
            setMessages((prev) => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = {
                ...(newMessages[newMessages.length - 1] as Message),
                content:
                  newMessages[newMessages.length - 1]?.content +
                  messagePayload.payload.content,
              };
              return newMessages;
            });
          }
        },
      });
    
  };
  const handleSendMessage = (text?: string) => {
    const content = text ?? inputValue;
    if (!content.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    sendQuery(content);

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
          <ChatArea isThinking={isThinking} messages={messages} />
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
