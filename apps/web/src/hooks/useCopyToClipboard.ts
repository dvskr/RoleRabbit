import { useState, useCallback } from 'react';

/**
 * Custom hook for copying text to clipboard
 * 
 * @returns [copy function, copied state, error state]
 */
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(null);
      
      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to copy');
      setCopied(false);
    }
  }, []);

  return [copy, copied, error] as const;
}

