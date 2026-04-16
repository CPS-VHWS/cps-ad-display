// ═══════════════════════════════════════════════════════════════
//  PLAYLIST CONFIG
//  Được quản lý qua Admin Dashboard
//  https://CPS-VHWS.github.io/cps-ad-display/admin.html
// ═══════════════════════════════════════════════════════════════

// ── Video NGANG (16:9) — Laptop / Tablet ngang / TV ───────────
const PLAYLIST_LANDSCAPE = [
  { id: 'qUfVSh4eaDE', label: 'MacBook Neo' },
  { id: 'bg3iEHHTGtQ', label: 'MacBook Neo' }
];

// ── Video DỌC (9:16) — Phone / Tablet dọc ─────────────────────
const PLAYLIST_PORTRAIT = [
  { id: 'dAqo0pib06M', label: 'MacBook Neo' },
  { id: 'SDzKgqU35Eo', label: 'MacBook Neo' }
];

// ═══════════════════════════════════════════════════════════════
//  APP CONFIG — chung cho cả 2 chế độ
// ═══════════════════════════════════════════════════════════════
const APP_CONFIG = {
  syncIntervalMinutes: 5,
  dailyReloadHour: 8,
  dailyReloadMinute: 0,
  showStatusBar: true,
  errorSkipDelay: 2000,
};
