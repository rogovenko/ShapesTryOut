// Bump this string on every deploy so old caches are dropped and Unity files re-fetched.
const cacheName = "DefaultCompany-MazeMobile2-0.10";
const contentToCache = [
  "Build/Shapes.loader.js",
  "Build/Shapes.framework.js",
  "Build/Shapes.data",
  "Build/Shapes.wasm",
  "TemplateData/style.css",
];

self.addEventListener("install", function (e) {
  console.log("[Service Worker] Install", cacheName);
  e.waitUntil(
    (async function () {
      const cache = await caches.open(cacheName);
      await cache.addAll(contentToCache);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", function (e) {
  console.log("[Service Worker] Activate", cacheName);
  e.waitUntil(
    (async function () {
      const keys = await caches.keys();
      await Promise.all(
        keys.map(function (key) {
          if (key !== cacheName) return caches.delete(key);
        })
      );
      await self.clients.claim();
    })()
  );
});

function shouldAlwaysHitNetwork(urlPathname) {
  return (
    urlPathname.endsWith("/") ||
    urlPathname.endsWith("index.html") ||
    urlPathname.endsWith("ServiceWorker.js") ||
    urlPathname.endsWith(".webmanifest")
  );
}

function isGameAssetPath(urlPathname) {
  return (
    urlPathname.indexOf("/Build/") !== -1 ||
    urlPathname.endsWith("/TemplateData/style.css")
  );
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  var url = new URL(req.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (req.mode === "navigate" || req.destination === "document") {
    e.respondWith(fetch(req));
    return;
  }

  if (shouldAlwaysHitNetwork(url.pathname)) {
    e.respondWith(fetch(req));
    return;
  }

  if (!isGameAssetPath(url.pathname)) {
    e.respondWith(fetch(req));
    return;
  }

  e.respondWith(
    (async function () {
      var cached = await caches.match(req);
      if (cached) return cached;
      var response = await fetch(req);
      if (response.ok) {
        var cache = await caches.open(cacheName);
        cache.put(req, response.clone());
      }
      return response;
    })()
  );
});
