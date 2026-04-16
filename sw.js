// ═══════════════════════════════════════════════════════════════
//  Service Worker — Ad Display PWA
//  Mục đích: cho phép "Add to Home Screen", cache shell tĩnh.
//  Không cache YouTube stream (luôn lấy trực tiếp từ mạng).
// ═══════════════════════════════════════════════════════════════

const CACHE_NAME = 'ad-display-v1';

// Chỉ cache các file shell của ứng dụng
const SHELL_ASSETS = [
  './index.html',
  './config.js',
  './manifest.json',
];

// ── Install: pre-cache shell ────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: xoá cache cũ ─────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: Shell → cache-first, YouTube → network-only ─────────
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // YouTube API & stream: luôn lấy từ mạng
  if (url.includes('youtube.com') || url.includes('ytimg.com') || url.includes('googlevideo.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Shell assets: cache-first, fallback network
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
