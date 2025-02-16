"use client";

import { type useChat } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
interface ChatMessagesProps {
  chatState: ReturnType<typeof useChat>;
}

export function ChatMessages({ chatState }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, isLoading } = chatState;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  if (isLoading && !messages?.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8">
      {messages
        .map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start w-full'
            }`}
          >
            <div
              key={message.id}
              className={`${
                message.role === 'user'
                  ? 'bg-background text-foreground rounded-lg px-4 py-2 max-w-[80%]'
                  : 'text-foreground w-full'
              }`}
            >
              {message.parts.map(part => {
                switch (part.type) {
                  case 'text':
                    return <MarkdownRenderer>{part.text}</MarkdownRenderer>
                  case 'tool-invocation': {
                    const callId = part.toolInvocation.toolCallId;

                    switch (part.toolInvocation.toolName) {
                      case 'getSpreadsheetURL': {
                        switch (part.toolInvocation.state) {
                          case 'call':
                            return <div key={`${callId}`} className="text-white animate-pulse">Getting spreadsheet URL...</div>
                          case 'result':
                            return <div key={`${callId}`} className="text-white">{part.toolInvocation.result}</div>
                        }
                      }
                      case 'getMeetingURL':
                        switch (part.toolInvocation.state) {
                          case 'call':
                            return <div key={`${callId}`} className="text-white animate-pulse">Getting meeting URL...</div>
                          case 'result':
                            return <div key={`${callId}`} className="text-white">{part.toolInvocation.result}</div>
                        }
                    }
                  }
                  break;
                }
              })}
            </div>
          </div>
        ))}
      <div ref={messagesEndRef} />
    </div>
  );
}