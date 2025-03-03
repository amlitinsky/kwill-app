"use client";

import ChatMessages from "@/app/_components/chat/ChatMessages";
import { api } from "@/trpc/react";
import { ArrowDown, Loader2 } from "lucide-react";
import { type Message, useChat } from "@ai-sdk/react";
import ChatInput from "@/app/_components/chat/ChatInput";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useCallback, useEffect } from "react";

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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const chatMessagesRef = useRef<{ scrollToBottom: () => void }>(null);

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
        clearTimeout(timer);
      };
    }
  }, [initialMessage, initialSubmitted, id, router, chatState]);

  // Handle scroll events on the page's scroll container
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    setIsAtBottom(isAtBottom);
  }, []);

  // Set up scroll listener on the page's scroll container
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Initial check
    handleScroll();
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (isLoadingMessages) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  const handleScrollToBottom = () => {
    chatMessagesRef.current?.scrollToBottom();
  };


  return (
    <div className="flex h-full flex-col">
      {/* Scrollable messages area - THIS is the scrollable container */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-border/80"
      >
        <div className="mx-auto w-full max-w-[750px]">
          <div className="px-4 py-8">
            <ChatMessages 
              chatState={chatState} 
              ref={chatMessagesRef}
            />
          </div>
        </div>
      </div>

      {/* Scroll to bottom button - only shown when not at bottom and not submitting */}
      {!isAtBottom && !chatState.isLoading && (
        <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={handleScrollToBottom}
            className="flex items-center justify-center rounded-full bg-primary p-2 text-primary-foreground shadow hover:bg-primary/90"
            aria-label="Scroll to new messages"
          >
            <ArrowDown className="h-5 w-5" />
          </button>
        </div>
      )}

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