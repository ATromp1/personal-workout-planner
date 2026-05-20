/**
 * Service worker — offline support for the app shell.
 *
 * Strategy:
 *   - Precache the app shell on install.
 *   - For same-origin GETs: stale-while-revalidate. Serve cached copy
 *     immediately if available, fetch in the background to update.
 *   - For cross-origin (Open Food Facts, ZXing CDN): pass-through. OFF data
 *     should always be fresh; ZXing already comes with its own caching.
 *
 * Bump CACHE_VERSION whenever the shell list changes so old caches are
 * dropped on activate.
 */
const CACHE_VERSION = "le-v1";
const SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icon.svg",
  "./core/state.js",
  "./core/foodApi.js",
  "./data/config.js",
  "./data/program.js",
  "./data/meals.js",
  "./pages/workout.js",
  "./pages/meals.js",
  "./pages/intake.js",
  "./pages/stats.js",
  "./components/modal.js",
  "./components/scanner.js"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === "basic") {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});
