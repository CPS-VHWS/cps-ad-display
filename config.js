// ═══════════════════════════════════════════════════════════════
//  PLAYLIST CONFIG — quản lý qua Admin Dashboard
//  https://CPS-VHWS.github.io/cps-ad-display/admin.html
// ═══════════════════════════════════════════════════════════════

const PLAYLIST_LANDSCAPE = [
  { id: 'RNvZxqc5m6o', duration: 41, label: 'SCamp 2026', campaign: 'scamp' },
  { id: 'uu_52j5NxG8', duration: 36, label: 'TRANG BỊ "TẬN RĂNG" CHO NĂM HỌC MỚI: BỘ PHỤ KIỆN GEN Z & QUÀ LIMITED 2026! 🎧🔥', campaign: 'trade' },
  { id: 'Javr2nYWOxI', duration: 37, label: 'MUA LAPTOP TẶNG BALO 600K & QUÀ PHIÊN BẢN GIỚI HẠN: HÀNH TRANG VỮNG VÀNG VÀO ĐẠI HỌC! 💻🎓', campaign: 'trade' },
  { id: 'aCJFpFS6OPE', duration: 31, label: 'LÊN ĐỜI SMARTPHONE MỚI CHỈ 0Đ TRẢ TRƯỚC? ĐẶC QUYỀN SINH VIÊN TẠI BACK TO SCHOOL 2026! 📱✨', campaign: 'trade' }
];

const PLAYLIST_PORTRAIT = [
  { id: 'YpV8qvzXvcU', duration: 41, label: 'SCamp 2026', campaign: 'scamp' }
];

const APP_CONFIG = {
  syncIntervalMinutes: 4,
  dailyReloadHour: 8,
  dailyReloadMinute: 0,
  showStatusBar: true,
  errorSkipDelay: 2000,
  campaigns: ['scamp', 'trade'],
};
