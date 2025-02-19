"use client";

import { type useChat } from "@ai-sdk/react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  chatState: ReturnType<typeof useChat>;
}

export default function ChatInput({ chatState }: ChatInputProps) {
  const { input, messages, handleInputChange, handleSubmit, isLoading } = chatState;

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
      }
    }
  };

  const isEmpty = !messages || messages.length === 0;

  // Define the input form as a reusable JSX block.
  const inputForm = (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col space-y-2 h-full`}
    >
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
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </form>
  );

  // loading state
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If there are no messages, wrap the form in the centered empty-state container.
  if (isEmpty) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="mx-auto text-center space-y-8 w-full max-w-[750px]">
          <h1 className="text-4xl font-semibold text-foreground">
            What can I analyze for you?
          </h1>
          {inputForm}
        </div>
      </div>
    );
  }

  // Otherwise, just render the form normally.
  return <>{inputForm}</>;
} 