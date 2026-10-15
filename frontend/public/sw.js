/**
 * Service Worker — Mural Maz Lince (T13, implementacion-11.md)
 *
 * Estrategias:
 *   - Cache-First  → recursos estáticos del mismo origen (HTML, CSS, JS, íconos)
 *   - Network-First → llamadas al API del backend (requests a otro host o rutas /api)
 *
 * Fallback offline:
 *   - Estáticos de navegación → sirve '/' desde caché
 *   - API → respuesta JSON 503 con mensaje legible
 *
 * Invalidación de caché: al activar se eliminan versiones antiguas (CACHE_NAME distinto).
 * El SW no interfiere con cookies HttpOnly porque no intercepta POST/PUT/PATCH/DELETE.
 */

const CACHE_NAME = 'mml-v2';
const API_CACHE_NAME = 'mml-api-v2';

/** Recursos estáticos precacheados en install */
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  // Activa inmediatamente sin esperar a que se cierre la pestaña anterior
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name)),
      ),
    ),
  );
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo interceptar GET
  if (request.method !== 'GET') return;

  // Solo http/https
  if (!url.protocol.startsWith('http')) return;

  // API o recurso externo → Network-First
  if (url.pathname.startsWith('/api') || url.hostname !== self.location.hostname) {
    event.respondWith(networkFirst(request, API_CACHE_NAME));
    return;
  }

  // Estáticos propios → Cache-First
  event.respondWith(cacheFirst(request, CACHE_NAME));
});

// ── Cache-First ───────────────────────────────────────────────────────────────
/**
 * Sirve desde caché; si no hay entrada, va a red y guarda la respuesta.
 * Para navegación sin caché disponible, intenta devolver '/'.
 *
 * @param {Request} request
 * @param {string}  cacheName
 * @returns {Promise<Response>}
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (_err) {
    if (request.mode === 'navigate') {
      const fallback = await caches.match('/');
      if (fallback) return fallback;
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// ── Network-First ─────────────────────────────────────────────────────────────
/**
 * Intenta red primero; en caso de fallo sirve desde caché.
 * Si no hay caché disponible para API, devuelve JSON 503 legible.
 *
 * @param {Request} request
 * @param {string}  cacheName
 * @returns {Promise<Response>}
 */
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (_err) {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Fallback legible para clientes que esperan JSON
    if (request.headers.get('accept')?.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Offline', message: 'No hay conexión a internet' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } },
      );
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// ── Mensajes desde la app principal ──────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

