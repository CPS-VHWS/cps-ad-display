// ═══════════════════════════════════════════════════════════════
//  PLAYLIST CONFIG — quản lý qua Admin Dashboard
//  https://CPS-VHWS.github.io/cps-ad-display/admin.html
// ═══════════════════════════════════════════════════════════════

const PLAYLIST_LANDSCAPE = [
  { id: 'RNvZxqc5m6o', duration: 41, label: 'SCamp 2026', campaign: 'scamp' },
  { id: 'aCJFpFS6OPE', duration: 31, label: 'LÃÂªn ÃÂÃ¡Â»Âi smartphone mÃ¡Â»Âi', campaign: 'trade' },
  { id: 'Javr2nYWOxI', duration: 37, label: 'Mua Laptop tÃ¡ÂºÂ·ng Bali', campaign: 'trade' },
  { id: 'uu_52j5NxG8', duration: 30, label: 'BÃ¡Â»Â phÃ¡Â»Â¥ kiÃ¡Â»Ân GenZ & QuÃÂ  Limited 2026', campaign: 'trade' },
  { id: '7doGCi1sBXY', label: 'DEMO MDM LAPTOP CAMP 2/9', campaign: 'trade' }
];

const PLAYLIST_PORTRAIT = [
  { id: 'YpV8qvzXvcU', duration: 41, label: 'SCamp 2026', campaign: 'scamp' },
  { id: 'WkF7cG9sYAo', label: 'DEMO MDM ĐIỆN THOẠI CAMP 2/9', campaign: 'trade' }
];

const APP_CONFIG = {
  syncIntervalMinutes: 8,
  dailyReloadHour: 8,
  dailyReloadMinute: 0,
  showStatusBar: true,
  errorSkipDelay: 2000,
  campaigns: ['scamp', 'trade', 'quockhanh'],
};
