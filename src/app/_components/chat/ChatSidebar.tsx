"use client";

import { api } from "@/trpc/react";
import { PanelLeftOpen, SquarePen, Trash2 } from "lucide-react";
import { useChatContext } from "@/app/_components/context/chat-context";
import { useState } from "react";

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatSidebar({ isOpen, onToggle }: ChatSidebarProps) {
  const { activeChatId, setActiveChatId, setIsNewChat } = useChatContext();
  const utils = api.useUtils();
  const { data: chats } = api.chat.list.useQuery();
  const { mutate: deleteChat } = api.chat.delete.useMutation({
    onSuccess: () => void utils.chat.list.invalidate(),
  });
  const { mutateAsync: createChat } = api.chat.create.useMutation();
  const { mutate: updateChat } = api.chat.update.useMutation({
    onSuccess: () => void utils.chat.list.invalidate(),
  });

  // State for managing dropdown open status
  const [openChatMenu, setOpenChatMenu] = useState<number | null>(null);
  // State for inline editing: which chat is being edited and its current value.
  const [editingChatId, setEditingChatId] = useState<number | null>(null);
  const [editedChatName, setEditedChatName] = useState<string>("");

  // New chat handler:
  // Check for an existing empty chat (with name "New Chat") and reuse it if available;
  // otherwise, create a new fallback chat.
  const handleNewChat = async () => {
    if (chats && chats.length > 0) {
      const emptyChat = chats.find(chat => chat.name === "New Chat");
      
      if (emptyChat) {
        setActiveChatId(emptyChat.id);
        setIsNewChat(true);
        return;
      }
    }

    const newChat = await createChat({ name: "New Chat" });
    
    if (newChat) {
      setActiveChatId(newChat.id);
      setIsNewChat(true);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChat({ id });
    if (activeChatId === id) {
      await handleNewChat();
    }
  };

  // Start inline editing by setting state
  const startEditing = (chatId: number, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chatId);
    setEditedChatName(currentName);
    setOpenChatMenu(null);
  };

  const finishEditing = async (chatId: number, originalName: string) => {
    const trimmed = editedChatName.trim();
    if (trimmed === "") {
      alert("Chat name cannot be empty.");
      return;
    }
    if (trimmed === "New Chat") {
      alert("Chat name cannot be 'New Chat'.");
      return;
    }
    // Update only if name has changed
    if (trimmed !== originalName) {
      updateChat({ id: chatId, name: trimmed });
    }
    setEditingChatId(null);
    setEditedChatName("");
  };

  const handleEditKeyDown = (chatId: number, originalName: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      void finishEditing(chatId, originalName);
    }
    if (e.key === "Escape") {
      setEditingChatId(null);
      setEditedChatName("");
    }
  };
  // If sidebar is closed, render just the icons
  if (!isOpen) {
    return (
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={onToggle}
          className="rounded-md p-1 hover:bg-muted transform transition-transform duration-200 ease-in-out"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </button>
        <button
          onClick={handleNewChat}
          className="rounded-md p-1 hover:bg-muted"
        >
          <SquarePen className="h-5 w-5" />
        </button>
      </div>
    );
  }

  // If sidebar is open, render full sidebar with background
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Sidebar Header */}
      <div className="flex h-14 items-center justify-between p-4">
        <button onClick={onToggle} className="hover:text-foreground/80 transform transition-transform duration-200 ease-in-out">
          <PanelLeftOpen className="h-5 w-5" />
        </button>
        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"
        >
          <SquarePen className="h-5 w-5" />
        </button>
      </div>
      
      {/* Chat list */}
      <div className="flex-1 overflow-y-auto p-4">
        {chats
          ?.filter((chat) => chat.name !== "New Chat")
          .map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setActiveChatId(chat.id);
                setIsNewChat(false);
              }}
              className={`group mb-2 flex cursor-pointer items-center justify-between rounded-lg p-3 ${
                activeChatId === chat.id ? "bg-muted" : "hover:bg-muted/50"
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