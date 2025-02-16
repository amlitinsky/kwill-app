"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { useChatContext } from "@/app/_components/context/chat-context";
import { type useChat } from "@ai-sdk/react";

interface NewChatInputProps {
  chatState: ReturnType<typeof useChat>;
}

export default function NewChatInput({ chatState }: NewChatInputProps) {
   // TODO first message isn't streamed
  const utils = api.useUtils();
  const { setActiveChatId, setIsNewChat } = useChatContext();
  const { mutateAsync: createChat } = api.chat.create.useMutation();
  const { mutateAsync: nameChat } = api.chat.name.useMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { input, handleInputChange, isLoading, setInput } = chatState;

  const handleSubmitNew = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Generate a conversation name based on the user's input
      const nameResponse = await nameChat({ text: input });
      const newChat = await createChat({ name: nameResponse.name });

      if (!newChat) {
        throw new Error("Failed to create chat");
      }

      // CHECK CHANGED ORDER (PUT STUFF ABOVE SUBMIT)
      // Update the conversation context with the new ID
      setActiveChatId(newChat.id);
      setIsNewChat(false);

      // Invalidate the messages query to refresh the UI
      await utils.message.load.invalidate({ chatId: newChat.id });
      await utils.chat.list.invalidate();

      // Now that the conversation ID is set, use the existing handleSubmit from useChat
      // TODO: see if this works, or else change it back we probably only need the content for appending anyways
      await chatState.append({ content: input, role: "user" }, { body: { chatId: newChat.id } });
      setInput("");

    } catch (error) {
      console.error("Error creating chat", error);
    }
    setIsSubmitting(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isSubmitting) void handleSubmitNew(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  return (
    <form onSubmit={handleSubmitNew} className="flex h-full flex-col space-y-2">
      <div className="relative flex-1">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="h-full w-full resize-none rounded-lg border bg-background p-4 pr-12 text-foreground"
          disabled={isSubmitting || isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isSubmitting || isLoading}
          className="absolute bottom-4 right-4 rounded-lg p-1 text-foreground"
        >
          {(isSubmitting || isLoading) ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </form>
  );
} 