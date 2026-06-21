"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import CodeCopyButton from "@/components/CodeCopyButton";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractText(children: React.ReactNode): string {
  let text = "";
  React.Children.forEach(children, (child: unknown) => {
    if (typeof child === "string" || typeof child === "number") {
      text += String(child);
    } else if (child && typeof child === "object") {
      const el = child as Record<string, unknown>;
      const props = el.props as Record<string, unknown> | undefined;
      if (props && props.children !== undefined) {
        text += extractText(props.children as React.ReactNode);
      }
    }
  });
  return text;
}

const components: Partial<Components> = {
  h2: ({ children, ...props }) => {
    const text = extractText(children);
    const id = slugify(text);
    return <h2 id={id} {...props}>{children}</h2>;
  },
  h3: ({ children, ...props }) => {
    const text = extractText(children);
    const id = slugify(text);
    return <h3 id={id} {...props}>{children}</h3>;
  },
  h4: ({ children, ...props }) => {
    const text = extractText(children);
    const id = slugify(text);
    return <h4 id={id} {...props}>{children}</h4>;
  },
  // Code blocks with copy button
  pre: ({ children, ...props }) => {
    // Extract the raw code text from the <code> child
    let codeText = "";
    React.Children.forEach(children, (child: unknown) => {
      if (child && typeof child === "object") {
        const el = child as Record<string, unknown>;
        if (el.props && typeof el.props === "object") {
          const codeProps = el.props as Record<string, unknown>;
          if (typeof codeProps.children === "string") {
            codeText = codeProps.children;
          } else if (codeProps.children) {
            codeText = extractText(codeProps.children as React.ReactNode);
          }
        }
      }
    });

    return (
      <div className="relative group">
        <CodeCopyButton code={codeText} />
        <pre {...props}>{children}</pre>
      </div>
    );
  },
};

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}
