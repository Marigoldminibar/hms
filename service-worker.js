const CACHE_NAME = "marigold-hms-v2";

const urlsToCache = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",

    "./core/storage.js",
    "./core/state.js",
    "./core/helpers.js",
    "./core/security.js",

    "./data/products.js",
    "./data/rooms.js",

    "./modules/admin.js",
    "./modules/auth.js",
    "./modules/backup.js",
    "./modules/excel.js",
    "./modules/photo.js",
    "./modules/reports.js",
    "./modules/staff.js",
    "./modules/stock.js",

    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});