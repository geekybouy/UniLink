/// <reference lib="webworker" />

// This service worker can be customized with various caching strategies

const sw = self as unknown as ServiceWorkerGlobalScope;

// Cache name with version
const CACHE_NAME = 'unilink-cache-v1';

// Core app shell assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html',
  '/robots.txt'
];

// Content that should be available offline
const CONTENT_CACHE_URLS = [
  '/dashboard',
  '/alumni-directory',
  // Add more frequently accessed content URLs here
];

// Install event - precache key resources
sw.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Pre-caching assets');
        return cache.addAll([...PRECACHE_ASSETS, ...CONTENT_CACHE_URLS]);
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

// Fetch event - implement stale-while-revalidate strategy for most requests
sw.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(sw.location.origin)) return;
  
  // Skip browser-sync and socket.io requests (development only)
  if (event.request.url.includes('browser-sync') || 
      event.request.url.includes('socket.io')) return;
  
  // API requests - Network first, fallback to cache
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone response for cache
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              // Only cache successful responses
              if (response.status === 200) {
                cache.put(event.request, responseToCache);
              }
            });
            
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(event.request).then(cachedResponse => {
            // If we have a cached response, return it
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If no cached response, return offline page for HTML requests
            if (event.request.headers.get('accept')?.includes('text/html')) {
              return caches.match('/offline.html');
            }
            
            // Return empty response for other assets
            return new Response(null, { 
              status: 503, 
              statusText: 'Service Unavailable' 
            });
          });
        })
    );
    return;
  }
  
  // HTML pages (navigation) - Network first, fallback to cache or offline page
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then(cachedResponse => {
            // If we have a cached version of this page, return it
            if (cachedResponse) {
              return cachedResponse;
            }
            // Otherwise return the offline page
            return caches.match('/offline.html');
          });
        })
    );
    return;
  }
  
  // For assets (JS, CSS, images) - Cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response immediately if available
        if (cachedResponse) {
          // Refresh cache in background (stale-while-revalidate)
          fetch(event.request).then(response => {
            if (response.status === 200) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, response);
              });
            }
          }).catch(err => console.log('[ServiceWorker] Error updating cache:', err));
          
          return cachedResponse;
        }
        
        // If not in cache, get from network
        return fetch(event.request)
          .then(response => {
            // Return the response and cache it for later
            const responseToCache = response.clone();
            
            if (response.status === 200) {
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return response;
          })
          .catch(() => {
            // Network failed
            
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

// Handle push notifications
sw.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New notification from UniLink',
      icon: '/logo192.png',
      badge: '/badge.png',
      data: data.data || {},
    };
    
    event.waitUntil(
      sw.registration.showNotification(data.title || 'UniLink Notification', options)
    );
  } catch (err) {
    console.error('[ServiceWorker] Push notification error:', err);
  }
});

// Notification click event handler
sw.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/notifications';
  
  event.waitUntil(
    sw.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // If a tab is already open, focus it
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise open a new tab
      if (sw.clients.openWindow) {
        return sw.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle messages from client
sw.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    sw.skipWaiting();
  }
});
