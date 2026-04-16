# CPS Ad Display — Setup Guide

Ứng dụng web kiosk phát video quảng cáo toàn màn hình, đồng bộ theo System Clock, hỗ trợ PWA (Add to Home Screen). Quản lý playlist qua Admin Dashboard không cần chạm vào code.

---

## Tổng quan

| | |
|---|---|
| **URL ngang (landscape)** | `https://cps-vhws.github.io/cps-ad-display/` |
| **URL dọc (portrait)** | `https://cps-vhws.github.io/cps-ad-display/vertical/` |
| **Admin dashboard** | `https://cps-vhws.github.io/cps-ad-display/admin.html` |
| **Admin PIN** | `0526` |
| **GitHub repo** | `https://github.com/CPS-VHWS/cps-ad-display` |

---

## Cấu trúc file

```
cps-ad-display/
├── index.html          ← App hiển thị NGANG (16:9)
├── config.js           ← Playlist + cấu hình app (do Admin Dashboard ghi)
├── manifest.json       ← PWA metadata (landscape)
├── sw.js               ← Service Worker (offline + Add to Home Screen)
├── admin.html          ← Admin Dashboard quản lý playlist
├── setup.md            ← File này
├── icons/
│   ├── icon-192.png    ← PWA icon 192×192
│   └── icon-512.png    ← PWA icon 512×512
└── vertical/
    ├── index.html      ← App hiển thị DỌC (9:16)
    └── manifest.json   ← PWA metadata (portrait)
```

---

## Yêu cầu ban đầu → Tính năng đã hoàn thiện

### Yêu cầu gốc
- Phát video YouTube toàn màn hình, muted, tự động
- Đồng bộ tất cả màn hình theo System Clock (không cần server)
- PWA — Add to Home Screen trên iPad, Android, MacBook
- Admin dashboard để cập nhật playlist từ xa
- Hỗ trợ riêng video dọc (9:16) và ngang (16:9)
- Hỗ trợ Google Drive video và hình ảnh
- Kéo thả thứ tự video trong admin
- Import playlist bằng CSV

### Tính năng đã hoàn thiện

| Tính năng | Trạng thái |
|---|---|
| YouTube IFrame API, autoplay muted | ✅ |
| Đồng bộ 5 phút theo System Clock | ✅ |
| Skip tự động khi video lỗi | ✅ |
| Daily reload lúc 08:00 | ✅ |
| PWA — landscape + portrait riêng | ✅ |
| Admin Dashboard với PIN | ✅ |
| Lưu GitHub token ở localStorage | ✅ |
| Tự đọc thời lượng video YouTube | ✅ |
| Tổng thời lượng playlist | ✅ |
| Google Drive video (embed) | ✅ |
| Google Drive / URL hình ảnh | ✅ |
| Kéo thả thứ tự video | ✅ |
| Import / Export CSV | ✅ |
| Fullscreen kiosk: click thoát, idle vào lại | ✅ |
| Loop playlist khi hết video | ✅ |
| Thanh trạng thái (giờ, tên video, sync) | ✅ |

---

## Config.js — Cấu trúc

File `config.js` được Admin Dashboard tự động ghi. Cấu trúc:

```js
// Playlist ngang — dùng cho index.html
const PLAYLIST_LANDSCAPE = [
  { id: 'VIDEO_ID', label: 'Tên video' },                        // YouTube (mặc định)
  { id: 'DRIVE_FILE_ID', type: 'gdrive', label: 'Video GDrive', duration: 60 }, // Google Drive video
  { id: 'DRIVE_FILE_ID', type: 'image', label: 'Ảnh', duration: 5 },            // Hình ảnh GDrive
  { id: 'https://example.com/img.jpg', type: 'image', label: 'Ảnh URL' },       // Hình ảnh URL
];

// Playlist dọc — dùng cho vertical/index.html
const PLAYLIST_PORTRAIT = [
  { id: 'VIDEO_ID', label: 'Tên video' },
];

// Cấu hình chung
const APP_CONFIG = {
  syncIntervalMinutes: 5,   // Mốc đồng bộ (phút)
  dailyReloadHour: 8,       // Giờ tự reload trang
  dailyReloadMinute: 0,     // Phút tự reload trang
  showStatusBar: true,      // Hiện thanh trạng thái góc dưới phải
  errorSkipDelay: 2000,     // ms chờ trước khi skip video lỗi
};
```

**Loại media hỗ trợ:**

| `type` | `id` cần điền | `duration` |
|---|---|---|
| *(không điền — mặc định YouTube)* | YouTube Video ID (vd: `dQw4w9WgXcQ`) | Tự đọc từ API |
| `gdrive` | Google Drive File ID | Cần điền thủ công (giây) |
| `image` | Google Drive File ID hoặc URL đầy đủ | Mặc định 5s nếu không điền |

---

## Admin Dashboard

### Truy cập
1. Mở `https://cps-vhws.github.io/cps-ad-display/admin.html`
2. Nhập PIN: **`0526`**
3. Lần đầu: nhập GitHub Personal Access Token (quyền `contents: write` trên repo `cps-ad-display`)
   - Token được lưu ở **localStorage** trên trình duyệt — không commit lên GitHub
   - Tạo token tại: `github.com → Settings → Developer settings → Personal access tokens (fine-grained)`

