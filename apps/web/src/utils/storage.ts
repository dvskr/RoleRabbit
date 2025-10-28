/**
 * Storage utilities for local storage management
 */

export class StorageManager {
  private prefix: string;

  constructor(prefix: string = 'roleready_') {
    this.prefix = prefix;
  }

  /**
   * Get item from localStorage
   */
  getItem<T>(key: string, defaultValue?: T): T | null {
    if (typeof window === 'undefined') return defaultValue || null;
    
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue || null;
    }
  }

  /**
   * Set item to localStorage
   */
  setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.prefix + key);
  }

  /**
   * Clear all items with prefix
   */
  clear(): void {
    if (typeof window === 'undefined') return;
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const storageManager = new StorageManager();

