// Service worker: la app funciona entera sin conexión tras la primera visita.
// Lichess y Chess.com siempre van a la red (no se guardan en caché).
// Al publicar, vite.config.js rellena la versión y la lista de archivos y lo guarda como sw.js.
const CACHE = 'mis-aperturas-__BUILD__';
const FILES = ['./', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', ...__ASSETS__];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

// La versión nueva borra las anteriores: así no se acumulan archivos viejos en el móvil.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

// La página pregunta la versión para saber si está al día.
self.addEventListener('message', (event) => {
  if (event.data === 'version') event.ports[0]?.postMessage('__BUILD__');
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // La página: primero la red (para recibir actualizaciones); sin conexión, la copia guardada.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put('./', copy));
          return response;
        })
        .catch(() => caches.match('./', { ignoreVary: true })),
    );
    return;
  }

  // Scripts, estilos e iconos llevan un hash en el nombre: si están en caché, no cambian.
  // (ignoreVary: la petición de la página no siempre lleva las mismas cabeceras que la guardada.)
  event.respondWith(
    caches.match(request, { ignoreVary: true }).then(
      (hit) =>
        hit ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
