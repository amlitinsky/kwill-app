"use client";

import { type useChat } from '@ai-sdk/react';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { MarkdownRenderer } from '@/app/_components/MarkdownRenderer';
import { TypingIndicator } from '../TypingIndicator';

interface ChatMessagesProps {
  chatState: ReturnType<typeof useChat>;
}

// Use forwardRef to create the component
const ChatMessages = forwardRef<{ scrollToBottom: () => void }, ChatMessagesProps>(
  function ChatMessages({ chatState }, ref) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll] = useState(true);
    const lastMessageCountRef = useRef(0);
    
    const { messages, isLoading } = chatState;

    // Auto-scroll logic
    useEffect(() => {
      const isNewMessage = messages.length > lastMessageCountRef.current;
      lastMessageCountRef.current = messages.length;
      
      if (shouldAutoScroll && (isNewMessage || messages.length <= 2)) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }, [messages, shouldAutoScroll]);

    // Expose a method to scroll to bottom
    const scrollToBottom = useCallback(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Make this method available to parent via ref
    useImperativeHandle(ref, () => ({
      scrollToBottom
    }), [scrollToBottom]);

    return (
      <div className="flex flex-col space-y-8">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start w-full'
            }`}
          >
            <div
              className={`${
                message.role === 'user'
                  ? 'bg-background text-foreground rounded-lg px-4 py-2 max-w-[80%]'
                  : 'text-foreground w-full'
              }`}
            >
              {message.parts.map(part => {
                switch (part.type) {
                  case 'text':
                    return <MarkdownRenderer key={message.id}>{part.text}</MarkdownRenderer>
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
        {isLoading && (
          <div className="flex items-center justify-start pl-4">
            <TypingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    );
  }
);

export default ChatMessages;
