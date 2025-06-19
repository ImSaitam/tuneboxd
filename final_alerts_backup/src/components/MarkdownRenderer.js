'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownRenderer = ({ content, className = '' }) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-theme-primary mb-4 border-b border-theme-border pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-theme-primary mb-3 mt-6">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-theme-primary mb-2 mt-4">
              {children}
            </h3>
          ),
          
          // Text formatting
          strong: ({ children }) => (
            <strong className="font-bold text-theme-accent">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-theme-primary">
              {children}
            </em>
          ),
          
          // Links
          a: ({ href, children, ...props }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-theme-accent hover:text-theme-accent/80 underline transition-colors"
            >
              {children}
            </a>
          ),
          
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside my-3 space-y-1 text-theme-secondary">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside my-3 space-y-1 text-theme-secondary">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-theme-secondary leading-relaxed">
              {children}
            </li>
          ),
          
          // Code
          code: ({ inline, children, ...props }) => {
            if (inline) {
              return (
                <code className="bg-theme-card px-2 py-1 rounded text-theme-accent font-mono text-sm border border-theme-border">
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-theme-card border border-theme-border rounded-lg p-4 my-4 overflow-x-auto">
                <code className="text-theme-primary font-mono text-sm">
                  {children}
                </code>
              </pre>
            );
          },
          
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-theme-accent bg-theme-card/50 pl-4 py-2 my-4 italic text-theme-secondary">
              {children}
            </blockquote>
          ),
          
          // Paragraphs
          p: ({ children }) => (
            <p className="text-theme-secondary leading-relaxed mb-4">
              {children}
            </p>
          ),
          
          // Horizontal rules
          hr: () => (
            <hr className="border-theme-border my-6" />
          ),
          
          // Tables (with remark-gfm)
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-theme-border rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-theme-card">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left font-semibold text-theme-primary border-b border-theme-border">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-theme-secondary border-b border-theme-border">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
