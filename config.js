// ═══════════════════════════════════════════════════════════════
//  PLAYLIST CONFIG — quản lý qua Admin Dashboard
//  https://CPS-VHWS.github.io/cps-ad-display/admin.html
// ═══════════════════════════════════════════════════════════════

const PLAYLIST_LANDSCAPE = [
  { id: 'RNvZxqc5m6o', duration: 41, label: 'SCamp 2026', campaign: 'scamp' },
  { id: 'aCJFpFS6OPE', duration: 31, label: 'Lên đời smartphone mới', campaign: 'trade' },
  { id: 'Javr2nYWOxI', duration: 37, label: 'Mua Laptop tặng balo', campaign: 'trade', aspect: '16:9' },
  { id: 'uu_52j5NxG8', duration: 30, label: 'Bộ phụ kiện GenZ & Quà Limited 2026', campaign: 'trade', aspect: '16:9' },
  { id: 'YChx41iM5Bw', duration: 15, label: 'Video Camp 2/9', campaign: 'trade', aspect: '9:16' }
];

const PLAYLIST_PORTRAIT = [
  { id: 'YpV8qvzXvcU', duration: 41, label: 'SCamp 2026', campaign: 'scamp' },
  { id: 'k4n3KK0862g', duration: 15, label: 'Video Camp 2/9', campaign: 'trade', aspect: '9:16' }
];

const APP_CONFIG = {
  syncIntervalMinutes: 5,
  showStatusBar: true,
  errorSkipDelay: 2000,
  letterboxColor: '#d11423',
  campaigns: ['scamp', 'trade', 'quockhanh'],
};
