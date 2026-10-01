const CACHE = "tlatelolco-68-v3";
const FILES = [
  "./",
  "./index.html",
  "./ahora.html",
  "./manifest.webmanifest",
  "./README.md",
  "./img/00.jpg",
  "./img/01.jpg",
  "./img/02.jpg",
  "./img/03.jpg",
  "./img/04.jpg",
  "./img/05.jpg",
  "./img/06.jpg",
  "./img/08.jpg",
  "./img/09.jpg",
  "./img/10.jpg",
  "./img/11.jpg",
  "./img/12.jpg",
  "./img/13.jpg",
  "./img/14.jpg",
  "./img/15.jpg",
  "./img/16.jpg",
  "./img/17.jpg",
  "./img/18.jpg",
  "./img/19.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        const copy = res.clone();
        if (res.ok && event.request.url.startsWith(self.location.origin)) {
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return res;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
