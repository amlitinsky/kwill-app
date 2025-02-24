"use client";

import { useState } from "react";
import { PanelLeftOpen, SquarePen, Trash2, MoreHorizontal } from "lucide-react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatSidebar({ isOpen, onToggle }: ChatSidebarProps) {
  const utils = api.useUtils();
  const { data: chats } = api.chat.list.useQuery();
  const { mutate: deleteChat } = api.chat.delete.useMutation({
    onSuccess: () => void utils.chat.list.invalidate(),
  });
  const { mutate: updateChat } = api.chat.update.useMutation({
    onSuccess: () => void utils.chat.list.invalidate(),
  });
  const router = useRouter();

  // State for managing dropdown open status
  const [openChatMenu, setOpenChatMenu] = useState<string | null>(null);
  // State for inline editing: which chat is being edited and its current value.
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editedChatName, setEditedChatName] = useState<string>("");

  // Update handleNewChat to use the new flow
  const handleNewChat = () => {
    // Simply navigate to the new chat page
    router.push('/chat');
  };

  // Update handleDelete to handle route-based navigation
  const handleDelete = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChat({ id: chatId });
    
    // If we're deleting the active chat, redirect to new chat page
    const currentPath = window.location.pathname;
    if (currentPath.includes(chatId)) {
      router.push('/chat');
    }
  };

  // Update chat item click handler
  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  // Start inline editing by setting state
  const startEditing = (chatId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chatId);
    setEditedChatName(currentName);
    setOpenChatMenu(null);
  };

  const finishEditing = async (chatId: string, originalName: string) => {
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

  const handleEditKeyDown = (chatId: string, originalName: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      void finishEditing(chatId, originalName);
    }
    if (e.key === "Escape") {
      setEditingChatId(null);
      setEditedChatName("");
    }
  };

  if (!isOpen) {
    return (
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={onToggle}
          className="rounded-md p-1 hover:bg-muted transform transition-transform duration-200 ease-in-out"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </button>
        <button onClick={handleNewChat} className="rounded-md p-1 hover:bg-muted">
          <SquarePen className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Sidebar Header */}
      <div className="flex h-14 items-center justify-between p-4">
        <button onClick={onToggle} className="hover:text-foreground/80 transform transition-transform duration-200 ease-in-out">
          <PanelLeftOpen className="h-5 w-5" />
        </button>
        <button onClick={handleNewChat} className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted">
          <SquarePen className="h-5 w-5" />
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4">
        {chats
          ?.filter((chat) => chat.name !== "New Chat")
          .map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatClick(chat.id)}
              className={`group mb-2 flex cursor-pointer items-center justify-between rounded-lg p-3 ${
                window.location.pathname.includes(chat.id) ? "bg-muted" : "hover:bg-muted/50"
              }`}
            >
              {editingChatId === chat.id ? (
                <input
                  type="text"
                  value={editedChatName}
                  onChange={(e) => setEditedChatName(e.target.value)}
                  onBlur={() => finishEditing(chat.id, chat.name ?? "")}
                  onKeyDown={(e) => handleEditKeyDown(chat.id, chat.name ?? "", e)}
                  className="w-full rounded border px-2 py-1 text-sm text-foreground"
                  autoFocus
                />
              ) : (
                <span className="line-clamp-1 text-sm">{chat.name ?? "New Chat"}</span>
              )}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenChatMenu(openChatMenu === chat.id ? null : chat.id);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {openChatMenu === chat.id && editingChatId !== chat.id && (
                  <div className="absolute right-0 top-full mt-1 w-32 rounded bg-background border border-gray-300 p-2 shadow-md z-50">
                    <button
                      onClick={(e) => startEditing(chat.id, chat.name ?? "", e)}
                      className="flex w-full items-center gap-2 px-2 py-1 hover:bg-muted"
                    >
                      <SquarePen className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={(e) => handleDelete(chat.id, e)}
                      className="flex w-full items-center gap-2 px-2 py-1 hover:bg-muted rounded text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
} 