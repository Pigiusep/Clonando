// Service worker mínimo: guarda en caché solo archivos estáticos (estilos, scripts, íconos)
// para que la app abra rápido. Los datos del inventario SIEMPRE se piden al servidor,
// nunca se muestran desde caché, para no ver un stock desactualizado.
const CACHE = 'inventario-estaticos-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const nombre of await caches.keys()) if (nombre !== CACHE) await caches.delete(nombre);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/static/')) {
    // Usa la copia en caché y la actualiza en segundo plano.
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const guardada = await cache.match(event.request);
      const red = fetch(event.request).then((r) => {
        if (r.ok) cache.put(event.request, r.clone());
        return r;
      }).catch(() => guardada);
      return guardada || red;
    })());
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => new Response(
      '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width">'
      + '<title>Sin conexión</title><body style="font-family:system-ui;padding:24px">'
      + '<h1>Sin conexión</h1><p>No hay conexión con el servidor del inventario. '
      + 'Revisa el wifi o los datos móviles e inténtalo de nuevo.</p>'
      + '<p><button onclick="location.reload()">Reintentar</button></p>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )));
  }
});
