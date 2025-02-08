"use client";

import { api } from "@/trpc/react";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface Message {
  id: number;
  userId: string;
  content: string;
  role: string;
  conversationId: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

interface ChatMessagesProps {
  conversationId: number;
}

export function ChatMessages({ conversationId }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: messages, isLoading } = api.chat.getMessages.useQuery(
    { 
      conversationId,
      limit: 50 
    },
    {
      refetchInterval: 1000,
    }
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!messages?.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-2 text-center">
        <p className="text-lg font-medium text-gray-200">Welcome to Kwill!</p>
        <p className="text-gray-500">Start by typing a message, pasting a Zoom link, or asking for help.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.role === "user"
                ? "bg-[#0c1425] text-gray-100"
                : "bg-[#020817] text-gray-200"
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
} 