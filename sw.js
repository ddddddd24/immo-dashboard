// Minimal service worker — required for PWA installability.
const CACHE_NAME = "immo-v2";
const ASSETS = [
  "/immo-dashboard/",
  "/immo-dashboard/index.html",
  "/immo-dashboard/contacts.html",
  "/immo-dashboard/manifest.json",
  "/immo-dashboard/icon-192.png",
  "/immo-dashboard/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  // Network-first with cache fallback. respondWith() is what tells Chrome
  // the SW actually controls the page — required for installability.
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        if (resp && resp.ok && resp.type === "basic") {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, copy));
        }
        return resp;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("/immo-dashboard/index.html")))
  );
});
