const CACHE = "mulaibaca-v1";
const ASSET_CACHE = "mulaibaca-assets-v1";

// Assets to precache (auto-generated at build)
const PRECACHE = [];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(ASSET_CACHE).then((cache) => cache.addAll(PRECACHE))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE && k !== ASSET_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for navigations (fresh HTML, cache as fallback)
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Same-origin only
  if (url.origin !== self.location.origin) return;

  // Skip non-GET
  if (request.method !== "GET") return;

  // Skip API and Next.js internal data routes only
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/data/") ||
    url.pathname.startsWith("/__nextjs_")
  ) {
    return;
  }

  // Cache-first for static assets (JS, CSS, fonts, images)
  if (
    url.pathname.match(/\.(js|css|woff2?|png|jpg|jpeg|gif|svg|webp|ico)$/) ||
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network-first for HTML pages (including root /)
  if (request.mode === "navigate" || url.pathname === "/" || url.pathname === "") {
    event.respondWith(networkFirst(request));
  }
});

async function networkFirst(request) {
  const cacheKey = stripQuery(request.url);
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      const cache = await caches.open(CACHE);
      cache.put(cacheKey, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(cacheKey);
    return cached || new Response("Anda sedang offline", { status: 503, headers: { "Content-Type": "text/plain;charset=UTF-8" } });
  }
}

async function cacheFirst(request) {
  const cacheKey = stripQuery(request.url);
  const cached = await caches.match(cacheKey);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      const cache = await caches.open(ASSET_CACHE);
      cache.put(cacheKey, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 404 });
  }
}

function stripQuery(url) {
  const u = new URL(url);
  u.search = "";
  return u.toString();
}
