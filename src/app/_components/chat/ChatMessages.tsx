"use client";

import { type useChat } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';
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


  // TODO check if removing the sorted stuff didn't break anything
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
              className={`${
                message.role === 'user'
                  ? 'bg-background text-foreground rounded-lg px-4 py-2 max-w-[80%]'
                  : 'text-foreground w-full'
              }`}
            >
              <ReactMarkdown
                className="max-w-none text-white [&_*]:text-white break-words"
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
              {/* {message.parts?.map(part => (
                part.type !== 'text' && (
                  <div className="tool-invocation mt-2 p-2 border border-white/10 rounded" key={part.type}>
                    <span className="text-sm text-white/60">Tool used: {part.type}</span>
                  </div>
                )
              ))} */}
            </div>
          </div>
        ))}
      <div ref={messagesEndRef} />
    </div>
  );
}