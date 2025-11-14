import React from 'react';
import { escapeHtml } from '../../utils/sanitize';

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  // Simple markdown renderer (for production, use a library like react-markdown)
  // SECURITY: This escapes HTML first to prevent XSS attacks
  const renderMarkdown = (text: string) => {
    // IMPORTANT: Escape HTML entities first to prevent XSS
    // This converts <script> to &lt;script&gt; before markdown processing
    let html = escapeHtml(text);

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-10 mb-4">$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-500 hover:underline">$1</a>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>');

    // Lists
    html = html.replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>');
    html = html.replace(/(<li.*<\/li>)/g, '<ul class="list-disc my-2">$1</ul>');

    // Paragraphs
    const paragraphs = html.split('\n\n');
    html = paragraphs.map(p => {
      if (!p.startsWith('<')) {
        return `<p class="my-3">${p}</p>`;
      }
      return p;
    }).join('');

    return { __html: html };
  };

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={renderMarkdown(content)}
    />
  );
}

/**
 * SECURITY NOTE:
 *
 * This component provides basic XSS protection by escaping HTML before markdown processing.
 * However, for production applications with user-generated content, it's strongly
 * recommended to use a battle-tested library like:
 *
 * - react-markdown: https://github.com/remarkjs/react-markdown
 * - remark-gfm: For GitHub Flavored Markdown support
 * - rehype-sanitize: For HTML sanitization
 *
 * Example:
 * ```tsx
 * import ReactMarkdown from 'react-markdown';
 * import remarkGfm from 'remark-gfm';
 * import rehypeSanitize from 'rehype-sanitize';
 *
 * <ReactMarkdown
 *   remarkPlugins={[remarkGfm]}
 *   rehypePlugins={[rehypeSanitize]}
 * >
 *   {content}
 * </ReactMarkdown>
 * ```
 */

