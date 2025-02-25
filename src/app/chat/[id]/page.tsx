"use client";

import { ChatMessages } from "@/app/_components/chat/ChatMessages";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { type Message, useChat } from "@ai-sdk/react";
import ChatInput from "@/app/_components/chat/ChatInput";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";

export default function ChatPage() {
  const params = useParams();
  const id = params.id as string;
  const searchParams = useSearchParams();
  const initialMessage = decodeURIComponent(searchParams.get("message") ?? "");
  const utils = api.useUtils();
  const router = useRouter();

  // Query for messages in the active conversation (if one exists)
  const { data: messages, isLoading: isLoadingMessages } = api.message.load.useQuery({
    chatId: id,
    limit: 50,
  }, {
    enabled: !!id,
    refetchInterval: 2000,
  });


  const chatState = useChat({
    id: id,
    initialMessages: messages as Message[],
    experimental_prepareRequestBody({ messages, id }) {
      return { message: messages[messages.length - 1], chatId: id};
    },
    onFinish() {
      void utils.chat.list.invalidate();
      void utils.message.load.invalidate();
    },
  });
  // State to track whether the initial message has been submitted
  const [initialSubmitted, setInitialSubmitted] = useState(false);

  // Auto-submit the initial message if present
  useEffect(() => {
    if (initialMessage && !initialSubmitted) {
      chatState.setInput(initialMessage);
      
      // Submit after short delay to ensure state updates
      const timer = setTimeout(() => {
        chatState.handleSubmit();
        setInitialSubmitted(true);
        router.replace(`/chat/${id}`, { scroll: false });
      }, 200);

      return () => {
        console.log('Clearing initial message timer');
        clearTimeout(timer);
      };
    }
  }, [initialMessage, initialSubmitted, id, router, chatState]);

  // should update chat state when messages are updated from the server
  useEffect(() => {
    if (messages) {
      chatState.setMessages(messages as Message[]);
    }
  }, [messages, chatState]);

  if (isLoadingMessages) {
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
            <ChatMessages chatState={chatState} />
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