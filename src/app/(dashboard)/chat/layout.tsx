"use client";

import { useState } from "react";
import { PanelLeftOpen, SquarePen } from "lucide-react";
import { ChatProvider, useChatContext } from "@/app/_components/context/chat-context";
import { ChatSidebar } from "@/app/_components/chat/ChatSidebar";

// Create an inner component that uses the context
function ChatLayoutInner({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { setActiveChatId, setIsNewChat } = useChatContext();

  const handleNewChat= () => {
    setActiveChatId(null);
    setIsNewChat(true);
  };

  return (
    <div className="flex h-screen bg-card text-foreground">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-background transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isSidebarOpen ? "lg:relative lg:translate-x-0" : "lg:hidden"}`}
      >
        <ChatSidebar 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      {/* Desktop Sidebar Toggle Button */}
      {!isSidebarOpen && (
        <div className="fixed left-4 top-4 z-50 flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-md p-1 hover:bg-background/50"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
          <button
            onClick={handleNewChat}
            className="rounded-md p-1 hover:bg-background/50"
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
    <ChatProvider>
      <ChatLayoutInner>{children}</ChatLayoutInner>
    </ChatProvider>
  );
} 