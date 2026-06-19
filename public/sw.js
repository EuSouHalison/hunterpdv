const CACHE_NAME = 'hunterpdv-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/pdv',
  '/produtos',
  '/clientes',
  '/estoque',
  '/crediario',
  '/relatorios',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Offline' }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseClone = response.clone();

        // Open cache
        caches.open(CACHE_NAME).then((cache) => {
          // Add response to cache
          cache.put(event.request, responseClone);
        });

        return response;
      })
      .catch(() => {
        // Return cached version
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }

          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }

          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Background sync for offline operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-sales') {
    event.waitUntil(syncPendingSales());
  }
});

async function syncPendingSales() {
  // This would sync pending sales from IndexedDB
  // Implementation depends on your offline storage strategy
  console.log('Syncing pending sales...');
}
