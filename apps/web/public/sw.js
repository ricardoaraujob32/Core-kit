/* apps/web/public/sw.js */

const APP_VERSION = "activation-fix-v1";
const APP_SHELL_CACHE = `corekit-app-shell-${APP_VERSION}`;
const STATIC_CACHE = `corekit-static-${APP_VERSION}`;

const APP_SHELL = [
  "/",
  "/app",
  "/offline.html",
  "/manifest.webmanifest"
];

const STATIC_ASSET_EXTENSIONS = [
  ".js",
  ".css",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".webp",
  ".ico",
  ".woff",
  ".woff2"
];

function isStaticAsset(request) {
  const url = new URL(request.url);

  return STATIC_ASSET_EXTENSIONS.some((extension) =>
    url.pathname.endsWith(extension)
  );
}

async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached) return cached;

  const response = await fetch(request);

  if (response && response.status === 200 && response.type !== "opaque") {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
  }

  return response;
}

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);

    if (response && response.status === 200) {
      const cache = await caches.open(APP_SHELL_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cached = await caches.match(request);

    if (cached) return cached;

    return (
      (await caches.match("/offline.html")) ||
      new Response("Offline", {
        status: 503,
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      })
    );
  }
}

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith("corekit-") &&
                key !== APP_SHELL_CACHE &&
                key !== STATIC_CACHE
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data?.type === "CLEAR_PWA_CACHES") {
    event.waitUntil(
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key.startsWith("corekit-"))
              .map((key) => caches.delete(key))
          )
        )
    );
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
  }
});
