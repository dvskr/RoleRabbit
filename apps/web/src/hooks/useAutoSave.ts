import { useEffect, useRef } from 'react';

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => void;
  delay?: number;
}

/**
 * Auto-save hook
 * Automatically saves data after a delay when data changes
 */
export function useAutoSave({ data, onSave, delay = 1000 }: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSave(data);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay]);
}

