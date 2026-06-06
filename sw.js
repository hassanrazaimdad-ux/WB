// Wali Bhai Pharmacy - Service Worker
// PWABuilder compliant - proper file registration

const CACHE_NAME = 'wali-bhai-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// ── INSTALL ──────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ─────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH (Network first, cache fallback) ─────────────────
self.addEventListener('fetch', event => {
  // Skip non-GET and API calls (Railway backend)
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline fallback
        return caches.match(event.request).then(cached => {
          return cached || caches.match('/index.html');
        });
      })
  );
});

// ── PUSH NOTIFICATIONS (future use) ──────────────────────
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Wali Bhai Pharmacy', {
      body: data.body || 'New message from Wali Bhai Pharmacy',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-96.png'
    })
  );
});
