/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const CACHE_NAME = 'lordteca-retro-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/db.json',
  '/favicon.ico',
];

// Install Event - Pre-cache vital shell files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Retro SW] Pre-caching static app shell');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Retro SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Handle offline requests with caching strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests or internal/browser extensions
  if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Handle caching strategies
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached immediately, but refresh background for main dynamic assets
        if (url.pathname === '/db.json' || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
              }
            })
            .catch(() => {}); // ignore offline background refresh failures
        }
        return cachedResponse;
      }

      // Fetch from network and dynamically cache
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // Caching candidates:
          // 1. ROM files
          const isRom = /\.(zip|7z|bin|sfc|nes|gba|gbc|gb|smc|cue|iso|nds|pce)$/i.test(url.pathname) || 
                        url.pathname.includes('/roms/') || 
                        url.searchParams.has('rom') ||
                        url.pathname.toLowerCase().includes('rom');
          
          // 2. Cover Art and Logos
          const isCover = url.hostname.includes('raw.githubusercontent') || 
                          url.pathname.includes('/covers/') || 
                          url.pathname.includes('/logos/') ||
                          url.pathname.includes('Named_Boxarts');

          // 3. Static Assets, Modules, and fonts
          const isStatic = url.pathname.startsWith('/src/') || 
                          url.pathname.startsWith('/@') || 
                          url.pathname.endsWith('.js') || 
                          url.pathname.endsWith('.css') || 
                          url.pathname.includes('fonts.googleapis') || 
                          url.pathname.includes('fonts.gstatic');

          if (isRom || isCover || isStatic) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return networkResponse;
        })
        .catch((err) => {
          // If offline and request fails
          console.log('[Retro SW] Fetch failed for:', url.pathname, err);
          return null;
        });
    })
  );
});
