const CACHE_NAME = 'pwa-cache-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './index2.html',
    './styles.css',
    './script.js',
    './manifest.json',
    'https://code.jquery.com/jquery-3.7.1.min.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request);
        })
    );
});
