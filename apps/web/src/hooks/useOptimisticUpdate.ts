import { useState, useCallback } from 'react';

interface UseOptimisticUpdateOptions<T> {
  initialData: T;
  onUpdate: (data: T) => Promise<void>;
}

/**
 * Optimistic update hook
 * Immediately updates UI, rolls back on error
 */
export function useOptimisticUpdate<T>({ 
  initialData, 
  onUpdate 
}: UseOptimisticUpdateOptions<T>) {
  const [data, setData] = useState(initialData);
  const [isPending, setIsPending] = useState(false);

  const update = useCallback(async (newData: T) => {
    const previousData = data;
    
    // Optimistically update
    setData(newData);
    setIsPending(true);

    try {
      await onUpdate(newData);
    } catch (error) {
      // Rollback on error
      setData(previousData);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [data, onUpdate]);

  return { data, update, isPending };
}

