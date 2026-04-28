# Code Review Log — cps-ad-display
_Last reviewed: 2026-04-19_

---

## FIXED in this review

| # | File | Issue | Fix |
|---|------|-------|-----|
| 1 | `vertical/index.html` | YouTube branch missing `clearInterval(ytWatchdog)` and `v.skipEnd` watchdog — portrait could never skip end screens | Added full watchdog block to YouTube branch |
| 2 | `admin.html` | `parseInt(...) ?? 8` doesn't catch `NaN` (empty input → NaN → ?? passes NaN through) | Changed to `\|\| 8` |
| 3 | `admin.html` | Campaign names rendered unescaped into `<option>` HTML — XSS if name contains `<` or `"` | Wrapped all campaign name renders with `escHtml()` |
| 4 | `sw.js` | `config.js` never cached → network fail during hourly reload = JS crash + black screen | cache-on-fetch under canonical URL (strip query params); serve from cache on offline |
| 5 | `index.html` / `vertical/index.html` | `onPlayerReady` fires twice on some Android WebViews → double sync timers, double status ticker, double reload | Added `if (isReady) return` guard |
| 6 | `index.html` / `vertical/index.html` | GDrive video with no `duration` → `autoTimer` never set → machine stuck on that video until next hourly reload | Fallback `setTimeout(playNext, 1800 * 1000)` (30 min) if no duration |
| 7 | `index.html` / `vertical/index.html` | Filter URL with wrong params (e.g. typo `?r=hcmm`) → `PLAYLIST` empty → `startVideo()` returns immediately → permanent black screen | If filtered list is empty, fall back to full unfiltered playlist |
| 8 | `admin.html` | No unsaved-changes warning — closing tab or refreshing discards edits silently | Added `beforeunload` handler gated on `dirty` flag |
| 9 | `index.html` / `vertical/index.html` | Config changes only applied on hourly reload — machines could lag up to 1 hour behind | Added `startConfigWatcher()`: polls `config.js` every `syncIntervalMinutes`, sets `_configChanged` flag on diff, reloads at next video transition |
| 10 | `sw.js` | Poll requests (`config.js?_t=...`) would pollute cache with per-timestamp keys | SW strips query params before caching, always stores/serves under canonical URL |
| 11 | `index.html` / `vertical/index.html` | Config fingerprint used `t.length + '\|' + t.slice(-60)` — misses changes that don't alter file length or tail (e.g. edit in middle of file) | Compare full file text (`t !== fingerprint`) — config.js is ~5KB, no cost |
| 12 | `sw.js` | `caches.open(...).then(c => c.put(...))` fire-and-forget — throws unhandled Promise rejection on devices with low storage quota | Added `.catch(() => {})` |
| 13 | `index.html` / `vertical/index.html` | `startConfigWatcher()` duplicated verbatim — only `configUrl` differed, risk of fixes drifting between files | Extracted to shared `config-watcher.js`; both pages load it via `<script src>`; SW shell assets updated; cache bumped to `v3` |
| 14 | `admin.html` | PIN `0526` lưu plaintext — ai View Source / F12 cũng đọc được | Thay bằng `ADMIN_PIN_HASH` (SHA-256), so sánh qua `crypto.subtle.digest` |
| 15 | `admin.html` | Session bypass: `sessionStorage.setItem('cps_auth','1')` trong DevTools là vào thẳng admin | Session token = `SHA-256(PIN_HASH + random salt)` lưu salt+token, verify bằng cách re-derive — không thể forge nếu không biết PIN_HASH |
| 16 | `admin.html` | **CRITICAL XSS** trong `renderCampaignChips()`: tên campaign nhúng raw vào innerHTML và `onclick="removeCampaign('${c}')"` — campaign từ `cfg.campaigns` (config.js) hoặc input người dùng có thể chứa JS, đánh cắp GitHub token từ localStorage | (1) `escHtml(c)` cho text + `data-campaign` attribute với delegated handler thay cho inline onclick. (2) `addCampaign` whitelist `[a-z0-9-]` chặn ký tự nguy hiểm tại nguồn |
| 17 | `admin.html` | Auto-redirect sau 2 phút idle gọi `window.location.href` không check `dirty` → mất thay đổi đang sửa | `startCountdown()` bail nếu `dirty=true`, gọi `reset()` để chờ tiếp |
| 18 | `admin.html` | `buildConfigJs.row()` chỉ escape `label`, không escape `id`/`type`/`regions`/`campaign`. Một dấu `'` trong `id` (đặc biệt URL hình ảnh nhập tự do) phá vỡ config.js → tất cả 2000 máy crash khi parse | Helper `esc()` chung, áp dụng cho mọi string field bao gồm `campaigns` array trong APP_CONFIG |
| 19 | `admin.html` | GitHub PAT lưu ở `localStorage` — bất kỳ XSS nào leak token → ghi đè playlist toàn hệ thống | Token chuyển sang `sessionStorage` (xoá khi đóng tab/browser); owner/repo giữ ở localStorage. Migration tự động chuyển token cũ. Help text dưới input nhắc admin |
| 20 | `index.html` / `vertical/index.html` | `setTimeout(reload, msToNextHour)` có thể trôi nhiều giờ nếu WebView Android/iOS ngủ → máy không reload, không nhận được thay đổi config | Thay bằng `setInterval(check wallclock, 30s)` — luôn reload đúng theo giờ thực, không phụ thuộc timer chạy liên tục |
| 21 | `_headers` | Thiếu các header bảo mật cơ bản — exposed cho clickjacking và MIME confusion | Thêm `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: same-origin`, `Permissions-Policy` lock camera/mic/geo/payment |

---

