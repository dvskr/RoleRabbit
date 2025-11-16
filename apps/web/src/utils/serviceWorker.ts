/**
 * Service Worker Registration and Management
 * FE-061: Service worker for offline file caching
 */

export interface ServiceWorkerMessage {
  type: string;
  cacheName?: string;
  url?: string;
  fileData?: Blob | ArrayBuffer;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean;

  constructor() {
    // Only check navigator in browser environment (not during SSR)
    this.isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator;
  }

  /**
   * Register the service worker
   */
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported) {
      console.warn('[Service Worker] Not supported in this browser');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      this.registration = registration;

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[Service Worker] New version available');
              // Notify user that a new version is available
              this.notifyUpdateAvailable();
            }
          });
        }
      });

      // Check for updates every hour
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);

      console.log('[Service Worker] Registered successfully');
      return registration;
    } catch (error) {
      console.error('[Service Worker] Registration failed:', error);
      return null;
    }
  }

  /**
   * Unregister the service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      this.registration = null;
      console.log('[Service Worker] Unregistered successfully');
      return result;
    } catch (error) {
      console.error('[Service Worker] Unregistration failed:', error);
      return false;
    }
  }

  /**
   * Clear specific cache
   */
  async clearCache(cacheName?: string): Promise<void> {
    if (!this.registration || !this.registration.active) {
      console.warn('[Service Worker] No active service worker');
      return;
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_CLEARED') {
          console.log('[Service Worker] Cache cleared:', cacheName || 'all');
          resolve();
        } else if (event.data.error) {
          reject(new Error(event.data.error));
        }
      };

      this.registration!.active!.postMessage(
        {
          type: 'CLEAR_CACHE',
          cacheName,
        } as ServiceWorkerMessage,
        [messageChannel.port2]
      );

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Cache clear timeout'));
      }, 5000);
    });
  }

  /**
   * Cache a file for offline access
   */
  async cacheFile(url: string, fileData: Blob | ArrayBuffer): Promise<void> {
    if (!this.registration || !this.registration.active) {
      console.warn('[Service Worker] No active service worker');
      return;
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'FILE_CACHED') {
          console.log('[Service Worker] File cached:', url);
          resolve();
        } else if (event.data.error) {
          reject(new Error(event.data.error));
        }
      };

      this.registration!.active!.postMessage(
        {
          type: 'CACHE_FILE',
          url,
          fileData,
        } as ServiceWorkerMessage,
        [messageChannel.port2]
      );

      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error('File cache timeout'));
      }, 10000);
    });
  }

  /**
   * Check if service worker is active
   */
  isActive(): boolean {
    return this.registration !== null && this.registration.active !== null;
  }

  /**
   * Get service worker registration
   */
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  /**
   * Notify user that an update is available
   */
  private notifyUpdateAvailable(): void {
    // This can be enhanced to show a UI notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('RoleReady Update Available', {
        body: 'A new version of RoleReady is available. Refresh to update.',
        icon: '/favicon.svg',
      });
    }
  }
}

// Create singleton instance
// Only create instance in browser environment (lazy initialization)
let serviceWorkerManagerInstance: ServiceWorkerManager | null = null;

export const serviceWorkerManager: ServiceWorkerManager = (() => {
  if (typeof window !== 'undefined') {
    if (!serviceWorkerManagerInstance) {
      serviceWorkerManagerInstance = new ServiceWorkerManager();
    }
    return serviceWorkerManagerInstance;
  }
  // Return a stub for SSR
  return {
    isSupported: false,
    register: async () => null,
    unregister: async () => false,
    update: async () => null,
    getRegistration: async () => null,
    cacheFile: async () => {},
    clearCache: async () => {},
    getCacheSize: async () => 0,
  } as ServiceWorkerManager;
})();

/**
 * Hook to register service worker in React components
 */
export function useServiceWorker() {
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    serviceWorkerManager
      .register()
      .then((registration) => {
        setIsRegistered(!!registration);
        setIsActive(serviceWorkerManager.isActive());
      })
      .catch((error) => {
        console.error('Failed to register service worker:', error);
      });

    // Listen for service worker controller changes
    if ('serviceWorker' in navigator) {
      const handleControllerChange = () => {
        setIsActive(serviceWorkerManager.isActive());
      };

      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, []);

  return {
    isRegistered,
    isActive,
    clearCache: serviceWorkerManager.clearCache.bind(serviceWorkerManager),
    cacheFile: serviceWorkerManager.cacheFile.bind(serviceWorkerManager),
    unregister: serviceWorkerManager.unregister.bind(serviceWorkerManager),
  };
}

// React import for the hook
import React from 'react';

