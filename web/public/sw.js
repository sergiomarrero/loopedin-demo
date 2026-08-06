/* LoopedIn member app — service worker.
 *
 * Purpose: make https://www.weloopedin.com/member work with NO network, so the
 * demo runs from an iPad home-screen icon in airplane mode. The app already
 * carries all of its data (seed questions in the bundle + localStorage), so the
 * only thing standing between it and offline was that Safari still had to fetch
 * the HTML/JS/CSS. This caches that shell.
 *
 * The PRECACHE list below is GENERATED AT BUILD TIME by web/scripts/build-sw.mjs
 * — Vite content-hashes asset filenames, so a hand-written list would silently
 * rot on the next build and break offline without anyone noticing.
 *
 * Gotchas this deliberately handles:
 *  • The site sits behind an edge password gate. Caching the gate's HTML as the
 *    app shell would strand you at a password prompt forever in airplane mode,
 *    so gate responses are never cached (they carry x-loopedin-gate).
 *  • Never cache redirected / opaque / non-OK responses (a login redirect
 *    poisons the shell the same way).
 *  • skipWaiting + clients.claim + a versioned cache name, or an updated worker
 *    never actually lands on a device that already installed the old one.
 */

/* __SW_BUILD__ */
const VERSION = 'dev';
const PRECACHE = [];
/* __SW_BUILD_END__ */

const CACHE = `loopedin-member-${VERSION}`;
const SHELL_URL = '/member';

// Requests the worker must never touch or cache.
const isApi = (u) => u.pathname.startsWith('/api/');
const isGatePost = (u) => u.pathname === '/__access';

// Only cache a response that is a real, first-party, successful payload.
// `x-loopedin-gate` is set by middleware.ts on the password screen.
function isCacheable(res) {
  return (
    res &&
    res.ok &&
    res.type === 'basic' &&
    !res.redirected &&
    !res.headers.get('x-loopedin-gate') &&
    !(res.headers.get('cache-control') || '').includes('no-store')
  );
}

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      // allSettled, not addAll: one 404 must not abort the whole install.
      Promise.allSettled(
        PRECACHE.map((url) =>
          fetch(url, { credentials: 'same-origin', cache: 'reload' }).then((res) =>
            isCacheable(res) ? c.put(url, res) : null,
          ),
        ),
      ),
    ),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // third-party: leave alone
  if (isApi(url) || isGatePost(url)) return; // never intercept the API or the gate POST

  // ── Navigations: network first, fall back to the cached shell ────────────
  if (req.mode === 'navigate') {
    e.respondWith(
      (async () => {
        try {
          const net = await fetch(req);
          if (isCacheable(net)) (await caches.open(CACHE)).put(req, net.clone());
          return net;
        } catch {
          // Offline. Serve this exact page if we have it, else the member shell.
          const c = await caches.open(CACHE);
          return (
            (await c.match(req, { ignoreSearch: true })) ||
            (await c.match(SHELL_URL)) ||
            (await c.match('/member.html')) ||
            new Response('Offline — open this app once while connected.', {
              status: 503,
              headers: { 'content-type': 'text/plain' },
            })
          );
        }
      })(),
    );
    return;
  }

  // ── Everything else (JS/CSS/fonts/images/media): cache first ─────────────
  e.respondWith(
    (async () => {
      const c = await caches.open(CACHE);
      const hit = await c.match(req);
      const net = fetch(req)
        .then((res) => {
          if (isCacheable(res)) c.put(req, res.clone());
          return res;
        })
        .catch(() => hit);
      // Cached copy wins immediately; the network refreshes it in the
      // background so the next load gets the newer asset.
      return hit || net;
    })(),
  );
});
