const CACHE_NAME = 'improv-assist-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/animals',
  '/emotions',
  '/places',
  '/epochs',
  '/characters',
  '/objects',
  '/scenarios',
  '/timer',
  '/warmups',
  '/constraints',
  '/hiha',
  '/help',
  '/feedback',
  '/icon.svg',
  '/favicon.svg',
  '/manifest.json',
];

// Install Event - cache core static resources and subpages
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching offline assets and pages');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - clean up obsolete caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - intercept request and apply offline caching strategy
self.addEventListener('fetch', (event) => {
  // Only intercept same-origin GET requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Cache-First strategy for hashed static Next.js assets
        if (event.request.url.includes('/_next/static/')) {
          return cachedResponse;
        }

        // Network-First with cache fallback for regular pages and local files
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);
      }

      // Not in cache - fetch from network and dynamically cache assets
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const contentType = networkResponse.headers.get('content-type');
          const isHtml = contentType && contentType.includes('text/html');
          const isNextAsset = event.request.url.includes('/_next/');
          const isIcon = event.request.url.includes('/icon.svg') || event.request.url.includes('/favicon.svg');

          if (isHtml || isNextAsset || isIcon) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
        }
        return networkResponse;
      });
    })
  );
});
