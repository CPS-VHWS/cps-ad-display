# Code Review Log — cps-ad-display
_Last reviewed: 2026-04-17_

---

## FIXED in this review

| # | File | Issue | Fix |
|---|------|-------|-----|
| 1 | `vertical/index.html` | YouTube branch missing `clearInterval(ytWatchdog)` and `v.skipEnd` watchdog — portrait could never skip end screens | Added full watchdog block to YouTube branch |
| 2 | `admin.html` | `parseInt(...) ?? 8` doesn't catch `NaN` (empty input → NaN → ??  passes NaN through) | Changed to `\|\| 8` |
| 3 | `admin.html` | Campaign names rendered unescaped into `<option>` HTML — XSS if name contains `<` or `"` | Wrapped all campaign name renders with `escHtml()` |

---

## NOT BUGS (False Alarms)

| Claim | Verdict |
|-------|---------|
| Hourly reload formula wrong | **False.** `(3600 - min*60 - sec) * 1000 - ms` is correct math |
| SW scope `../` broken | **False.** `_headers` sets `Service-Worker-Allowed: /` which permits this |
| `_headers` missing closing `*/` | **False.** Cloudflare `_headers` format — `/*` is a path glob, not a CSS comment |
| Mute state resets on reload | **By design.** Hourly reload → auto-mute is intentional |

---

## DEFERRED (Known, Low Priority)

| # | File | Issue | Notes |
|---|------|-------|-------|
| D1 | `admin.html` | `parsePlaylist()` uses `new Function()` to eval config.js | Low risk — data comes from GitHub repo, admin is PIN-protected. Replace with JSON-based config in future |
| D2 | `admin.html` | Tab (Landscape/Portrait) not persisted on refresh | Minor UX. Fix: `sessionStorage.setItem('tab', activeTab)` on switch |
| D3 | `index.html` / `vertical/index.html` | `onPlayerReady` timer accumulation if YT API fires twice | Doesn't happen in practice. Guard with `if (isReady) return` |
| D4 | `admin.html` | Video IDs in `buildConfigJs()` not sanitized for single quotes | Rare edge case. Fix: `v.id.replace(/'/g, "\\'")` |
| D5 | `vertical/index.html` | `setupIdleFullscreen()` uses local `idleTimer` — inconsistent with landscape's `_idleTimer` | Cosmetic, works correctly as-is |

---

## Architecture Notes

- **Config flow:** Admin → GitHub `config.js` → Cloudflare CDN → display pages via `<script src="config.js">` (always network-first, never cached)
- **Changelog encoding:** Write uses `btoa(unescape(encodeURIComponent(...)))`. Read uses `decodeURIComponent(escape(atob(...)))`. Both required for correct UTF-8 round-trip.
- **Region/Campaign filter:** `regions: undefined` = all regions; `regions: []` = nowhere; `campaign: undefined` = always-on. Display filter applied at page load from URL params `?r=` and `?c=`.
- **`skipEnd` flag:** Only YouTube videos; opt-in. Watchdog polls every 500ms, skips at `min(20s, max(2s, dur*15%))` before end.
- **Safe area (iOS):** `vertical/index.html` extends `#player-wrap` with `bottom: -60px` hardcoded (env() returns 0 in Safari standalone/PWA mode).
- **SW scope:** `vertical/` registers `../sw.js` with `scope: '../'`. Requires `Service-Worker-Allowed: /` header → set in `_headers` for Cloudflare Pages.

---

## File Map

| File | Role |
|------|------|
| `index.html` | Landscape display (16:9) |
| `vertical/index.html` | Portrait display (9:16) |
| `admin.html` | Admin dashboard (PIN: see ADMIN_PIN in file) |
| `config.js` | Playlist data — edited by admin, never cached |
| `sw.js` | Service worker — caches shell, bypasses config.js and YouTube |
| `_headers` | Cloudflare Pages — sets `Service-Worker-Allowed: /` |
| `manifest.json` | PWA manifest (landscape) |
| `vertical/manifest.json` | PWA manifest (portrait) |
