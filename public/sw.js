/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const CACHE_NAME = 'lordteca-retro-v2';
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

  // App shell (HTML navigation, JS, CSS, db.json): NETWORK-FIRST.
  // This guarantees that after every deploy, the browser always gets the
  // latest code first. Cache is only used as a fallback when offline.
  const isAppShell = event.request.mode === 'navigate' ||
                      url.pathname === '/db.json' ||
                      url.pathname.endsWith('.js') ||
                      url.pathname.endsWith('.css') ||
                      url.pathname.startsWith('/src/') ||
                      url.pathname.startsWith('/@');

  if (isAppShell) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Everything else (ROMs, cover art, logos, fonts): CACHE-FIRST.
  // These are immutable/rarely-changing assets, so serving from cache is safe and fast.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
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

          // 3. Fonts
          const isStatic = url.pathname.includes('fonts.googleapis') || 
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