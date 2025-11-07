/**
 * Offline queue utility for storing failed operations
 * Automatically retries when connection is restored
 */

export interface QueuedOperation {
  id: string;
  type: 'save' | 'delete' | 'update';
  endpoint: string;
  payload: any;
  options: RequestInit;
  timestamp: number;
  retries: number;
}

const QUEUE_STORAGE_KEY = 'roleReady_offline_queue';
const MAX_QUEUE_SIZE = 50;
const MAX_RETRIES = 3;

class OfflineQueue {
  private queue: QueuedOperation[] = [];
  private isProcessing = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadQueue();
    this.setupOnlineListener();
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        // Remove operations older than 24 hours
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        this.queue = this.queue.filter(op => (now - op.timestamp) < oneDay);
        this.saveQueue();
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Setup listener for online/offline events
   */
  private setupOnlineListener(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.processQueue();
    });
  }

  /**
   * Add operation to queue
   */
  add(
    type: QueuedOperation['type'],
    endpoint: string,
    payload: any,
    options: RequestInit = {}
  ): string {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const operation: QueuedOperation = {
      id,
      type,
      endpoint,
      payload,
      options,
      timestamp: Date.now(),
      retries: 0,
    };

    // Remove oldest operations if queue is full
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      this.queue.shift();
    }

    this.queue.push(operation);
    this.saveQueue();

    // Try to process immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }

    return id;
  }

  /**
   * Remove operation from queue
   */
  remove(id: string): void {
    this.queue = this.queue.filter(op => op.id !== id);
    this.saveQueue();
  }

  /**
   * Get all queued operations
   */
  getAll(): QueuedOperation[] {
    return [...this.queue];
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue = [];
    this.saveQueue();
  }

  /**
   * Process queue (retry failed operations)
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || !navigator.onLine || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const operations = [...this.queue];
      
      for (const operation of operations) {
        try {
          // Check if operation has exceeded max retries
          if (operation.retries >= MAX_RETRIES) {
            this.remove(operation.id);
            continue;
          }

          // Attempt to execute operation
          const response = await fetch(operation.endpoint, {
            ...operation.options,
            body: operation.payload ? JSON.stringify(operation.payload) : undefined,
            headers: {
              'Content-Type': 'application/json',
              ...operation.options.headers,
            },
            credentials: 'include',
          });

          if (response.ok) {
            // Success - remove from queue
            this.remove(operation.id);
          } else {
            // Failed - increment retry count
            operation.retries++;
            const index = this.queue.findIndex(op => op.id === operation.id);
            if (index !== -1) {
              this.queue[index] = operation;
            }
            this.saveQueue();
          }
        } catch (error) {
          // Network error - increment retry count
          operation.retries++;
          const index = this.queue.findIndex(op => op.id === operation.id);
          if (index !== -1) {
            this.queue[index] = operation;
          }
          this.saveQueue();
        }

        // Add small delay between operations
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Subscribe to queue changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify listeners of queue changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

// Singleton instance
export const offlineQueue = new OfflineQueue();

