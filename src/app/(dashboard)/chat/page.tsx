import { ChatInput } from "@/app/_components/chat/ChatInput";
import { ChatMessages } from "@/app/_components/chat/ChatMessages";

export default function ChatPage() {
  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex-1 overflow-y-auto">
        <ChatMessages />
      </div>
      <div className="h-[120px]">
        <ChatInput />
      </div>
    </div>
  );
} 