import { ChatInput } from "@/app/_components/chat/ChatInput";
import { ChatMessages } from "@/app/_components/chat/ChatMessages";

export default function ChatPage() {
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col space-y-4 p-4">
      <div className="flex-1 overflow-y-auto rounded-lg border bg-white p-4 shadow-sm">
        <ChatMessages />
      </div>
      <div className="h-[120px]">
        <ChatInput />
      </div>
    </div>
  );
} 