## NOT BUGS (False Alarms)

| Claim | Verdict |
|-------|---------|
| Hourly reload formula wrong | **False.** `(3600 - min*60 - sec) * 1000 - ms` is correct math |
| SW scope `../` broken | **False.** `_headers` sets `Service-Worker-Allowed: /` which permits this |
| `_headers` missing closing `*/` | **False.** Cloudflare `_headers` format — `/*` is a path glob, not a CSS comment |
| Mute state resets on reload | **By design.** Hourly reload → auto-mute is intentional |
| GDrive without duration blocks save | **Already handled.** `saveToGitHub()` checks all GDrive items and blocks with toast error |
| 2000 machines thundering herd on Cloudflare | **Not a risk.** Cloudflare CDN handles millions of req/s; 2000 req/hour is negligible |
| YouTube IFrame API rate limiting at scale | **Not a risk.** YouTube does not rate-limit IFrame API loading |

---

## DEFERRED (Known, Low Priority)

| # | File | Issue | Notes |
|---|------|-------|-------|
| D1 | `admin.html` | `parsePlaylist()` uses `new Function()` to eval config.js | Low risk — data comes from GitHub repo, admin is PIN-protected. Replace with JSON-based config in future |
| D2 | `admin.html` | Tab (Landscape/Portrait) not persisted on refresh | Minor UX. Fix: `sessionStorage.setItem('tab', activeTab)` on switch |
| D4 | `admin.html` | Video IDs in `buildConfigJs()` not sanitized for single quotes | Rare edge case. Fix: `v.id.replace(/'/g, "\\'")` |
| D5 | `vertical/index.html` | `setupIdleFullscreen()` uses local `idleTimer` — inconsistent with landscape's `_idleTimer` | Cosmetic, works correctly as-is |
| D6 | `index.html` / `vertical/index.html` | Hourly reload fires at every `:00:00` — `dailyReloadHour` in APP_CONFIG is saved but not read by display pages | By design for now (more frequent = faster config pickup). Could wire up if needed |
| D7 | `index.html` / `vertical/index.html` | At 10,000+ machines, all reloading at `:00:00` simultaneously could spike origin | Add `Math.random() * 60 * 1000` jitter to `scheduleHourlyReload`. Not needed at 2000 machines |
| D8 | `index.html` / `vertical/index.html` | No YouTube playback quality cap — 4K monitors could pull 4K streams unnecessarily | `setPlaybackQuality()` is deprecated (2021), YouTube ignores it. In practice: kiosk screens are 1080p so YouTube auto-serves 1080p. Monitor only if bandwidth complaints arise at specific sites |

---

## Scale Assessment — 2000 machines

| Layer | Load | Risk |
|-------|------|------|
| Cloudflare Pages (HTML/JS) | 2000 req/hour × ~15KB = 30MB/hour | None — free tier, unlimited BW |
| config.js | 2000 req/hour × ~5KB = 10MB/hour | None — CDN cached, network-first |
| YouTube stream | Direct YouTube CDN per device | None — not through our infra |
| YouTube IFrame API load | 2000 req/hour | None — no rate limit on API load |
| GitHub API (admin only) | ~5 req per save session | None — limit is 5000/hour |
| SW cache | Independent per device | None |

---

## Architecture Notes

- **Config flow:** Admin → GitHub `config.js` → Cloudflare CDN → display pages via `<script src="config.js">` (network-first, cached by SW for offline fallback). Display pages also poll `config.js` every `syncIntervalMinutes` and auto-reload at next video transition when a change is detected.
- **Offline resilience:** config.js cached by SW on first successful fetch. Hourly reload with no network → serves cached config → old playlist continues playing. Staff can power-cycle safely.
- **Changelog encoding:** Write uses `btoa(unescape(encodeURIComponent(...)))`. Read uses `decodeURIComponent(escape(atob(...)))`. Both required for correct UTF-8 round-trip.
- **Region/Campaign filter:** `regions: undefined` = all regions; `regions: []` = nowhere; `campaign: undefined` = always-on. Display filter applied at page load from URL params `?r=` and `?c=`. Empty result falls back to full playlist.
- **`skipEnd` flag:** Only YouTube videos; opt-in. Watchdog polls every 500ms, skips at `min(20s, max(2s, dur*15%))` before end.
- **Safe area (iOS):** `vertical/index.html` extends `#player-wrap` with `bottom: -60px` hardcoded (env() returns 0 in Safari standalone/PWA mode).
- **SW scope:** `vertical/` registers `../sw.js` with `scope: '../'`. Requires `Service-Worker-Allowed: /` header → set in `_headers` for Cloudflare Pages.
- **onPlayerReady guard:** YouTube IFrame API documented to sometimes fire `onReady` twice on Android WebView. Guard with `if (isReady) return` prevents double timer accumulation.

---

## File Map

| File | Role |
|------|------|
| `index.html` | Landscape display (16:9) |
| `vertical/index.html` | Portrait display (9:16) |
| `admin.html` | Admin dashboard (PIN: see ADMIN_PIN in file) |
| `config.js` | Playlist data — edited by admin, network-first with SW offline fallback |
| `config-watcher.js` | Shared script — `startConfigWatcher(configUrl)` polled by both display pages |
| `sw.js` | Service worker — caches shell + config.js fallback, bypasses YouTube |
| `_headers` | Cloudflare Pages — sets `Service-Worker-Allowed: /` |
| `manifest.json` | PWA manifest (landscape) |
| `vertical/manifest.json` | PWA manifest (portrait) |
| `REVIEW.md` | This file — developer notes, bug log, architecture decisions |
| `setup.md` | User guide (Vietnamese) — operation, deployment, troubleshooting |
