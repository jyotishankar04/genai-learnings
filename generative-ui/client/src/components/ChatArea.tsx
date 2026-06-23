import { useEffect, useRef } from "react";
import type { Message } from "./types";
import { ChatBubble } from "./ChatBubble";

interface ChatAreaProps {
  isThinking: boolean;
  messages: Message[];
}

export function ChatArea({ isThinking, messages }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-4">
        {messages.map((message, index) => (
          <ChatBubble
            key={message.id}
            message={message}
            isThinking={
              isThinking &&
              index === messages.length - 1 &&
              message.role === "assistant"
            }
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
