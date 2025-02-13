"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { useConversation } from "@/app/_components/context/conversation-context";

export default function NewChatInput() {
  const { setActiveConversationId, setIsNewConversation } = useConversation();
  const { mutateAsync: createConversation } = api.conversation.create.useMutation();
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value);

  const handleSubmitNew = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Create a new conversation with a name based on the first message.
      const newConversation = await createConversation({
        name: input.slice(0, 20) || "New Chat",
      });
      if (!newConversation) {
        throw new Error("Failed to create conversation");
      }
      // Update context
      setActiveConversationId(newConversation.id);
      setIsNewConversation(false);
      // Send the initial message manually
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: input }],
          conversationId: newConversation.id,
        }),
      });
    } catch (error) {
      console.error("Error creating conversation", error);
    }
    setInput("");
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
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={!input.trim() || isSubmitting}
          className="absolute bottom-4 right-4 rounded-lg p-1 text-foreground"
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </div>
    </form>
  );
} 