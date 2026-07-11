// ==========================================
// FMC BOILER MOBILE V9
// service-worker.js
// ==========================================

const CACHE_NAME = "fmc-boiler-mobile-v12";


const FILES_TO_CACHE = [

  "./",
  "./index.html",
  "./manifest.json",

  "./css/theme.css",
  "./css/header.css",
  "./css/card.css",
  "./css/navigation.css",
  "./css/weather.css",
  "./css/index.css",

  "./js/api.js",
  "./js/dashboard.js",
  "./js/flok.js",
  "./js/harian.js",
  "./js/keuangan.js",
  "./js/ai.js",
  "./js/weather.js",
  "./js/app.js",

  "./icons/logo.png",
  "./icons/splash.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"

];


// INSTALL
self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
    .then(cache => {

      return cache.addAll(FILES_TO_CACHE);

    })

  );

  self.skipWaiting();

});


// ACTIVATE
self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
    .then(keys => {

      return Promise.all(

        keys.map(key => {

          if(key !== CACHE_NAME){

            return caches.delete(key);

          }

        })

      );

    })

  );

  self.clients.claim();

});


// FETCH
self.addEventListener("fetch", event => {


  // Jangan cache request API/data
  if(event.request.url.includes("script.google.com")){

    return;

  }


  event.respondWith(

    caches.match(event.request)

    .then(cached => {


      if(cached){

        return cached;

      }


      return fetch(event.request)

      .then(response => {


        if(!response || response.status !== 200){

          return response;

        }


        let clone = response.clone();


        caches.open(CACHE_NAME)

        .then(cache => {

          cache.put(event.request, clone);

        });


        return response;


      });


    })

  );


});