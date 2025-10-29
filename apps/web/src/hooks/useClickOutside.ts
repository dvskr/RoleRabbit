import { useEffect, useRef, RefObject } from 'react';

/**
 * Custom hook to detect clicks outside a referenced element
 * 
 * @param handler - Callback to execute on outside click
 * @returns Ref to attach to element
 */
export function useClickOutside<T extends HTMLElement>(
  handler: () => void
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handler]);

  return ref;
}

