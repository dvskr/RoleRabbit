/**
 * Storage Utility
 * Abstracted local/session storage operations
 */

/**
 * Local Storage
 */
export const localStorage = {
  get: <T>(key: string): T | null => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('LocalStorage set failed:', error);
    }
  },
  
  remove: (key: string): void => {
    window.localStorage.removeItem(key);
  },
  
  clear: (): void => {
    window.localStorage.clear();
  }
};

/**
 * Session Storage
 */
export const sessionStorage = {
  get: <T>(key: string): T | null => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('SessionStorage set failed:', error);
    }
  },
  
  remove: (key: string): void => {
    window.sessionStorage.removeItem(key);
  },
  
  clear: (): void => {
    window.sessionStorage.clear();
  }
};
