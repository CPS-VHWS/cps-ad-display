// ═══════════════════════════════════════════════════════════════
//  PLAYLIST CONFIG — quản lý qua Admin Dashboard
//  https://CPS-VHWS.github.io/cps-ad-display/admin.html
// ═══════════════════════════════════════════════════════════════

const PLAYLIST_LANDSCAPE = [
  { id: 'RNvZxqc5m6o', duration: 41, label: 'SCamp 2026', campaign: 'scamp' },
  { id: 'aCJFpFS6OPE', duration: 31, label: 'LÃªn Äá»i smartphone má»i', campaign: 'trade' },
  { id: 'Javr2nYWOxI', duration: 37, label: 'Mua Laptop táº·ng Bali', campaign: 'trade' },
  { id: 'uu_52j5NxG8', duration: 30, label: 'Bá» phá»¥ kiá»n GenZ & QuÃ  Limited 2026', campaign: 'trade' }
];

const PLAYLIST_PORTRAIT = [
  { id: 'YpV8qvzXvcU', duration: 41, label: 'SCamp 2026', campaign: 'scamp' },
  { id: '-9d37qCzhAs', duration: 31, label: 'LÃªn Äá»i Smartphone má»i', campaign: 'trade' },
  { id: 'Djl36n4AdLw', duration: 37, label: 'Mua laptop trÃºng Balo', campaign: 'trade' },
  { id: 'MFLGVWh3R4k', duration: 30, label: 'Bá» phá»¥ kiá»n GenZ vÃ  QuÃ  Limited', campaign: 'trade' }
];

const APP_CONFIG = {
  syncIntervalMinutes: 8,
  dailyReloadHour: 8,
  dailyReloadMinute: 0,
  showStatusBar: true,
  errorSkipDelay: 2000,
  campaigns: ['scamp', 'trade'],
};
