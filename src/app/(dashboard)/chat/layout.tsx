"use client";

import { useState } from "react";
import { Menu, SidebarClose, PanelLeftOpen } from "lucide-react";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#020817] text-white">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-[#0c1425] transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isSidebarOpen ? "lg:relative" : "lg:hidden"}`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-14 items-center px-4">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="hover:text-gray-300"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          </div>
          
          {/* Sidebar Content - We can add message history here later */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Message history will go here */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 items-center px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-md p-1 hover:bg-gray-800 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            {isSidebarOpen ? (
              <h1 className="text-xl font-semibold">Kwill</h1>
            ) : null}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="relative flex-1 overflow-hidden bg-[#020817]">
          <div className="absolute inset-0 flex justify-center">
            <div className={`h-full w-full max-w-3xl transition-transform duration-200 ${
              isSidebarOpen ? "lg:translate-x-32" : "lg:translate-x-0"
            }`}>
              <div className="h-full bg-[#020817]">
                {children}
              </div>
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
          <h1 className="text-xl font-semibold">Kwill</h1>
        </div>
      )}
    </div>
  );
} 