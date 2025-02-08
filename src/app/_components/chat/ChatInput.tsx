"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Loader2, Send } from "lucide-react";

export function ChatInput() {
  const [message, setMessage] = useState("");
  const utils = api.useUtils();
  
  const { mutate: sendMessage, isPending } = api.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      void utils.chat.getMessages.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isPending) return;
    
    sendMessage({ content: message });
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col space-y-2 bg-[#020817] p-4">
      <div className="relative flex-1">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message, paste a Zoom link, or ask for help..."
          className="h-full w-full resize-none rounded-lg border border-gray-700/50 bg-[#0c1425] p-4 pr-12 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-700"
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={!message.trim() || isPending}
          className="absolute bottom-4 right-4 rounded-lg bg-transparent p-1 text-gray-400 transition-colors hover:text-gray-200 disabled:hover:text-gray-400"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </form>
  );
} 