### Quản lý playlist
- **Thêm video**: Dán YouTube link hoặc ID → nhấn "Thêm"
  - Duration tự động fetch nếu video public; cần nhập thủ công nếu unlisted
- **Thêm Google Drive video**: Chọn type "Google Drive", dán File ID
- **Thêm hình ảnh**: Chọn type "Image", dán Google Drive File ID hoặc URL hình ảnh
- **Kéo thả**: Giữ và kéo hàng để sắp xếp thứ tự
- **Xoá**: Nhấn nút ✕ ở từng hàng
- **Lưu**: Nhấn "Lưu & Deploy" → ghi thẳng vào `config.js` trên GitHub

### Import CSV
Cột theo thứ tự: `type, id, label, duration`

```csv
,dQw4w9WgXcQ,Quảng cáo A,180
,bg3iEHHTGtQ,Quảng cáo B,
gdrive,1aBcDeFgHiJkL,Video Drive,90
image,1xYzAbCdEfGh,Banner sale,8
image,https://example.com/img.jpg,Banner URL,5
```

- Cột `type` để trống = YouTube
- Cột `duration` để trống = tự đọc (YouTube) hoặc 5s (image)

### Export CSV
Nhấn "Export CSV" để tải về file playlist hiện tại.

---

## Cài đặt kiosk trên máy hiển thị

### iPad (Safari PWA)
1. Mở Safari → truy cập URL phù hợp (ngang hoặc dọc)
2. Nhấn **Share** → **"Add to Home Screen"** → **Add**
3. Mở app từ Home Screen → chạy standalone, fullscreen tự động
4. *(Tuỳ chọn)* Bật **Guided Access**: Cài đặt → Trợ năng → Guided Access → khoá app khi trưng bày

### Android (Chrome PWA)
1. Mở Chrome → truy cập URL
2. Menu **⋮** → **"Add to Home screen"** → Xác nhận
3. Mở từ màn hình chính → fullscreen tự động

### MacBook (Chrome/Edge — Install as App)
1. Mở trình duyệt → truy cập URL
2. Nhấn icon **⊕** cuối thanh địa chỉ → **Install**
3. App chạy như cửa sổ riêng
4. *(Tuỳ chọn)* Thêm vào Login Items: System Settings → General → Login Items

### Windows (Chrome/Edge — Install as App)
1. Mở trình duyệt → truy cập URL
2. Menu **⋮** → **Apps** → **Install this site as an app**
3. *(Tuỳ chọn)* Thêm shortcut vào Startup folder

---

## Cơ chế Fullscreen (Kiosk)

Thiết bị đặt ở cửa hàng / sự kiện để **khách trải nghiệm trực tiếp**:

| Sự kiện | Hành động |
|---|---|
| App khởi động | Vào fullscreen tự động |
| Khách **click / chạm** | **Thoát fullscreen** → khách dùng được máy |
| Tab bị ẩn rồi hiện lại | Vào lại fullscreen |
| **Không tương tác 2 phút** | **Vào lại fullscreen** tự động |

---

## Cơ chế đồng bộ (Sync)

Tất cả máy **không cần kết nối với nhau** — chỉ cần cùng múi giờ hệ thống:

```
Mỗi máy tính: ms còn lại = (5 phút - (giờ hiện tại % 5 phút))
Đúng mốc (10:00, 10:05, 10:10,...) → startVideo(0)
```

- `syncIntervalMinutes: 5` → đồng bộ mỗi 5 phút
- Để tắt sync: tăng `syncIntervalMinutes` lên số lớn (vd: `9999`)

---

## Cơ chế kỹ thuật (tham khảo)

| Vấn đề | Giải pháp |
|---|---|
| Autoplay bị chặn | Luôn `mute: 1` trong playerVars + `player.mute()` sau onReady |
| iframe không hỗ trợ object-fit | CSS trick: `min-width: 177.78vh` + `min-height: 56.25vw` + `translate(-50%,-50%)` |
| Loop playlist | Modulo: `((index % length) + length) % length` — tự wrap về 0 |
| GitHub token an toàn | Không commit vào code; lưu ở `localStorage` trình duyệt admin |
| Video unlisted YouTube | Không embed được qua IFrame API; dùng Google Drive thay thế |

---

## Debug / Kiểm tra

Thanh trạng thái góc dưới phải (nếu `showStatusBar: true`):
```
10:03:25 | Tên video | sync 1:35
```

DevTools → Console → tìm prefix `[AdDisplay]` hoặc `[AdDisplay:Portrait]`:
```
[AdDisplay] Error: 150 → skip
[AdDisplay:Portrait] Error: 101 → skip
```

---

## Deploy / Cập nhật code

```bash
# Clone lần đầu
git clone https://github.com/CPS-VHWS/cps-ad-display.git

# Commit và push sau khi sửa code
git add .
git commit -m "mô tả thay đổi"
git push

# Nếu remote có commit mới trước (vd: admin dashboard vừa lưu config)
git pull --rebase
git push
```

GitHub Pages tự deploy sau ~1 phút khi có push mới.

> **Lưu ý bảo mật:** Không bao giờ commit GitHub Token vào code. GitHub Push Protection sẽ chặn push nếu phát hiện token dạng `ghp_...` trong file.
