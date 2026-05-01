const CACHE_VERSION = 'v3';
const STATIC_CACHE = `medrecord-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `medrecord-runtime-${CACHE_VERSION}`;
const APP_SHELL = [
    '/',
    '/index.html',
    '/manifest.json',
    '/logo.png',
    '/app.js',
    '/src/main.js'
];

const FIREBASE_HOSTS = ['firebaseapp.com', 'googleapis.com', 'gstatic.com'];

const isFirebaseRequest = (url) => FIREBASE_HOSTS.some((host) => url.hostname.includes(host));
const isStaticAsset = (url) => /\.(css|js|png|jpg|jpeg|svg|webp|ico|woff2?)$/i.test(url.pathname);

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys
                .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
                .map((key) => caches.delete(key))
        )).then(() => self.clients.claim())
    );
});

async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    const networkFetch = fetch(request).then((response) => {
        if (response.ok && response.type !== 'opaque') {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => cached);

    return cached || networkFetch;
}

async function networkFirstNavigation(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        return (await cache.match(request)) || (await caches.match('/index.html'));
    }
}

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (isFirebaseRequest(url)) return;

    if (request.mode === 'navigate') {
        event.respondWith(networkFirstNavigation(request));
        return;
    }

    if (isStaticAsset(url)) {
        event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
        return;
    }

    event.respondWith(
        caches.open(RUNTIME_CACHE).then(async (cache) => {
            const cached = await cache.match(request);
            if (cached) return cached;
            try {
                const response = await fetch(request);
                if (response.ok && response.type !== 'opaque') {
                    cache.put(request, response.clone());
                }
                return response;
            } catch (error) {
                return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
            }
        })
    );
});
