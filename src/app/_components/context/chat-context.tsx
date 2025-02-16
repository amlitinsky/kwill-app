"use client";

import { createContext, useContext, useState } from "react";

type ChatContextType = {
  activeChatId: number | null;
  setActiveChatId: (id: number | null) => void;
  isNewChat: boolean;
  setIsNewChat: (value: boolean) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
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