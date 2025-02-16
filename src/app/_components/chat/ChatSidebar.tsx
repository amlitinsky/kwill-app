"use client";

import { api } from "@/trpc/react";
import { PanelLeftOpen, SquarePen, Trash2 } from "lucide-react";
import { useChatContext } from "@/app/_components/context/chat-context";

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatSidebar({ onToggle }: ChatSidebarProps) {
  const { activeChatId, setActiveChatId, setIsNewChat } = useChatContext();
  const utils = api.useUtils();
  const { data: chats } = api.chat.list.useQuery();
  const { mutate: deleteChat } = api.chat.delete.useMutation({
    onSuccess: () => void utils.chat.list.invalidate(),
  });

  const handleNewChat = () => {
    setActiveChatId(null);
    setIsNewChat(true);
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChat({ id });
    if (activeChatId === id) {
      setActiveChatId(null);
      setIsNewChat(true);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center justify-between p-4">
        <button onClick={onToggle} className="hover:text-foreground/80">
          <PanelLeftOpen className="h-5 w-5" />
        </button>
        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"
        >
          <SquarePen className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {chats?.map((chat) => (
          <div
            key={chat.id}
            onClick={() => {
              setActiveChatId(chat.id);
              setIsNewChat(false);
            }}
            className={`group mb-2 flex cursor-pointer items-center justify-between rounded-lg p-3 ${
              activeChatId === chat.id 
                ? "bg-muted" 
                : "hover:bg-muted/50"
            }`}
          >
            <span className="line-clamp-1 text-sm">
              {chat.name ?? "New Chat"}
            </span>
            <button
              onClick={(e) => handleDelete(chat.id, e)}
              className="invisible text-muted-foreground hover:text-foreground group-hover:visible"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 