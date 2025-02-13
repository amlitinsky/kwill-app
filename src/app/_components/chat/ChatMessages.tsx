"use client";

import { type useChat } from '@ai-sdk/react';
import { useEffect, useRef, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aTime - bTime;
    });
  }, [messages]);

  if (isLoading && !messages?.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  // const preserverdMessages = [...messages]

  return (
    <div className="flex flex-col space-y-8">
      {sortedMessages
        .map((message) => (
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
              <ReactMarkdown
                className="max-w-none text-white [&_*]:text-white"
                components={{
                  p: ({ children }) => (
                    <p
                      className={`${
                        message.role === 'assistant' ? 'text-base leading-7' : 'mb-0'
                      } text-white`}
                    >
                      {children}
                    </p>
                  ),
                  a: ({ children, href, ...props }) => (
                    <a
                      {...props}
                      href={href}
                      className="text-white underline hover:text-white/80"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-4 list-disc pl-6 text-white">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-4 list-decimal pl-6 text-white">{children}</ol>
                  ),
                  li: ({ children }) => <li className="my-2 text-white">{children}</li>,
                  code: ({ children }) => (
                    <code className="rounded bg-white/5 px-1 py-0.5 text-white">{children}</code>
                  ),
                  h1: ({ children }) => (
                    <h1 className="mb-4 text-2xl font-semibold text-white">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mb-3 text-xl font-semibold text-white">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mb-2 text-lg font-semibold text-white">{children}</h3>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-white">{children}</strong>
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