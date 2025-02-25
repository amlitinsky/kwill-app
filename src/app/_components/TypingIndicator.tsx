"use client";

export function TypingIndicator() {
  return (
    <div className="flex space-x-2">
      <div
        className="w-3 h-3 bg-blue-500 rounded-full animate-ping"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="w-3 h-3 bg-blue-500 rounded-full animate-ping"
        style={{ animationDelay: "0.2s" }}
      />
      <div
        className="w-3 h-3 bg-blue-500 rounded-full animate-ping"
        style={{ animationDelay: "0.4s" }}
      />
    </div>
  );
}