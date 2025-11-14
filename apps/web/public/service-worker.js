/**
 * Service Worker for RoleRabbit
 * Provides offline support and caching for Progressive Web App functionality
 */

const CACHE_VERSION = 'v1.2.0';
const CACHE_NAME = `rolerabbit-${CACHE_VERSION}`;

// Caching strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
};

// Resources to cache immediately on install
const PRECACHE_RESOURCES = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/fonts/inter-var.woff2',
  '/css/main.css',
];

// Route-based caching strategies
const CACHE_RULES = [
  {
    pattern: /^https:\/\/api\.rolerabbit\.com\/api\/templates$/,
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    cacheName: 'templates-api',
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 5 * 60, // 5 minutes
    },
  },
  {
    pattern: /^https:\/\/api\.rolerabbit\.com\/api\/templates\/.+$/,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheName: 'template-details',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 10 * 60, // 10 minutes
    },
  },
  {
    pattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: 'images',
    expiration: {
      maxEntries: 200,
      maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
    },
  },
  {
    pattern: /\.(?:woff|woff2|ttf|otf)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: 'fonts',
    expiration: {
      maxEntries: 30,
      maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
    },
  },
  {
    pattern: /\.(?:js|css)$/,
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    cacheName: 'static-assets',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 24 * 60 * 60, // 1 day
    },
  },
];

/**
 * Install event - precache resources
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('[Service Worker] Precaching resources');
        await cache.addAll(PRECACHE_RESOURCES);
        console.log('[Service Worker] Precaching complete');

        // Activate immediately
        await self.skipWaiting();
      } catch (error) {
        console.error('[Service Worker] Precaching failed:', error);
      }
    })()
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
      );

      // Take control of all pages
      await self.clients.claim();
      console.log('[Service Worker] Activated and claimed clients');
    })()
  );
});

/**
 * Fetch event - handle requests with caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and dev tools
  if (url.protocol === 'chrome-extension:' || url.protocol === 'devtools:') {
    return;
  }

  // Find matching cache rule
  const rule = CACHE_RULES.find((rule) => rule.pattern.test(request.url));

  if (rule) {
    event.respondWith(handleRequest(request, rule));
  } else {
    // Default to network-first for unmatched requests
    event.respondWith(
      handleRequest(request, {
        strategy: CACHE_STRATEGIES.NETWORK_FIRST,
        cacheName: CACHE_NAME,
      })
    );
  }
});

/**
 * Handle request based on caching strategy
 */
async function handleRequest(request, rule) {
  const { strategy, cacheName = CACHE_NAME, expiration } = rule;

  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, cacheName, expiration);

    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, cacheName, expiration);

    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, cacheName, expiration);

    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request);

    case CACHE_STRATEGIES.CACHE_ONLY:
      return caches.match(request);

    default:
      return networkFirst(request, cacheName, expiration);
  }
}

/**
 * Cache First strategy
 */
async function cacheFirst(request, cacheName, expiration) {
  const cached = await caches.match(request);

  if (cached) {
    // Check expiration
    if (expiration && isCacheExpired(cached, expiration)) {
      // Fetch fresh copy in background
      fetchAndCache(request, cacheName).catch(console.error);
      return cached; // Return stale while revalidating
    }
    return cached;
  }

  try {
    const response = await fetch(request);
    await cacheResponse(request, response.clone(), cacheName, expiration);
    return response;
  } catch (error) {
    console.error('[Service Worker] Cache first failed:', error);
    return getOfflineFallback(request);
  }
}

/**
 * Network First strategy
 */
async function networkFirst(request, cacheName, expiration) {
  try {
    const response = await fetch(request);
    await cacheResponse(request, response.clone(), cacheName, expiration);
    return response;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache');
    const cached = await caches.match(request);

    if (cached) {
      return cached;
    }

    return getOfflineFallback(request);
  }
}

/**
 * Stale While Revalidate strategy
 */
async function staleWhileRevalidate(request, cacheName, expiration) {
  const cached = await caches.match(request);

  // Always fetch fresh copy in background
  const fetchPromise = fetchAndCache(request, cacheName, expiration);

  // Return cached immediately if available
  if (cached) {
    return cached;
  }

  // Wait for network if no cache
  try {
    return await fetchPromise;
  } catch (error) {
    return getOfflineFallback(request);
  }
}

/**
 * Fetch and cache response
 */
async function fetchAndCache(request, cacheName, expiration) {
  const response = await fetch(request);
  await cacheResponse(request, response.clone(), cacheName, expiration);
  return response;
}

/**
 * Cache response with expiration
 */
async function cacheResponse(request, response, cacheName, expiration) {
  if (!response || response.status !== 200 || response.type === 'error') {
    return;
  }

  const cache = await caches.open(cacheName);

  // Add metadata for expiration
  if (expiration) {
    const metadata = {
      cachedAt: Date.now(),
      maxAge: expiration.maxAgeSeconds * 1000,
    };

    // Store metadata in headers
    const modifiedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers({
        ...Object.fromEntries(response.headers),
        'X-Cache-Metadata': JSON.stringify(metadata),
      }),
    });

    await cache.put(request, modifiedResponse);
  } else {
    await cache.put(request, response);
  }

  // Enforce cache size limits
  if (expiration?.maxEntries) {
    await enforceMaxEntries(cacheName, expiration.maxEntries);
  }
}

/**
 * Check if cache is expired
 */
function isCacheExpired(response, expiration) {
  try {
    const metadataHeader = response.headers.get('X-Cache-Metadata');
    if (!metadataHeader) return false;

    const metadata = JSON.parse(metadataHeader);
    const age = Date.now() - metadata.cachedAt;

    return age > metadata.maxAge;
  } catch (error) {
    return false;
  }
}

/**
 * Enforce maximum cache entries
 */
async function enforceMaxEntries(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxEntries) {
    // Remove oldest entries
    const toDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(toDelete.map((key) => cache.delete(key)));
  }
}

/**
 * Get offline fallback
 */
async function getOfflineFallback(request) {
  const url = new URL(request.url);

  // Return cached offline page for HTML
  if (request.headers.get('accept')?.includes('text/html')) {
    return caches.match('/offline') || new Response('Offline', { status: 503 });
  }

  // Return placeholder for images
  if (request.headers.get('accept')?.includes('image')) {
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#e5e7eb"/><text x="50%" y="50%" text-anchor="middle" fill="#6b7280">Offline</text></svg>',
      {
        headers: { 'Content-Type': 'image/svg+xml' },
      }
    );
  }

  // Generic error response
  return new Response('Service Unavailable', { status: 503 });
}

/**
 * Message event - handle messages from clients
 */
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      (async () => {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        event.ports[0].postMessage({ success: true });
      })()
    );
  }

  if (event.data.type === 'GET_CACHE_STATUS') {
    event.waitUntil(
      (async () => {
        const cacheNames = await caches.keys();
        const status = await Promise.all(
          cacheNames.map(async (name) => {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            return { name, size: keys.length };
          })
        );
        event.ports[0].postMessage({ status });
      })()
    );
  }
});

/**
 * Push notification event
 */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.url || '/',
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Close' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title || 'RoleRabbit', options));
});

/**
 * Notification click event
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});

console.log(`[Service Worker] Loaded version ${CACHE_VERSION}`);
