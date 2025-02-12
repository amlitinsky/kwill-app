"use client";

import { useChat } from '@ai-sdk/react';
import { Send, Loader2 } from 'lucide-react';
import { type KeyboardEvent } from 'react';

interface ChatInputProps {
  conversationId: number;
}

export function ChatInput({ conversationId }: ChatInputProps) {
  const { input, handleInputChange, handleSubmit, isLoading } = useChat({
    body: {
      conversationId,
    },
    id: conversationId.toString(),
  });

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col space-y-2">
      <div className="relative flex-1">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder="Type a message, paste a Zoom link, or ask for help..."
          className="h-full w-full resize-none rounded-lg border border-gray-700/50 bg-[#0c1425] p-4 pr-12 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-700"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input || isLoading}
          className="absolute bottom-4 right-4 rounded-lg bg-transparent p-1 text-gray-400 transition-colors hover:text-gray-200 disabled:hover:text-gray-400"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </form>
  );
} 