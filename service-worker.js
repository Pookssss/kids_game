// ============================================================
// Kids Game Zone — Service Worker
// Strategy: Cache First for assets, Network First for HTML
// ============================================================

const CACHE_NAME = "kids-game-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/manifest.json",
  // Game pages
  "/games/jigsaw/index.html",
  "/games/memory/index.html",
  "/games/coloring/index.html",
  "/games/english/index.html",
  "/games/word-match/index.html",
  "/games/piano/index.html",
  // Game scripts & styles
  "/games/jigsaw/style.css",
  "/games/jigsaw/game.js",
  "/games/memory/style.css",
  "/games/memory/game.js",
  "/games/coloring/style.css",
  "/games/coloring/game.js",
  "/games/english/style.css",
  "/games/english/game.js",
  "/games/word-match/style.css",
  "/games/word-match/game.js",
  "/games/piano/style.css",
  "/games/piano/game.js",
  // Animal sounds (piano game)
  "/assets/sounds/cat.mp3",
  "/assets/sounds/dog.mp3",
  "/assets/sounds/elephant.mp3",
  "/assets/sounds/chicken.mp3",
  "/assets/sounds/duck.mp3",
  "/assets/sounds/frog.mp3",
  "/assets/sounds/monkey.mp3",
  "/assets/sounds/lion.mp3",
  // Icons
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",
];

// ── Install: cache all static assets ─────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// ── Activate: clear old caches ───────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // Take control of all open tabs
});

// ── Fetch: Cache First (offline-first) ───────────────────────
self.addEventListener("fetch", (event) => {
  // Skip non-GET and cross-origin requests (e.g. Google Fonts)
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve from cache, update in background (stale-while-revalidate)
        const networkFetch = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse; // Return cached immediately
      }

      // Not in cache — fetch from network and cache it
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || !networkResponse.ok) return networkResponse;
          const cloned = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cloned);
          });
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback: return main page
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
