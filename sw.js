// ============================================================
// MedRecord Pro - Service Worker
// ============================================================

const CACHE_NAME = 'medrecord-pro-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    '/logo.png',
    '/logo-white.png',
    'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.css',
    'https://unpkg.com/@phosphor-icons/web'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => cacheName !== CACHE_NAME)
                        .map((cacheName) => {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Activation complete');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip Firebase API requests (let them go through network)
    if (url.hostname.includes('firebaseio.com') || 
        url.hostname.includes('googleapis.com') ||
        url.hostname.includes('firebase')) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached response and update cache in background
                    fetchAndCache(request);
                    return cachedResponse;
                }
                
                // Not in cache, fetch from network
                return fetchAndCache(request);
            })
            .catch(() => {
                // Network failed, try to return offline page
                if (request.destination === 'document') {
                    return caches.match('/index.html');
                }
                return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
            })
    );
});

// Fetch and cache helper
async function fetchAndCache(request) {
    try {
        const response = await fetch(request);
        
        // Don't cache non-success responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
        }
        
        // Clone response for caching
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
            .then((cache) => {
                cache.put(request, responseToCache);
            });
        
        return response;
    } catch (error) {
        console.error('[SW] Fetch failed:', error);
        throw error;
    }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync triggered:', event.tag);
    
    if (event.tag === 'sync-data') {
        event.waitUntil(syncPendingData());
    }
});

// Sync pending data when online
async function syncPendingData() {
    try {
        // Get pending operations from IndexedDB
        // This would sync any offline changes to Firebase
        console.log('[SW] Syncing pending data...');
    } catch (error) {
        console.error('[SW] Sync failed:', error);
    }
}

// Push notification handling
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');
    
    const options = {
        body: event.data?.text() || 'Nueva notificación',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            { action: 'view', title: 'Ver', icon: '/icons/check.png' },
            { action: 'dismiss', title: 'Descartar', icon: '/icons/x.png' }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('MedRecord Pro', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling from main app
self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);
    
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
