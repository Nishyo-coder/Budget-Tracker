const expectedCaches = ['static-v2'];
const DATA_CACHE_NAME = "data-cache-v1";

const FILES_TO_CACHE = [
    "/",
    "./index.html",
    "./db.js",
    "./index.js",
    "./styles.css",
    "./icons/icon-192x192.png",
    "./icons/icon-512x512.png"
  ];
  
  self.addEventListener('install', event => {
    console.log();
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        console.log('V2 installing…');
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  });
  
  self.addEventListener('activate', event => {
    // delete any caches that aren't in expectedCaches
    // which will get rid of static-v1
    event.waitUntil(
      caches.keys().then(keys => Promise.all(
        keys.map(key => {
          if (!expectedCaches.includes(key)) {
            return caches.delete(key);
          }
        })
      )).then(() => {
        console.log('V2 now ready to handle fetches!');
      })
    );
  });
  
  
  self.addEventListener('fetch', event => {
    if (event.request.url.includes('/api/')) {
      console.log('[Service Worker] Fetch(data)', event.request.url);
    
      event.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(event.request)
            .then(response => {
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
              return response;
            })
            .catch(err => {
              return cache.match(event.request);
            });
        })
      );
      return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
          return cache.match(event.request).then(response => {
            return response || fetch(event.request);
          });
        })
      );
    });