/* Foodyz service worker. Hand-written, classic script (no imports). */
const VERSION = "v1";
const SHELL = `foodyz-shell-${VERSION}`;
const STATIC = `foodyz-static-${VERSION}`;
const PAGES = `foodyz-pages-${VERSION}`;
const CURRENT = [SHELL, STATIC, PAGES];
const MAX_PAGES = 30;
const PRECACHE = ["/offline.html", "/icon.svg", "/pwa-icon/192", "/pwa-icon/512"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith("foodyz-") && !CURRENT.includes(k)).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CLEAR_CACHES") {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("foodyz-")).map((k) => caches.delete(k)))),
    );
  }
});

function isCacheablePage(pathname) {
  if (pathname === "/recipes" || pathname === "/flan") return true;
  if (!pathname.startsWith("/recipes/")) return false;
  return pathname !== "/recipes/new" && !pathname.endsWith("/edit");
}

async function trimPages() {
  const cache = await caches.open(PAGES);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - MAX_PAGES; i++) await cache.delete(keys[i]);
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && !response.redirected) {
    const cache = await caches.open(STATIC);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstPage(request, url) {
  try {
    const response = await fetch(request);
    if (response.ok && !response.redirected && isCacheablePage(url.pathname)) {
      const cache = await caches.open(PAGES);
      await cache.put(request, response.clone());
      await trimPages();
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match("/offline.html");
    return offline || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/login")) return;
  if (request.headers.has("RSC")) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/pwa-icon/") || url.pathname === "/icon.svg") {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request, url));
  }
});
