# Ad Display — Setup Guide

Ứng dụng web kiosk phát video quảng cáo toàn màn hình, đồng bộ theo System Clock, hỗ trợ PWA (Add to Home Screen).

---

## Cấu trúc file

```
ad-display/
├── index.html      ← App chính (không cần sửa thường xuyên)
├── config.js       ← ✏️  PLAYLIST và cài đặt app (sửa tại đây)
├── manifest.json   ← PWA metadata
├── sw.js           ← Service Worker (offline shell + Add to Home Screen)
├── icons/
│   ├── icon-192.png   ← ⚠️  Cần tự thêm (xem bên dưới)
│   └── icon-512.png   ← ⚠️  Cần tự thêm
└── setup.md        ← File này
```

---

## 1. Cập nhật Playlist

Mở `config.js`, chỉnh mảng `PLAYLIST`:

```js
const PLAYLIST = [
  { id: 'VIDEO_ID_1', duration: 60,  label: 'Quảng cáo sản phẩm A' },
  { id: 'VIDEO_ID_2', duration: 90,  label: 'Quảng cáo sản phẩm B' },
];
```

**Lấy Video ID:** Mở video trên YouTube → URL dạng `youtube.com/watch?v=XXXXX` → `XXXXX` chính là ID.

---

## 2. Cài đặt App Config (config.js)

| Tham số | Mặc định | Mô tả |
|---|---|---|
| `syncIntervalMinutes` | `5` | Mốc đồng bộ (phút). Ví dụ: 5 → 10:00, 10:05, 10:10 |
| `dailyReloadHour` | `8` | Giờ tự động reload trang (0–23) |
| `dailyReloadMinute` | `0` | Phút tự động reload trang |
| `showStatusBar` | `true` | Hiện/ẩn thanh trạng thái nhỏ góc dưới phải |
| `errorSkipDelay` | `2000` | Thời gian chờ (ms) trước khi skip video lỗi |

---

## 3. Deploy

### Cách đơn giản nhất: GitHub Pages (miễn phí, HTTPS)

1. Tạo repo GitHub mới (ví dụ: `ad-display`)
2. Upload toàn bộ thư mục `ad-display/` lên repo
3. Vào **Settings → Pages → Source: main branch / root**
4. URL sẽ là: `https://<username>.github.io/ad-display/`

> **Lưu ý:** YouTube IFrame API **bắt buộc cần HTTPS**. Không chạy được qua `file://` trên trình duyệt hiện đại.

### Các lựa chọn deploy khác

- **Netlify** — kéo thả thư mục vào netlify.com/drop
- **Vercel** — `vercel deploy`
- **Máy chủ nội bộ** — Nginx/Apache phục vụ qua HTTPS (cần SSL cert)
- **localhost (test)** — `npx serve .` hoặc VS Code Live Server

---

## 4. Add to Home Screen (PWA)

### iPad / iPhone (Safari)
1. Mở URL app trên **Safari**
2. Nhấn nút **Share** (hình vuông + mũi tên lên)
3. Chọn **"Add to Home Screen"**
4. Đặt tên → **Add**
5. Mở từ Home Screen → tự động vào Standalone mode (không có thanh địa chỉ)

### Android (Chrome)
1. Mở URL app trên **Chrome**
2. Nhấn menu **⋮** → **"Add to Home screen"**
3. Xác nhận → **Add**

### MacBook / Windows (Chrome/Edge)
1. Mở URL app
2. Nhấn icon **⊕** ở cuối thanh địa chỉ → **"Install"**
3. App chạy như cửa sổ riêng, không có thanh trình duyệt

---

## 5. Thêm icon PWA (bắt buộc để Add to Home Screen hiển thị đúng)

Cần 2 file PNG nền đen, biểu tượng trắng (hoặc logo công ty):

- `icons/icon-192.png` — 192 × 192 px
- `icons/icon-512.png` — 512 × 512 px

**Tạo nhanh bằng:** [realfavicongenerator.net](https://realfavicongenerator.net) hoặc Figma/Photoshop.

---

## 6. Cơ chế hoạt động (tóm tắt)

| Tính năng | Cách hoạt động |
|---|---|
| **Đồng bộ 5 phút** | `setTimeout` tính `ms` còn lại đến mốc kế tiếp (dựa vào System Clock). Đúng giờ → `startVideo(0)` |
| **Autoplay không bị chặn** | Video luôn `mute: 1` từ đầu |
| **Object-fit cover** | CSS trick: iframe `min-width: 177.78vh` + `min-height: 56.25vw` + `translate(-50%,-50%)` |
| **Fullscreen khi chạm** | Overlay trong suốt bắt `click`/`touchstart` → `requestFullscreen()` |
| **Skip video lỗi** | `onError` callback → `setTimeout(playNext, errorSkipDelay)` |
| **Daily reload 8h** | `setTimeout` tính ms đến 08:00 ngày hôm sau → `location.reload(true)` |
| **PWA standalone** | `manifest.json` `display: standalone` + Service Worker |

---

## 7. Kiểm tra / Debug

Mở **DevTools → Console**, tìm log có prefix `[AdDisplay]`:

```
[AdDisplay] Daily reload scheduled at 17/04/2026, 08:00:00
[AdDisplay] Sync point — restarting from video 1
[AdDisplay] Player error code: 150 → skip to next
```

Thanh trạng thái góc dưới phải hiển thị: `giờ hiện tại | tên video | sync X:XX`

---

## 8. Ghi chú vận hành

- Các máy phải **cùng múi giờ hệ thống** để đồng bộ chính xác.
- Kết nối mạng ổn định để load video YouTube không bị buffer.
- Nếu muốn **bật âm thanh**: sửa `mute: 0` trong `index.html` (dòng playerVars) — lưu ý trình duyệt có thể chặn autoplay có âm thanh.
- Trên **iPad kiosk**: bật Guided Access (Cài đặt → Trợ năng → Guided Access) để khoá màn hình trên app.
