"use client";

import { createContext, useContext, useState } from "react";

type ChatContextType = {
  activeChatId: string| null;
  setActiveChatId: (id: string| null) => void;
  isNewChat: boolean;
  setIsNewChat: (value: boolean) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isNewChat, setIsNewChat] = useState(false);

  return (
    <ChatContext.Provider
      value={{ activeChatId, setActiveChatId, isNewChat, setIsNewChat }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}