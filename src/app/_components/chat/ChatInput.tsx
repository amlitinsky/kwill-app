// "use client";

// import React from "react";
// import ExistingChatInput from "./ExistingChatInput";
// import NewChatInput from "./NewChatInput";
// import { type useChat } from "@ai-sdk/react";

// interface ChatInputProps {
//   chatState: ReturnType<typeof useChat> | null;
// }

// export function ChatInput({ chatState }: ChatInputProps) {
//   // If a valid conversationId exists, render the ExistingChatInput.
//   // Otherwise, render the NewChatInput.
//   return chatState ? (
//     <ExistingChatInput chatState={chatState} />
//   ) : (
//     <NewChatInput />
//   );
// } 