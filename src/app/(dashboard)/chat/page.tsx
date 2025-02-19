"use client";

import { ChatMessages } from "@/app/_components/chat/ChatMessages";
import { api } from "@/trpc/react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { type Message, useChat } from "@ai-sdk/react";
import ChatInput from "@/app/_components/chat/ChatInput";
import { useChatContext } from "@/app/_components/context/chat-context";

export default function ChatPage() {
  
  const { activeChatId, setActiveChatId, isNewChat } = useChatContext();
  const utils = api.useUtils();
  
  const { data: chats, isLoading: isLoadingChats } = api.chat.list.useQuery(undefined, {
    // Prevent refetching on window focus
    refetchOnWindowFocus: false,
    // Keep data fresh for 1 minute
    staleTime: 60 * 1000,
  });

  // Query for messages in the active conversation (if one exists)
  const { data: messages, isLoading: isLoadingMessages } = api.message.load.useQuery({
    chatId: activeChatId ?? 0,
    limit: 50,
  }, {
    enabled: !!activeChatId,
    refetchInterval: 3000,
  });

  // Only auto-select an existing conversation if we're not in "new conversation" mode.
  useEffect(() => {
    if (isLoadingChats) {
      return;
    }
    if (chats?.length && !activeChatId && !isNewChat) {
      setActiveChatId(chats[0]!.id);
      return;
    }
    // (You might choose to not auto-create a conversation if none exist.)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats, isLoadingChats, activeChatId, isNewChat]);

  const chatState = useChat({
    id: activeChatId?.toString() ?? "",
    initialMessages: messages as Message[],
    experimental_prepareRequestBody({ messages, id }) {
      return { message: messages[messages.length - 1], chatId: Number(id)};
    },
    onFinish() {
      void utils.chat.list.invalidate();
      void utils.message.load.invalidate();
    },
  });

  if (isLoadingChats || isLoadingMessages) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable messages area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-border/80">
        <div className="mx-auto w-full max-w-[750px]">
          <div className="px-4 py-8">
            {activeChatId !== null && (
              <ChatMessages chatState={chatState} />
            )}
          </div>
        </div>
      </div>

      {/* Fixed input at bottom */}
      <div className="shrink-0">
        <div className="relative mx-auto w-full max-w-[800px]">
          <div className="px-4">
            <ChatInput chatState={chatState} />
          </div>
        </div>
      </div>
    </div>
  );
} 