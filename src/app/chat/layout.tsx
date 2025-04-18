"use client";

import { useState } from "react";
import { ChatSidebar } from "@/app/_components/chat/ChatSidebar";
import { PricingButton } from "@/app/_components/pricing/PricingButton";
import { PricingModalWrapper } from "@/app/_components/pricing/PricingModalWrapper";
import { MeetingHoursDisplay } from "@/app/_components/subscription/MeetingHoursDisplay";

// Create an inner component that uses the context
function ChatLayoutInner({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toggle function passed to ChatSidebar
  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-card text-foreground">
      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen 
            ? "translate-x-0 border-r border-border" 
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <ChatSidebar 
          isOpen={isSidebarOpen} 
          onToggle={handleToggleSidebar}
        />
      </div>

      {/* Main Content - with transition */}
      <div 
        className={`flex flex-1 flex-col transition-all duration-200 ease-in-out ${
          isSidebarOpen ? "lg:ml-64" : "ml-0"
        }`}
      >
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      {/* Status Components */}
      <div className="fixed bottom-4 left-4 z-50 flex items-center space-x-3">
        <PricingButton />
        <MeetingHoursDisplay />
      </div>
      <PricingModalWrapper />
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
    <ChatLayoutInner>{children}</ChatLayoutInner>
  );
} 