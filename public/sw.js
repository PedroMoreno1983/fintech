// Service Worker de Fintech CFO - PWA offline-first.
// Ver docs/mobile-pwa.md para la estrategia completa.

const CACHE_VERSION = "fintech-cfo-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const PRECACHE_URLS = ["/", "/manifest.webmanifest", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

function isApiGet(request) {
  const url = new URL(request.url);
  return request.method === "GET" && url.pathname.startsWith("/api/");
}

function isApiWrite(request) {
  const url = new URL(request.url);
  return (
    request.method !== "GET" &&
    url.pathname.startsWith("/api/") &&
    !url.pathname.startsWith("/api/silvestre/chat")
  );
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".webmanifest")
  );
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match("/offline");
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached ?? fetchPromise;
}

async function queueWrite(request) {
  try {
    return await fetch(request.clone());
  } catch {
    const body = await request.clone().text();
    const action = {
      url: request.url,
      method: request.method,
      headers: Array.from(request.headers.entries()),
      body,
      queuedAt: Date.now(),
    };
    const channel = new BroadcastChannel("fintech-cfo-outbox");
    channel.postMessage({ type: "queued", action });
    channel.close();
    return new Response(
      JSON.stringify({ ok: true, queued: true, queuedAt: action.queuedAt }),
      { status: 202, headers: { "Content-Type": "application/json" } }
    );
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/silvestre/chat")) return;

  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (isApiGet(request)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (isApiWrite(request)) {
    event.respondWith(queueWrite(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }
});
