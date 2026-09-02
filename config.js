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

// ── Playlist OFFLINE: file trong kho R2, máy tải sẵn về để phát khi mất mạng ──
// Phát lần lượt theo đúng thứ tự dưới đây; tới mốc reset thì mọi máy quay về mục đầu.
const PLAYLIST_OFFLINE_LANDSCAPE = [
  { file: 'Laptop.mp4', tag: '"3deb9d6dba8d74462eee223501c4fead"', label: 'Laptop' }
];

const PLAYLIST_OFFLINE_PORTRAIT = [
  { file: 'DT.mp4', tag: '"0e98b3d1d5ed9b8e06e866ee424eb005"', label: 'DT' },
  { file: 'Dt_Update.mp4', tag: '"be51b13412e21edcbaf4f3956a49a720"', label: 'Dt_Update' }
];

const APP_CONFIG = {
  syncIntervalMinutes: 5,
  showStatusBar: true,
  errorSkipDelay: 2000,
  letterboxColor: '#df092d',
  offlineResetMinutes: 5,
  sourceMode: 'offline',
  sourceModeStamp: 1788361552769,
  offlineVideoPortrait: 'media/Dt_Update.mp4',
  offlineVideoLandscape: 'media/Laptop.mp4',
  offlineVideoPortraitTag: '"be51b13412e21edcbaf4f3956a49a720"',
  offlineVideoLandscapeTag: '',
  campaigns: ['scamp', 'trade', 'quockhanh'],
};
