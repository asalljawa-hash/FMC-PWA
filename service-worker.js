// ==========================================
// FMC BROILER MOBILE V6
// SERVICE WORKER
// ==========================================

const CACHE_NAME = "fmc-broiler-v6";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",

  "/css/index.css",

  "/js/index.js",
  "/js/api.js",
  "/js/app.js",
  "/js/dashboard.js",
  "/js/flok.js",
  "/js/harian.js",
  "/js/keuangan.js",
  "/js/ai.js"
];

// =========================
// INSTALL
// =========================
self.addEventListener("install", (event) => {

  self.skipWaiting();

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))

  );

});

// =========================
// ACTIVATE
// =========================
self.addEventListener("activate", (event) => {

  event.waitUntil(

    caches.keys().then((keys) => {

      return Promise.all(

        keys.map((key) => {

          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }

        })

      );

    })

  );

  self.clients.claim();

});

// =========================
// FETCH
// =========================
self.addEventListener("fetch", (event) => {

  if (event.request.method !== "GET") return;

  event.respondWith(

    caches.match(event.request)
      .then((cachedResponse) => {

        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {

            const responseClone = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {

                cache.put(event.request, responseClone);

              });

            return networkResponse;

          });

      })

  );

});