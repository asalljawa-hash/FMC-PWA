// ======================================
// FMC BROILER MOBILE V5
// Service Worker
// ======================================

const CACHE_NAME = "fmc-broiler-v1";

const FILES_TO_CACHE = [

  "./",
  "./index.html",
  "./manifest.json",

  "./css/index.css",

  "./js/api.js",
  "./js/app.js",
  "./js/dashboard.js",
  "./js/flok.js",
  "./js/harian.js",
  "./js/keuangan.js"

];

// Install
self.addEventListener("install", (event) => {

  event.waitUntil(

    caches.open(CACHE_NAME).then((cache) => {

      return cache.addAll(FILES_TO_CACHE);

    })

  );

});

// Fetch
self.addEventListener("fetch", (event) => {

  event.respondWith(

    caches.match(event.request).then((response) => {

      return response || fetch(event.request);

    })

  );

});

// Activate
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

});