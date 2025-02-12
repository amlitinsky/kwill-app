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
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto bg-[#020817] scrollbar-thin scrollbar-thumb-gray-500/20 hover:scrollbar-thumb-gray-500/40 scrollbar-track-[#020817]">
          <div className="mx-auto h-full w-full max-w-3xl">
            <div className="flex min-h-full flex-col">
              <div className="flex-1 pb-32">
                <div className="px-4 py-4">
                  <ChatMessages conversationId={activeConversationId} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0">
        <div className="bg-gradient-to-t from-[#020817] via-[#020817] to-transparent pt-6">
          <div className="mx-auto w-full max-w-3xl">
            <div className="px-2 pb-6">
              <ChatInput conversationId={activeConversationId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 