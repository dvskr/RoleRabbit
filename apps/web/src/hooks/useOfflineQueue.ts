/**
 * Hook for offline operation queue
 * FE-032: Offline mode detection and queue operations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';

export interface QueuedOperation {
  id: string;
  type: 'upload' | 'delete' | 'share' | 'update' | 'move';
  payload: any;
  timestamp: number;
  retries: number;
}

const MAX_RETRIES = 3;
const QUEUE_STORAGE_KEY = 'offline_operation_queue';

export const useOfflineQueue = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [queue, setQueue] = useState<QueuedOperation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  // Load queue from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setQueue(parsed);
      }
    } catch (error) {
      logger.error('Failed to load offline queue:', error);
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      logger.error('Failed to save offline queue:', error);
    }
  }, [queue]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      logger.info('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      logger.warn('Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Add operation to queue
  const enqueue = useCallback((operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retries'>) => {
    const queuedOp: QueuedOperation = {
      ...operation,
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    };

    setQueue(prev => [...prev, queuedOp]);
    logger.debug('Operation queued:', queuedOp);
    return queuedOp.id;
  }, []);

  // Remove operation from queue
  const dequeue = useCallback((operationId: string) => {
    setQueue(prev => prev.filter(op => op.id !== operationId));
  }, []);

  // Process queue when online
  useEffect(() => {
    if (!isOnline || queue.length === 0 || processingRef.current) {
      return;
    }

    const processQueue = async (processor: (operation: QueuedOperation) => Promise<void>) => {
      if (processingRef.current) return;
      processingRef.current = true;
      setIsProcessing(true);

      const operations = [...queue];
      for (const operation of operations) {
        if (!navigator.onLine) {
          setIsOnline(false);
          break;
        }

        try {
          await processor(operation);
          dequeue(operation.id);
          logger.debug('Queued operation processed:', operation.id);
        } catch (error) {
          logger.error('Failed to process queued operation:', error);
          // Increment retries
          setQueue(prev => prev.map(op => 
            op.id === operation.id 
              ? { ...op, retries: op.retries + 1 }
              : op
          ));

          // Remove if max retries reached
          if (operation.retries + 1 >= MAX_RETRIES) {
            logger.warn('Operation exceeded max retries, removing from queue:', operation.id);
            dequeue(operation.id);
          }
        }
      }

      processingRef.current = false;
      setIsProcessing(false);
    };

    // Queue processor will be provided by the component using this hook
    // This is just the structure - actual processing happens in useCloudStorage
  }, [isOnline, queue, dequeue]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    try {
      localStorage.removeItem(QUEUE_STORAGE_KEY);
    } catch (error) {
      logger.error('Failed to clear offline queue:', error);
    }
  }, []);

  return {
    isOnline,
    queue,
    isProcessing,
    enqueue,
    dequeue,
    clearQueue,
  };
};

