// ═══════════════════════════════════════════════════════════════
//  PLAYLIST CONFIG — quản lý qua Admin Dashboard
//  https://CPS-VHWS.github.io/cps-ad-display/admin.html
// ═══════════════════════════════════════════════════════════════

const PLAYLIST_LANDSCAPE = [
  { id: '-ueUb6PNwbs', duration: 96, label: 'Design is how it works', campaign: 'test2' },
  { id: 'qUfVSh4eaDE', duration: 107, label: 'Apple Education' },
  { id: 'bg3iEHHTGtQ', duration: 36, label: 'MacBook Neo' }
];

const PLAYLIST_PORTRAIT = [
  { id: 'cwZsHxLLlZ0', duration: 15, label: 'Mac Mini' },
  { id: '_2IV2fu1aAA', duration: 24, label: 'MacBook Neo' }
];

const APP_CONFIG = {
  syncIntervalMinutes: 5,
  dailyReloadHour: 8,
  dailyReloadMinute: 0,
  showStatusBar: true,
  errorSkipDelay: 2000,
  campaigns: ['test1', 'test2'],
};
