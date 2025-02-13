"use client";

import { ChatMessages } from "@/app/_components/chat/ChatMessages";
import { api } from "@/trpc/react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useConversation } from "@/app/_components/context/conversation-context";
import { useChat } from "@ai-sdk/react";
import NewChatInput from "@/app/_components/chat/NewChatInput";
import ExistingChatInput from "@/app/_components/chat/ExistingChatInput";

export default function ChatPage() {
  
  const { activeConversationId, setActiveConversationId, isNewConversation } = useConversation();
  
  const { data: conversations, isLoading: isLoadingConversations } = api.conversation.getAll.useQuery(undefined, {
    // Prevent refetching on window focus
    refetchOnWindowFocus: false,
    // Keep data fresh for 1 minute
    staleTime: 60 * 1000,
  });

  // Query for messages in the active conversation (if one exists)
  const { data: messages, isLoading: messagesLoading } = api.chat.getMessages.useQuery({
    conversationId: activeConversationId ?? 0,
    limit: 50,
  }, {
    enabled: !!activeConversationId,
  });

  // Only auto-select an existing conversation if we're not in "new conversation" mode.
  useEffect(() => {
    if (isLoadingConversations) {
      return;
    }
    if (conversations?.length && !activeConversationId && !isNewConversation) {
      setActiveConversationId(conversations[0]!.id);
      return;
    }
    // (You might choose to not auto-create a conversation if none exist.)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, isLoadingConversations, activeConversationId, isNewConversation]);

  const chatState = useChat({
    body: {
      conversationId: activeConversationId ?? 0,
    },
    id: activeConversationId?.toString() ?? "",
    initialMessages: messages?.map(msg => ({
      id: msg.id.toString(),
      content: msg.content,
      role: msg.role as 'user' | 'assistant' | 'system',
      createdAt: msg.createdAt
    })),
  });

  if (isLoadingConversations) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }


  // When there's no messages or when we're in new conversation mode, show the empty state.
  const isChatEmpty = !messagesLoading && (!messages || messages.length === 0);

  if (isNewConversation || isChatEmpty) {
    return (
      <div className="flex min-h-[calc(100vh-160px)] items-center justify-center p-4">
        <div className="mx-auto text-center space-y-8 w-full max-w-[750px]">
          <h1 className="text-4xl font-semibold text-foreground">
            What can I analyze for you?
          </h1>
          <NewChatInput chatState={chatState} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable messages area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-border/80">
        <div className="mx-auto w-full max-w-[750px]">
          <div className="px-4 py-8">
            {activeConversationId !== null && (
              <ChatMessages chatState={chatState} />
            )}
          </div>
        </div>
      </div>

      {/* Fixed input at bottom */}
      <div className="shrink-0">
        <div className="relative mx-auto w-full max-w-[800px]">
          <div className="px-4">
            <ExistingChatInput chatState={chatState} />
          </div>
        </div>
      </div>
    </div>
  );
} 