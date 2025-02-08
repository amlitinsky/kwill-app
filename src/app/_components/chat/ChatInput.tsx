import { useState } from "react";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="flex h-full flex-col space-y-2">
      <div className="relative flex-1">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message, paste a Zoom link, or ask for help..."
          className="h-full w-full resize-none rounded-lg border p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={!message.trim() || isPending}
          className="absolute bottom-4 right-4 rounded-full bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
} 