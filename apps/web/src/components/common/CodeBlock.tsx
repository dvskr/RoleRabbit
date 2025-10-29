import React, { useState } from 'react';
import { Button } from './Button';

interface CodeBlockProps {
  code: string;
  language?: string;
  fileName?: string;
}

export function CodeBlock({ code, language, fileName }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        {fileName && (
          <span className="text-sm text-gray-300 font-mono">{fileName}</span>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          className="text-xs"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className={`language-${language || 'javascript'}`}>{code}</code>
      </pre>
    </div>
  );
}

