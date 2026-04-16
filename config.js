// ═══════════════════════════════════════════════════════════════
//  PLAYLIST CONFIG
//  Được quản lý qua Admin Dashboard
// ═══════════════════════════════════════════════════════════════

// ── Video NGANG (16:9) — Laptop / Tablet ngang / TV ───────────
const PLAYLIST_LANDSCAPE = [
  { id: 'dQw4w9WgXcQ', duration: 212, label: 'Quảng cáo ngang 1' },
  { id: 'ScMzIvxBSi4', duration: 180, label: 'Quảng cáo ngang 2' },
];

// ── Video DỌC (9:16) — Phone / Tablet dọc ─────────────────────
const PLAYLIST_PORTRAIT = [
  { id: '9bZkp7q19f0', duration: 253, label: 'Quảng cáo dọc 1' },
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
