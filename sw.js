const CACHE = "tlatelolco-rapido-v2";
const FILES = ["./index.html", "./sw.js", "./manifest.webmanifest", "./"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function cleanUrl(request) {
  const u = new URL(request.url);
  u.search = "";
  u.hash = "";
  if (u.pathname.endsWith("/Tlatelolco-68") || u.pathname.endsWith("/Tlatelolco-68/")) {
    u.pathname = u.pathname.replace(/\/?$/, "/index.html");
  }
  return u.toString();
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const raw = event.request.url;
  if (raw.includes("fonts.googleapis.com") || raw.includes("fonts.gstatic.com") || raw.includes("wikimedia.org")) {
    event.respondWith(new Response("", { status: 200, headers: { "Content-Type": "text/css" } }));
    return;
  }
  if (!raw.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(cleanUrl(event.request)).then((hit) => {
      if (hit) return hit;
      return caches.match("./index.html").then((home) => {
        if (home) return home;
        return fetch(event.request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(cleanUrl(event.request), copy));
          }
          return res;
        });
      });
    })
  );
});
