"use client";

import { type useChat } from "@ai-sdk/react";
import { Send, Loader2 } from "lucide-react";

interface ExistingChatInputProps {
  chatState: ReturnType<typeof useChat>;
}

export default function ExistingChatInput({ chatState }: ExistingChatInputProps) {
  const { input, handleInputChange, handleSubmit, isLoading } = chatState;

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col space-y-2">
      <div className="relative flex-1">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="h-full w-full resize-none rounded-lg border bg-background p-4 pr-12 text-foreground"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input || isLoading}
          className="absolute bottom-4 right-4 rounded-lg p-1 text-foreground"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </div>
    </form>
  );
} 