"use client";

import { useState } from "react";
import { PanelLeftOpen, SquarePen } from "lucide-react";
import { ConversationProvider, useConversation } from "@/app/_components/context/conversation-context";
import { ChatSidebar } from "@/app/_components/chat/ChatSidebar";
import { api } from "@/trpc/react";

// Create an inner component that uses the context
function ChatLayoutInner({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { setActiveConversationId } = useConversation();
  const utils = api.useUtils();

  const { mutate: createConversation } = api.conversation.create.useMutation({
    onSuccess: (newConversation) => {
      if (newConversation?.id) {
        setActiveConversationId(newConversation.id);
      }
      void utils.conversation.getAll.invalidate();
    },
  });

  const handleNewConversation = () => {
    createConversation({ name: "New Chat" });
  };

  return (
    <div className="flex h-screen bg-[#020817] text-white">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-[#0c1425] transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isSidebarOpen ? "lg:relative" : "lg:hidden"}`}
      >
        <ChatSidebar 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">

        {/* Main Content Area */}
        <main className="relative flex-1 overflow-hidden bg-[#020817]">
          <div className="absolute inset-0">
            <div
              className={`h-full w-full transition-transform duration-200 ${
                isSidebarOpen ? "lg:translate-x-32" : "lg:translate-x-0"
              }`}
            >
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Desktop Sidebar Toggle Button (when sidebar is closed) */}
      {!isSidebarOpen && (
        <div className="fixed left-4 top-4 z-50 flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-md p-1 hover:bg-gray-800"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
          <button
            onClick={handleNewConversation}
            className="rounded-md p-1 hover:bg-gray-800"
          >
            <SquarePen className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

// Main layout component that provides the context
export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConversationProvider>
      <ChatLayoutInner>{children}</ChatLayoutInner>
    </ConversationProvider>
  );
} 