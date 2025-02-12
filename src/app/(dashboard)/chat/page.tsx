"use client";

import { ChatInput } from "@/app/_components/chat/ChatInput";
import { ChatMessages } from "@/app/_components/chat/ChatMessages";
import { api } from "@/trpc/react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useConversation } from "@/app/_components/context/conversation-context";

export default function ChatPage() {
  const { activeConversationId, setActiveConversationId } = useConversation();
  
  const { data: conversations, isLoading: isLoadingConversations } = api.conversation.getAll.useQuery(undefined, {
    // Prevent refetching on window focus
    refetchOnWindowFocus: false,
    // Keep data fresh for 1 minute
    staleTime: 60 * 1000,
  });

  const { mutate: createConversation, isPending: isCreatingConversation } = api.conversation.create.useMutation({
    onSuccess: (newConversation) => {
      if (newConversation?.id) {
        setActiveConversationId(newConversation.id);
      }
    },
  });

  // Single effect to handle both cases
  useEffect(() => {
    // Only proceed if we're not already loading or creating
    if (isLoadingConversations || isCreatingConversation) {
      return;
    }

    // If we have conversations but no active one, set the first one
    if (conversations?.length && !activeConversationId) {
      setActiveConversationId(conversations[0]!.id);
      return;
    }

    // If we have no conversations and haven't started creating one, create one
    if (!conversations?.length && !activeConversationId) {
      createConversation({ name: "New Chat" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, isLoadingConversations, activeConversationId, isCreatingConversation]);

  if (isLoadingConversations || isCreatingConversation || !activeConversationId) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Query for messages in the active conversation
  const { data: messages, isLoading: messagesLoading } = api.chat.getMessages.useQuery({
    conversationId: activeConversationId,
    limit: 50,
  });

  // Only when messages are not loading and there are zero messages, show the empty state.
  const isChatEmpty = !messagesLoading && (!messages || messages.length === 0);

  if (isChatEmpty) {
    return (
      <div className="flex min-h-[calc(100vh-160px)] items-center justify-center p-4">
        <div className="mx-auto text-center space-y-8 w-full max-w-[750px]">
          <h1 className="text-4xl font-semibold text-foreground">
            What can I analyze for you?
          </h1>
          <ChatInput conversationId={activeConversationId} />
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
            <ChatMessages conversationId={activeConversationId} />
          </div>
        </div>
      </div>

      {/* Fixed input at bottom */}
      <div className="shrink-0">
        <div className="relative mx-auto w-full max-w-[800px]">
          <div className="px-4">
            <ChatInput conversationId={activeConversationId} />
          </div>
        </div>
      </div>
    </div>
  );
} 