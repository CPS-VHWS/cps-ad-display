// ═══════════════════════════════════════════════════════════════
//  PLAYLIST CONFIG — Chỉnh sửa danh sách video tại đây
//  id       : YouTube Video ID (phần sau ?v= trên URL)
//  duration : Thời lượng video (giây) — tuỳ chọn, để ghi chú
//  label    : Tên video — tuỳ chọn, chỉ dùng để nhận diện
// ═══════════════════════════════════════════════════════════════
const PLAYLIST = [
  { id: 'dQw4w9WgXcQ', duration: 212,  label: 'Video quảng cáo 1' },
  { id: 'ScMzIvxBSi4', duration: 180,  label: 'Video quảng cáo 2' },
  { id: '9bZkp7q19f0', duration: 253,  label: 'Video quảng cáo 3' },
];

// ═══════════════════════════════════════════════════════════════
//  APP CONFIG — Cài đặt hành vi ứng dụng
// ═══════════════════════════════════════════════════════════════
const APP_CONFIG = {
  // Mốc đồng bộ (phút) — mặc định 5 phút: 10:00, 10:05, 10:10,...
  syncIntervalMinutes: 5,

  // Giờ tự động reload trang mỗi ngày (24h format)
  dailyReloadHour: 8,
  dailyReloadMinute: 0,

  // Hiển thị thanh trạng thái nhỏ góc phải
  showStatusBar: true,

  // Thời gian chờ (ms) trước khi skip video lỗi
  errorSkipDelay: 2000,
};
