/**
 * Service Worker for RoleReady
 * FE-061: Service worker for offline file caching
 */

const CACHE_NAME = 'roleready-v1';
const FILE_CACHE_NAME = 'roleready-files-v1';
const API_CACHE_NAME = 'roleready-api-v1';

// Cache duration (7 days for files, 5 minutes for API responses)
const FILE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;
const API_CACHE_DURATION = 5 * 60 * 1000;

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching essential resources');
      return cache.addAll([
        '/',
        '/dashboard',
        '/favicon.svg',
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== FILE_CACHE_NAME &&
            cacheName !== API_CACHE_NAME
          ) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Helper function to check if cache entry is expired
function isCacheExpired(cachedResponse, maxAge) {
  if (!cachedResponse) return true;
  const cachedDate = new Date(cachedResponse.headers.get('date') || 0);
  const now = new Date();
  return now - cachedDate > maxAge;
}

// Helper function to get cache based on URL pattern
function getCacheForRequest(url) {
  // File download URLs
  if (url.includes('/api/storage/files/') && url.includes('/download')) {
    return FILE_CACHE_NAME;
  }
  // API endpoints
  if (url.includes('/api/')) {
    return API_CACHE_NAME;
  }
  // Static assets
  return CACHE_NAME;
}

// Fetch event - cache files and API responses
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Cache strategy for file downloads
  if (url.pathname.includes('/api/storage/files/') && url.pathname.includes('/download')) {
    event.respondWith(
      caches.open(FILE_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        
        // Check if cached file is still valid
        if (cachedResponse && !isCacheExpired(cachedResponse, FILE_CACHE_DURATION)) {
          console.log('[Service Worker] Serving cached file:', url.pathname);
          return cachedResponse;
        }

        try {
          // Try to fetch from network
          const networkResponse = await fetch(request);
          
          if (networkResponse.ok) {
            // Clone the response before caching
            const responseToCache = networkResponse.clone();
            await cache.put(request, responseToCache);
            console.log('[Service Worker] Cached file:', url.pathname);
            return networkResponse;
          }
          
          // If network fails and we have cached version, use it
          if (cachedResponse) {
            console.log('[Service Worker] Network failed, using cached file:', url.pathname);
            return cachedResponse;
          }
          
          return networkResponse;
        } catch (error) {
          console.error('[Service Worker] Fetch error:', error);
          
          // Return cached version if available (even if expired)
          if (cachedResponse) {
            console.log('[Service Worker] Using stale cached file:', url.pathname);
            return cachedResponse;
          }
          
          // Return offline fallback
          return new Response('File unavailable offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' },
          });
        }
      })
    );
    return;
  }

  // Cache strategy for API responses (shorter cache duration)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        
        // Check if cached API response is still valid
        if (cachedResponse && !isCacheExpired(cachedResponse, API_CACHE_DURATION)) {
          console.log('[Service Worker] Serving cached API response:', url.pathname);
          return cachedResponse;
        }

        try {
          // Try to fetch from network
          const networkResponse = await fetch(request);
          
          if (networkResponse.ok) {
            // Clone the response before caching
            const responseToCache = networkResponse.clone();
            await cache.put(request, responseToCache);
            return networkResponse;
          }
          
          // If network fails and we have cached version, use it
          if (cachedResponse) {
            console.log('[Service Worker] Network failed, using cached API response:', url.pathname);
            return cachedResponse;
          }
          
          return networkResponse;
        } catch (error) {
          console.error('[Service Worker] API fetch error:', error);
          
          // Return cached version if available
          if (cachedResponse) {
            console.log('[Service Worker] Using stale cached API response:', url.pathname);
            return cachedResponse;
          }
          
          // Return offline fallback for API
          return new Response(
            JSON.stringify({ error: 'Offline - data unavailable' }),
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      })
    );
    return;
  }

  // Default: network-first strategy for static assets
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        throw error;
      }
    })
  );
});

// Message handler for cache management from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (event.data.cacheName) {
              // Clear specific cache
              if (cacheName === event.data.cacheName) {
                return caches.delete(cacheName);
              }
            } else {
              // Clear all caches
              return caches.delete(cacheName);
            }
          })
        );
      }).then(() => {
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'CACHE_CLEARED' });
          });
        });
      })
    );
  }

  if (event.data && event.data.type === 'CACHE_FILE') {
    const { url, fileData } = event.data;
    event.waitUntil(
      caches.open(FILE_CACHE_NAME).then(async (cache) => {
        try {
          // Convert Blob to Response if needed
          let response;
          if (fileData instanceof Blob) {
            response = new Response(fileData, {
              headers: {
                'Content-Type': fileData.type || 'application/octet-stream',
                'Date': new Date().toISOString(),
                'Cache-Control': `max-age=${FILE_CACHE_DURATION / 1000}`,
              },
            });
          } else if (fileData instanceof ArrayBuffer) {
            response = new Response(fileData, {
              headers: {
                'Content-Type': 'application/octet-stream',
                'Date': new Date().toISOString(),
                'Cache-Control': `max-age=${FILE_CACHE_DURATION / 1000}`,
              },
            });
          } else {
            response = new Response(JSON.stringify(fileData), {
              headers: {
                'Content-Type': 'application/json',
                'Date': new Date().toISOString(),
              },
            });
          }
          
          await cache.put(url, response);
          console.log('[Service Worker] File cached successfully:', url);
          
          // Notify client that file was cached
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ type: 'FILE_CACHED', url });
          }
        } catch (error) {
          console.error('[Service Worker] Failed to cache file:', error);
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ type: 'ERROR', error: error.message });
          }
        }
      })
    );
  }
});

