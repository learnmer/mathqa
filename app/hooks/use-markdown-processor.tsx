// src/hooks/use-markdown-processor.tsx

// highlight.js syntax highlighting theme for the code blocks.
import "highlight.js/styles/base16/green-screen.css";
// Import all of the necessary packages.
import { createElement, useMemo } from "react";
import rehypeHighlight from "rehype-highlight";
import rehypeMathjax from "rehype-mathjax";
import rehypeReact from "rehype-react";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import * as prod from "react/jsx-runtime";

export const useMarkdownProcessor = (content: string) => {
  return useMemo(() => {
    return (
      unified()
        // Parse the raw string
        .use(remarkParse)
        // Add support for GitHub-flavored Markdown
        .use(remarkGfm)
        // Convert the remark tree (Markdown) into a rehype tree (HTML)
        .use(remarkMath)
        .use(remarkRehype)
        // Add support for syntax highlighting (and avoid throwing when it's an unknown language)
        .use(rehypeHighlight, { ignoreMissing: true } as unknown as boolean)
        .use(rehypeMathjax)
        // Convert the rehype tree (HTML) into a React component tree,
        // with custom components for each element...
        .use(rehypeReact, {
          createElement,
          Fragment: prod.Fragment,
          jsx: prod.jsx,
          jsxs: prod.jsxs,
          components: {
            a: ({ href, children }: JSX.IntrinsicElements["a"]) => (
              <a href={href} target="_blank" rel="noreferrer" className="...">
                {children}
              </a>
            ),
            h1: ({ children, id }: JSX.IntrinsicElements["h1"]) => (
              <h1 className="..." id={id}>
                {children}
              </h1>
            ),
            h2: ({ children, id }: JSX.IntrinsicElements["h2"]) => (
              <h2 className="..." id={id}>
                {children}
              </h2>
            ),
            h3: ({ children, id }: JSX.IntrinsicElements["h3"]) => (
              <h3 className="..." id={id}>
                {children}
              </h3>
            ),
            h4: ({ children, id }: JSX.IntrinsicElements["h4"]) => (
              <h4 className="..." id={id}>
                {children}
              </h4>
            ),
            h5: ({ children, id }: JSX.IntrinsicElements["h5"]) => (
              <h5 className="..." id={id}>
                {children}
              </h5>
            ),
            h6: ({ children, id }: JSX.IntrinsicElements["h6"]) => (
              <h6 className="..." id={id}>
                {children}
              </h6>
            ),
            p: ({ children }: JSX.IntrinsicElements["p"]) => {
              return <p className="...">{children}</p>;
            },
            strong: ({ children }: JSX.IntrinsicElements["strong"]) => (
              <strong className="...">{children}</strong>
            ),
            em: ({ children }: JSX.IntrinsicElements["em"]) => (
              <em>{children}</em>
            ),
            code: CodeBlock,
            pre: ({ children }: JSX.IntrinsicElements["pre"]) => {
              return (
                <div className="...">
                  <pre className="...">{children}</pre>
                </div>
              );
            },
            ul: ({ children }: JSX.IntrinsicElements["ul"]) => (
              <ul className="...">{children}</ul>
            ),
            ol: ({ children }: JSX.IntrinsicElements["ol"]) => (
              <ol className="...">{children}</ol>
            ),
            li: ({ children }: JSX.IntrinsicElements["li"]) => (
              <li className="...">{children}</li>
            ),
            table: ({ children }: JSX.IntrinsicElements["table"]) => (
              <div className="...">
                <table className="...">{children}</table>
              </div>
            ),
            thead: ({ children }: JSX.IntrinsicElements["thead"]) => (
              <thead className="...">{children}</thead>
            ),
            th: ({ children }: JSX.IntrinsicElements["th"]) => (
              <th className="...">{children}</th>
            ),
            td: ({ children }: JSX.IntrinsicElements["td"]) => (
              <td className="...">{children}</td>
            ),
            blockquote: ({ children }: JSX.IntrinsicElements["blockquote"]) => (
              <blockquote className="...">{children}</blockquote>
            ),
          },
        } as unknown as boolean)
        .processSync(content).result
    );
  }, [content]);
};

// A more complex custom component for the `code` element.
const CodeBlock = ({ children, className }: JSX.IntrinsicElements["code"]) => {
  // Highlight.js adds a `className` so this is a hack to detect if the code block
  // is a language block wrapped in a `pre` tag versus an inline `code` tag.
  if (className) {
    return <code className={className}>{children}</code>;
  }

  // Handle an inline `code` tag.
  return <code className="...">{children}</code>;
};
