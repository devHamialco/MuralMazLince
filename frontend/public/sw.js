// Minimal Service Worker copied to public for PWA support (WF-3.x)
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

const CACHE_NAME = 'mml-public-v1';
const STATIC_ASSETS = [ '/', '/index.html', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png' ];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(req));
  } else {
    event.respondWith(networkFirst(req));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  return cached || fetch(request).then((resp) => {
    if (resp && resp.ok) cache.put(request, resp.clone());
    return resp;
  });
}

async function networkFirst(request) {
  try {
    const resp = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    if (resp && resp.ok) cache.put(request, resp.clone());
    return resp;
  } catch (err) {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}
