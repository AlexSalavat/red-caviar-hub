/* Red Caviar Hub — Service Worker (offline + SPA fallback)
 * Стратегии:
 * - Core pre-cache (index, manifest, иконки)
 * - Навигации: network-first → cache(index.html) → offline.html
 * - /assets/ (vite-ассеты): cache-first
 * - /gallery/, /logos/, SVG/PNG/JPG/WebP: stale-while-revalidate
 */

const CACHE_VERSION = "rch-v1.0.1";
const CORE_CACHE = `core-${CACHE_VERSION}`;
const RUNTIME_CACHE = `rt-${CACHE_VERSION}`;

const CORE_URLS = [
  "/",                 // SPA
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/logo-mark.svg",
  "/offline.html",
];

// Хелперы
const isAsset = (url) => url.pathname.startsWith("/assets/");
const isImage = (url) =>
  url.pathname.startsWith("/gallery/") ||
  url.pathname.startsWith("/logos/") ||
  /\.(png|jpg|jpeg|webp|svg|ico)$/i.test(url.pathname);

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CORE_CACHE).then((cache) => cache.addAll(CORE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    // убираем старые кэши
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((n) => ![CORE_CACHE, RUNTIME_CACHE].includes(n))
        .map((n) => caches.delete(n))
    );
    // навигационный preload (ускоряет навигации)
    if ("navigationPreload" in self.registration) {
      try { await self.registration.navigationPreload.enable(); } catch {}
    }
    await self.clients.claim();
  })());
});

// Сетевой таймаут (для навигаций)
const networkWithTimeout = (req, ms = 4000) =>
  new Promise(async (resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    try {
      const res = await fetch(req);
      clearTimeout(timer);
      resolve(res);
    } catch (e) {
      clearTimeout(timer);
      reject(e);
    }
  });

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Только GET обрабатываем
  if (request.method !== "GET") return;

  // 1) Навигации (SPA)
  if (request.mode === "navigate") {
    e.respondWith((async () => {
      // Попробуем навигационный preload (если есть)
      try {
        const pre = await e.preloadResponse;
        if (pre) return pre;
      } catch {}
      // Сеть с таймаутом → cache(index.html) → offline.html
      try {
        const net = await networkWithTimeout(request, 4500);
        // Параллельно обновим кэш index.html для оффлайна
        eventWait(caches.open(CORE_CACHE).then((c) => c.put("/index.html", net.clone())));
        return net;
      } catch {
        const cache = await caches.open(CORE_CACHE);
        const cachedIndex = await cache.match("/index.html");
        if (cachedIndex) return cachedIndex;
        const offline = await cache.match("/offline.html");
        return offline || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
      }
    })());
    return;
  }

  // 2) Vite ассеты: cache-first
  if (isAsset(url)) {
    e.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const net = await fetch(request);
        if (net && net.ok) eventWait(cache.put(request, net.clone()));
        return net;
      } catch {
        return cached || new Response("", { status: 504 });
      }
    })());
    return;
  }

  // 3) Изображения: stale-while-revalidate
  if (isImage(url)) {
    e.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      const fetchAndUpdate = fetch(request).then((res) => {
        if (res && res.ok) cache.put(request, res.clone());
        return res;
      }).catch(() => null);
      return cached || (await fetchAndUpdate) || new Response("", { status: 504 });
    })());
    return;
  }

  // 4) Остальное — сеть с подстраховкой через кэш
  e.respondWith((async () => {
    try {
      const res = await fetch(request);
      return res;
    } catch {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      return cached || new Response("", { status: 504 });
    }
  })());
});

// Позволяет клиентам моментально активировать новый SW
self.addEventListener("message", (e) => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});

// Утилита: безопасно добавляем промисы в жизненный цикл события (не падать, если event недоступен)
function eventWait(promise) {
  try { self.registration && promise && typeof promise.then === "function" && promise.catch(()=>{}); } catch {}
}
