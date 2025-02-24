import React from 'react';
import ReactMarkdown from 'react-markdown';

export function MarkdownRenderer({ children }: { children: string}) {
  return (
    <ReactMarkdown
      className="max-w-none text-white [&_*]:text-white break-words"
      components={{
        p: ({ children, ...props }) => (
          <p className="text-base leading-7 text-white" {...props}>
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
        ul: ({ children, ...props }) => (
          <ul className="my-4 list-disc pl-6 text-white" {...props}>
            {children}
          </ul>
        ),
        ol: ({ children, ...props }) => (
          <ol className="my-4 list-decimal pl-6 text-white" {...props}>
            {children}
          </ol>
        ),
        li: ({ children, ...props }) => (
          <li className="my-2 text-white" {...props}>
            {children}
          </li>
        ),
        code: ({ children, ...props }) => (
          <code className="rounded bg-white/5 px-1 py-0.5 text-white" {...props}>
            {children}
          </code>
        ),
        h1: ({ children, ...props }) => (
          <h1 className="mb-4 text-2xl font-semibold text-white" {...props}>
            {children}
          </h1>
        ),
        h2: ({ children, ...props }) => (
          <h2 className="mb-3 text-xl font-semibold text-white" {...props}>
            {children}
          </h2>
        ),
        h3: ({ children, ...props }) => (
          <h3 className="mb-2 text-lg font-semibold text-white" {...props}>
            {children}
          </h3>
        ),
        strong: ({ children, ...props }) => (
          <strong className="font-semibold text-white" {...props}>
            {children}
          </strong>
        ),
        // Table support:
        table: ({ children, ...props }) => (
          <table className="table-auto w-full text-white border-collapse" {...props}>
            {children}
          </table>
        ),
        thead: ({ children, ...props }) => (
          <thead className="bg-gray-800" {...props}>
            {children}
          </thead>
        ),
        tbody: ({ children, ...props }) => (
          <tbody {...props}>
            {children}
          </tbody>
        ),
        tr: ({ children, ...props }) => (
          <tr className="border border-white/10" {...props}>
            {children}
          </tr>
        ),
        th: ({ children, ...props }) => (
          <th className="px-4 py-2 border border-white/10 text-white" {...props}>
            {children}
          </th>
        ),
        td: ({ children, ...props }) => (
          <td className="px-4 py-2 border border-white/10 text-white" {...props}>
            {children}
          </td>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}