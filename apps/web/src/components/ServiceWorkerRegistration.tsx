'use client';

/**
 * Service Worker Registration Component
 * FE-061: Service worker for offline file caching
 */

import { useEffect } from 'react';
import { serviceWorkerManager } from '../utils/serviceWorker';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Register service worker on mount
    serviceWorkerManager
      .register()
      .then((registration) => {
        if (registration) {
          console.log('[Service Worker] Registered successfully');
        }
      })
      .catch((error) => {
        console.error('[Service Worker] Registration error:', error);
      });

    // Handle service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[Service Worker] Controller changed - reloading page');
        // Optionally reload the page when a new service worker takes control
        // window.location.reload();
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'CACHE_CLEARED') {
          console.log('[Service Worker] Cache cleared');
        }
      });
    }
  }, []);

  // This component doesn't render anything
  return null;
}

