"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/trpc/react";

export default function NewChatPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const createChat = api.chat.create.useMutation();

  const handleNewChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const defaultChatName = input.substring(0, 20) || "New Chat";
      const newChat = await createChat.mutateAsync({ name: defaultChatName });
      if (newChat) {
        router.push(`/chat/${newChat.id}?message=${encodeURIComponent(input)}`);
      }
    } catch (error) {
      console.error("Failed to create chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      void handleNewChatSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-semibold mb-4">What can I analyze for you?</h1>
      <form onSubmit={handleNewChatSubmit} className="w-full max-w-[750px]">
        <div className="relative flex">
          <input
            type="text"
            placeholder="Type your message to start the conversation..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border bg-background p-4 text-foreground"
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-4 top-4"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Send"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
