// ═══════════════════════════════════════════════════════════════
//  PLAYLIST CONFIG — quản lý qua Admin Dashboard
//  https://CPS-VHWS.github.io/cps-ad-display/admin.html
// ═══════════════════════════════════════════════════════════════

const PLAYLIST_LANDSCAPE = [
  { id: 'RNvZxqc5m6o', duration: 41, label: 'SCamp 2026', campaign: 'scamp' },
  { id: 'aCJFpFS6OPE', duration: 31, label: 'Lên đời smartphone mới', campaign: 'trade' },
  { id: 'Javr2nYWOxI', duration: 37, label: 'Mua Laptop tặng balo', campaign: 'trade', aspect: '16:9' },
  { id: 'uu_52j5NxG8', duration: 30, label: 'Bộ phụ kiện GenZ & Quà Limited 2026', campaign: 'trade', aspect: '16:9' },
  { id: 'YChx41iM5Bw', duration: 15, label: 'Video Camp 2/9', regions: [], campaign: 'off', aspect: '9:16' }
];

const PLAYLIST_PORTRAIT = [
  { id: 'YpV8qvzXvcU', duration: 41, label: 'SCamp 2026', campaign: 'scamp' },
  { id: 'k4n3KK0862g', duration: 15, label: 'Video Camp 2/9', campaign: 'trade', aspect: '9:16' }
];

// ── Playlist OFFLINE: file trong kho R2, máy tải sẵn về để phát khi mất mạng ──
// Phát lần lượt theo đúng thứ tự dưới đây; tới mốc reset thì mọi máy quay về mục đầu.
const PLAYLIST_OFFLINE_LANDSCAPE = [
  { file: 'Laptop.mp4', tag: '"3deb9d6dba8d74462eee223501c4fead"', label: 'Laptop', regions: [], campaigns: ['quockhanh'] },
  { file: 'Phu_kien_master_ngang_fix.mp4', tag: '"7d4b8bff07bdb5e017507dec514bd317"', label: 'Phu_kien_master_ngang_fix', campaigns: ['trade'] },
  { file: 'Laptop_Ngang_Master_fix.mp4', tag: '"5f4a4c3c4fdf0b497d3ae79decb8b9c7"', label: 'Laptop_Ngang_Master_fix', campaigns: ['trade'] },
  { file: 'Dien_thoai_master_fix.mp4', tag: '"ee8c363724c7f771940cfa17d0db48df"', label: 'Dien_thoai_master_fix', campaigns: ['trade'] }
];

const PLAYLIST_OFFLINE_PORTRAIT = [
  { file: 'Phu_kien_master_doc_fix.mp4', tag: '"11c2e9e4aa174b4d113d79d85e60cdfc"', label: 'Phu_kien_doc', campaigns: ['trade'] },
  { file: 'Laptop_Master_doc_fix.mp4', tag: '"293cdb1a22c14809e340f368e0114d5b"', label: 'Laptop_doc', campaigns: ['trade'] },
  { file: 'Dien_thoai_master_doc_fix.mp4', tag: '"e29c04f75019c495bacef95fe44fd6e9"', label: 'Dien_thoai_doc', campaigns: ['trade'] }
];

const APP_CONFIG = {
  syncIntervalMinutes: 5,
  showStatusBar: true,
  errorSkipDelay: 2000,
  letterboxColor: '#df092d',
  offlineResetMinutes: 5,
  sourceMode: 'offline',
  sourceModeStamp: 1788367179317,
  offlineVideoPortrait: 'media/Dt_Update.mp4',
  offlineVideoLandscape: 'media/Laptop.mp4',
  offlineVideoPortraitTag: '"be51b13412e21edcbaf4f3956a49a720"',
  offlineVideoLandscapeTag: '',
  campaigns: ['scamp', 'trade', 'quockhanh', 'off'],
};
