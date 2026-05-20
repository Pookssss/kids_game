const CACHE_NAME = "kids-game-next-v1";
const CORE_ROUTES = [
  "/",
  "/games/jigsaw",
  "/games/memory",
  "/games/coloring",
  "/games/english",
  "/games/word-match",
  "/games/piano",
  "/manifest.json"
];

const STATIC_ASSETS = [
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",
  "/assets/sounds/cat.mp3",
  "/assets/sounds/dog.mp3",
  "/assets/sounds/elephant.mp3",
  "/assets/sounds/chicken.mp3",
  "/assets/sounds/duck.mp3",
  "/assets/sounds/frog.mp3",
  "/assets/sounds/monkey.mp3",
  "/assets/sounds/lion.mp3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([...CORE_ROUTES, ...STATIC_ASSETS]))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = event.request.mode === "navigate";
  const isStaticAsset =
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image");

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return networkResponse;
        })
        .catch(async () => {
          const cachedPage = await caches.match(event.request);
          return cachedPage || caches.match("/");
        })
    );
    return;
  }

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
