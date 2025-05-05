
/// <reference lib="webworker" />

// This service worker is registered by vite-plugin-pwa
// It's minimal since most functionality is handled by the plugin

const sw = self as unknown as ServiceWorkerGlobalScope;

// Cache name with version
const CACHE_NAME = 'unilink-cache-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html'
];

// Install event - precache key resources
sw.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Pre-caching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Force waiting service worker to become active
        return sw.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
sw.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            return cacheName !== CACHE_NAME;
          }).map(cacheName => {
            console.log('[ServiceWorker] Removing old cache', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        // Claim clients so the page is controlled immediately
        return sw.clients.claim();
      })
  );
});

// Fetch event - serve from cache, falling back to network
sw.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(sw.location.origin)) return;
  
  // Skip browser-sync and socket.io requests (development only)
  if (event.request.url.includes('browser-sync') || 
      event.request.url.includes('socket.io')) return;
  
  // Network first for API requests
  if (event.request.url.includes('/api/')) {
    return event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone response for cache
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
  
  // Cache first for assets
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Not in cache, get from network
        return fetch(event.request)
          .then(response => {
            // Return the response and cache it for later
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return response;
          })
          .catch(() => {
            // Network failed, show offline page
            if (event.request.headers.get('accept')?.includes('text/html')) {
              return caches.match('/offline.html');
            }
            
            // Return a placeholder for images
            if (event.request.headers.get('accept')?.includes('image/')) {
              return new Response(null, { 
                status: 404, 
                statusText: 'Not found' 
              });
            }
            
            // Return empty response for other assets
            return new Response(null, { 
              status: 503, 
              statusText: 'Service Unavailable' 
            });
          });
      })
  );
});

// Handle messages from client
sw.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    sw.skipWaiting();
  }
});
