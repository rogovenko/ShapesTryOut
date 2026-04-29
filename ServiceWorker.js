const cacheName = "DefaultCompany-MazeMobile2-0.1.0";
const contentToCache = [
    "Build/Shapes.loader.js",
    "Build/Shapes.framework.js",
    "Build/Shapes.data",
    "Build/Shapes.wasm",
    "TemplateData/style.css"

];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    
    e.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
    })());
});

self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
      let response = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (response) { return response; }

      response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      try {
        var _swUrl = new URL(e.request.url);
        if (_swUrl.protocol === 'http:' || _swUrl.protocol === 'https:') {
          console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
          await cache.put(e.request, response.clone());
        }
      } catch (_swCacheFix) { /* unsupported scheme e.g. chrome-extension, blob */ }
      return response;
    })());
});
