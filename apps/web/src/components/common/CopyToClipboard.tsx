/**
 * Copy to Clipboard Component
 * Requirement 1.12.11: Copy-to-clipboard buttons with success feedback
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface CopyToClipboardProps {
  text: string;
  label?: string;
  successMessage?: string;
  showIcon?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onCopy?: () => void;
}

/**
 * Copy to Clipboard Button Component
 * Shows success feedback after copying
 */
export function CopyToClipboardButton({
  text,
  label = 'Copy',
  successMessage = 'Copied!',
  showIcon = true,
  variant = 'default',
  size = 'md',
  onCopy,
}: CopyToClipboardProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      onCopy?.();

      // Reset after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback: create temporary textarea
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      setIsCopied(true);
      onCopy?.();
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [text, onCopy]);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  };

  const variantClasses = {
    default: isCopied
      ? 'bg-green-600 hover:bg-green-700 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white',
    outline: isCopied
      ? 'border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
      : 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
    ghost: isCopied
      ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
  };

  return (
    <button
      onClick={handleCopy}
      className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
        isCopied ? 'scale-105' : ''
      }`}
      title={isCopied ? successMessage : `Copy ${label}`}
    >
      {showIcon && (
        <>
          {isCopied ? (
            <Check size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="animate-bounce-once" />
          ) : (
            <Copy size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
          )}
        </>
      )}
      <span>{isCopied ? successMessage : label}</span>
    </button>
  );
}

/**
 * Inline Copy to Clipboard
 * Copy icon that appears next to text
 */
export function InlineCopyButton({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${className}`}
      title={isCopied ? 'Copied!' : 'Copy to clipboard'}
    >
      {isCopied ? (
        <Check size={14} className="text-green-600 dark:text-green-400" />
      ) : (
        <Copy size={14} className="text-gray-500 dark:text-gray-400" />
      )}
    </button>
  );
}

/**
 * Copy Code Block
 * Code block with syntax highlighting and copy button
 */
export function CopyCodeBlock({
  code,
  language = 'text',
  filename,
  showLineNumbers = false,
}: {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const lines = code.split('\n');

  return (
    <div className="relative group bg-gray-900 dark:bg-gray-950 rounded-lg overflow-hidden">
      {/* Header */}
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
          <span className="text-sm text-gray-400 font-mono">{filename}</span>
          <span className="text-xs text-gray-500 uppercase">{language}</span>
        </div>
      )}

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className={`absolute ${
          filename ? 'top-12' : 'top-2'
        } right-2 px-3 py-1.5 rounded transition-all opacity-0 group-hover:opacity-100 ${
          isCopied
            ? 'bg-green-600 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
        }`}
      >
        {isCopied ? (
          <span className="flex items-center gap-1 text-sm">
            <Check size={14} />
            Copied!
          </span>
        ) : (
          <span className="flex items-center gap-1 text-sm">
            <Copy size={14} />
            Copy
          </span>
        )}
      </button>

      {/* Code */}
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-gray-100">
          {showLineNumbers ? (
            lines.map((line, index) => (
              <div key={index} className="table-row">
                <span className="table-cell pr-4 text-gray-500 select-none text-right">
                  {index + 1}
                </span>
                <span className="table-cell">{line}</span>
              </div>
            ))
          ) : (
            code
          )}
        </code>
      </pre>
    </div>
  );
}

/**
 * Copy URL Field
 * Input field with integrated copy button
 */
export function CopyURLField({
  url,
  label,
  showOpenLink = true,
}: {
  url: string;
  label?: string;
  showOpenLink?: boolean;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={url}
            readOnly
            className="w-full px-4 py-2 pr-24 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCopy}
            className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded transition-colors ${
              isCopied
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {isCopied ? (
              <span className="flex items-center gap-1 text-xs">
                <Check size={12} />
                Copied
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs">
                <Copy size={12} />
                Copy
              </span>
            )}
          </button>
        </div>
        {showOpenLink && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            title="Open in new tab"
          >
            <ExternalLink size={18} />
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * Hook for copy to clipboard functionality
 */
export function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }, []);

  return { copyToClipboard, isCopied };
}

/**
 * Add to global CSS for bounce animation
 */
export const copyAnimationStyles = `
@keyframes bounce-once {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.animate-bounce-once {
  animation: bounce-once 0.3s ease-in-out;
}
`;
