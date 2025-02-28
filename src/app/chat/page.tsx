"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";
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
      console.error('Failed to create chat:', error);
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

  // TODO: use icon for loading stat and change default placeholder and maybe text box size
  return (
    <div className="flex h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-semibold mb-4">What can I analyze for you?</h1>
      <form onSubmit={handleNewChatSubmit} className="w-full max-w-[750px]">
        <div className="relative flex">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Link a spreadsheet or paste a meeting link..."
            className="w-full h-24 rounded-lg border bg-background p-4 text-foreground resize-none"
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
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
