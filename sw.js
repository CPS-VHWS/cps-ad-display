// ═══════════════════════════════════════════════════════════════
//  Service Worker — Ad Display PWA
//  Mục đích: cho phép "Add to Home Screen", giữ bản dự phòng offline.
//  Không cache YouTube stream (luôn lấy trực tiếp từ mạng).
// ═══════════════════════════════════════════════════════════════

const CACHE_NAME = 'ad-display-v6';

// Cache theo ĐÚNG URL mà máy hiển thị truy cập: './' và './vertical/'.
// KHÔNG dùng './index.html' — Cloudflare Pages redirect 308 về './', nên
// entry đó vừa không bao giờ khớp request, vừa là response `redirected`
// mà trình duyệt từ chối phục vụ cho điều hướng trang.
const SHELL_ASSETS = [
  './',
  './manifest.json',
  './config-watcher.js',
  './vertical/',
  './vertical/manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  // config.js không pre-cache — lấy từ mạng, cache lại để dùng khi offline
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

// ── Fetch ───────────────────────────────────────────────────────
// Network-first cho mọi thứ, cache chỉ là lưới an toàn khi mất mạng.
// Cố ý KHÔNG cache-first: shell cache-first khiến máy đã cài chạy mãi code
// cũ — deploy xong phải reload 2 lần mới nhận bản mới (lần 1 vẫn do SW cũ
// phục vụ). Network-first thì máy luôn chạy code mới nhất khi có mạng.
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = req.url;

  // Chỉ can thiệp GET — POST /api/heartbeat để trình duyệt tự xử lý
  if (req.method !== 'GET') return;

  // YouTube API & stream, và mọi lời gọi API: luôn thẳng ra mạng
  if (url.includes('youtube.com') || url.includes('ytimg.com') ||
      url.includes('googlevideo.com') || url.includes('/api/')) {
    event.respondWith(fetch(req));
    return;
  }

  // config.js được poll kèm ?_t=... — cache dưới URL gốc để lần offline
  // sau vẫn tìm thấy, tránh cache rác một key cho mỗi timestamp.
  const cacheKey = url.includes('config.js') ? url.split('?')[0] : req;

  event.respondWith(
    fetch(req)
      .then(res => {
        // Không cache response redirect: trình duyệt từ chối phục vụ chúng
        // cho điều hướng trang, sẽ thành lỗi trắng màn hình khi offline.
        if (res && res.ok && !res.redirected) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(cacheKey, clone)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(cacheKey).then(cached => cached || Response.error()))
  );
});
