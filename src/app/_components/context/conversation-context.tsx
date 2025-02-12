"use client";

import { createContext, useContext, useState } from "react";

type ConversationContextType = {
  activeConversationId: number | null;
  setActiveConversationId: (id: number | null) => void;
};

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);

  return (
    <ConversationContext.Provider value={{ activeConversationId, setActiveConversationId }}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error("useConversation must be used within a ConversationProvider");
  }
  return context;
}