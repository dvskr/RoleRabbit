/**
 * State Persistence Utilities
 * Section 1.10: State Persistence & Auto-save
 */

/**
 * Check if code is running on client side
 */
export const isClient = typeof window !== 'undefined';

/**
 * Storage interface for type safety
 */
interface StorageData<T> {
  data: T;
  timestamp: number;
  version?: string;
}

/**
 * Save data to localStorage with timestamp
 * Requirement #2: localStorage fallback
 *
 * @param key - Storage key
 * @param data - Data to save
 * @param version - Optional version for migration
 */
export function saveToLocalStorage<T>(
  key: string,
  data: T,
  version?: string
): boolean {
  if (!isClient) return false;

  try {
    const storageData: StorageData<T> = {
      data,
      timestamp: Date.now(),
      version,
    };
    localStorage.setItem(key, JSON.stringify(storageData));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

/**
 * Load data from localStorage
 * Requirement #2: localStorage fallback
 *
 * @param key - Storage key
 * @param maxAge - Maximum age in milliseconds (optional)
 * @returns Data if found and valid, null otherwise
 */
export function loadFromLocalStorage<T>(
  key: string,
  maxAge?: number
): T | null {
  if (!isClient) return null;

  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const storageData: StorageData<T> = JSON.parse(item);

    // Check if data is too old
    if (maxAge && Date.now() - storageData.timestamp > maxAge) {
      localStorage.removeItem(key);
      return null;
    }

    return storageData.data;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * Remove data from localStorage
 *
 * @param key - Storage key
 */
export function removeFromLocalStorage(key: string): void {
  if (!isClient) return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}

/**
 * Clear all localStorage data for a prefix
 *
 * @param prefix - Key prefix to match
 */
export function clearLocalStorageByPrefix(prefix: string): void {
  if (!isClient) return;

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}

/**
 * Get localStorage usage
 *
 * @returns Object with used and total bytes
 */
export function getLocalStorageUsage(): { used: number; total: number } {
  if (!isClient) return { used: 0, total: 0 };

  try {
    let used = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    // Most browsers limit localStorage to 5-10MB
    const total = 5 * 1024 * 1024; // 5MB
    return { used, total };
  } catch (error) {
    console.error('Failed to get localStorage usage:', error);
    return { used: 0, total: 0 };
  }
}

/**
 * Conflict detection utilities
 * Requirement #6: Conflict detection
 */

export interface ConflictInfo {
  hasConflict: boolean;
  localTimestamp: number;
  serverTimestamp: number;
  message?: string;
}

/**
 * Detect if there's a conflict between local and server data
 *
 * @param localTimestamp - Local data timestamp
 * @param serverTimestamp - Server data timestamp
 * @returns Conflict information
 */
export function detectConflict(
  localTimestamp: number,
  serverTimestamp: number
): ConflictInfo {
  const hasConflict = serverTimestamp > localTimestamp;

  return {
    hasConflict,
    localTimestamp,
    serverTimestamp,
    message: hasConflict
      ? 'This data was updated in another session. Your changes may overwrite recent changes.'
      : undefined,
  };
}

/**
 * Optimistic update utilities
 * Requirement #5: Optimistic updates
 */

export interface OptimisticUpdate<T> {
  id: string;
  previousState: T;
  newState: T;
  timestamp: number;
  status: 'pending' | 'success' | 'error';
}

/**
 * Create an optimistic update record
 *
 * @param id - Update identifier
 * @param previousState - State before update
 * @param newState - State after update
 * @returns Optimistic update record
 */
export function createOptimisticUpdate<T>(
  id: string,
  previousState: T,
  newState: T
): OptimisticUpdate<T> {
  return {
    id,
    previousState,
    newState,
    timestamp: Date.now(),
    status: 'pending',
  };
}

/**
 * Format timestamp for display
 * Requirement #4: Last saved indicator
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted string (e.g., "2 minutes ago")
 */
export function formatLastSaved(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds} seconds ago`;
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

/**
 * Format timestamp as absolute time
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted string (e.g., "2:30 PM")
 */
export function formatAbsoluteTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Check if online
 *
 * @returns True if browser is online
 */
export function isOnline(): boolean {
  if (!isClient) return true;
  return navigator.onLine;
}

/**
 * Generate storage key with prefix
 *
 * @param prefix - Key prefix
 * @param id - Unique identifier
 * @returns Storage key
 */
export function generateStorageKey(prefix: string, id: string): string {
  return `${prefix}:${id}`;
}

/**
 * Debounce utility for auto-save
 *
 * @param func - Function to debounce
 * @param wait - Milliseconds to wait
 * @returns Debounced function with cancel method
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = function (this: any, ...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func.apply(this, args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  } as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

/**
 * Deep equality check
 *
 * @param a - First value
 * @param b - Second value
 * @returns True if deeply equal
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}
