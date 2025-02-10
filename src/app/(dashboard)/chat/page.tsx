"use client";

import { ChatInput } from "@/app/_components/chat/ChatInput";
import { ChatMessages } from "@/app/_components/chat/ChatMessages";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";
import { Loader2, PlusCircle } from "lucide-react";

export default function ChatPage() {
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  
  const { data: conversations, isLoading: isLoadingConversations } = api.conversation.getAll.useQuery();
  const { mutate: createConversation, isPending: isCreatingConversation } = api.conversation.create.useMutation({
    onSuccess: (newConversation) => {
      if (newConversation?.id) {
        setActiveConversationId(newConversation.id);
      }
    },
  });

  // Set first conversation as active when conversations load (but don't create one)
  useEffect(() => {
    if (!isLoadingConversations && conversations && conversations.length > 0 && !activeConversationId) {
      const firstConversation = conversations[0];
      if (firstConversation?.id) {
        setActiveConversationId(firstConversation.id);
      }
    }
  }, [conversations, isLoadingConversations, activeConversationId]);

  const handleNewChat = () => {
    createConversation({ name: "New Chat" });
  };

  if (isLoadingConversations) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Show new chat button if no conversations exist
  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4">
        <p className="text-lg font-medium text-gray-200">Welcome to Kwill!</p>
        <p className="text-gray-500">Start by creating a new chat.</p>
        <button
          onClick={handleNewChat}
          disabled={isCreatingConversation}
          className="flex items-center space-x-2 rounded-lg bg-[#0c1425] px-4 py-2 text-gray-200 hover:bg-[#0c1425]/80"
        >
          {isCreatingConversation ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <PlusCircle className="h-5 w-5" />
          )}
          <span>New Chat</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-700/50 bg-[#020817] p-4">
        <h1 className="text-lg font-medium text-gray-200">Chats</h1>
        <button
          onClick={handleNewChat}
          disabled={isCreatingConversation}
          className="flex items-center space-x-2 rounded-lg bg-[#0c1425] px-3 py-1.5 text-sm text-gray-200 hover:bg-[#0c1425]/80"
        >
          {isCreatingConversation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="h-4 w-4" />
          )}
          <span>New Chat</span>
        </button>
      </div>
      {activeConversationId ? (
        <div className="flex flex-1 flex-col p-4">
          <div className="flex-1 overflow-y-auto">
            <ChatMessages conversationId={activeConversationId} />
          </div>
          <div className="h-[120px]">
            <ChatInput conversationId={activeConversationId} />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-500">Select or create a chat to get started</p>
        </div>
      )}
    </div>
  );
} 