"use client";

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '@/trpc/react';
import ReactMarkdown from 'react-markdown';

interface ChatMessagesProps {
  conversationId: number;
}

export function ChatMessages({ conversationId }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: initialMessages } = api.chat.getMessages.useQuery({
    conversationId,
    limit: 50,
  });

  const { messages, isLoading } = useChat({
    body: {
      conversationId,
    },
    id: conversationId.toString(),
    initialMessages: initialMessages?.map(msg => ({
      id: msg.id.toString(),
      content: msg.content,
      role: msg.role as 'user' | 'assistant' | 'system',
    })),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading && !messages?.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!messages?.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-2 text-center">
        <p className="text-lg font-medium text-gray-200">Welcome to Kwill!</p>
        <p className="text-gray-500">Start by typing a message, pasting a Zoom link, or asking for help.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.role === 'user'
                ? 'bg-[#0c1425] text-gray-100'
                : 'bg-[#020817] text-gray-200'
            }`}
          >
            <ReactMarkdown
              className="prose prose-invert prose-sm max-w-none"
              components={{
                // Override default element styling
                p: ({ children }) => <p className="mb-0">{children}</p>,
                a: ({ children, href, ...props }) => (
                  <a {...props} href={href} className="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}