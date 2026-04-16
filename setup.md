# CPS Ad Display — Hướng dẫn đầy đủ

> Ứng dụng web phát video quảng cáo toàn màn hình trên máy demo tại cửa hàng / sự kiện.
> Quản lý từ xa qua Admin Dashboard, không cần cài phần mềm, chạy trên mọi thiết bị.

---

## Mục lục

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Cấu trúc thư mục](#2-cấu-trúc-thư-mục)
3. [Cài đặt lần đầu](#3-cài-đặt-lần-đầu)
4. [Sử dụng Admin Dashboard](#4-sử-dụng-admin-dashboard)
5. [Triển khai lên máy hiển thị](#5-triển-khai-lên-máy-hiển-thị)
6. [Cơ chế hoạt động](#6-cơ-chế-hoạt-động)
7. [Tham chiếu cấu hình](#7-tham-chiếu-cấu-hình)
8. [Vận hành & Debug](#8-vận-hành--debug)
9. [Cập nhật code](#9-cập-nhật-code)

---

## 1. Tổng quan hệ thống

### Kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Pages                             │
│                 (host tĩnh, miễn phí, HTTPS)                    │
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │  index.html    │  │ vertical/      │  │  admin.html    │    │
│  │  (Màn hình     │  │ index.html     │  │  (Dashboard    │    │
│  │   NGANG 16:9)  │  │ (Màn hình      │  │   quản lý)     │    │
│  │                │  │  DỌC 9:16)     │  │                │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
│           │                  │                   │              │
│           └──────────────────┴──── đọc ──────────┘             │
│                                   ▼                             │
│                            config.js                            │
│                     (playlist + cấu hình)                       │
│                            ▲                                    │
│                            │ ghi qua GitHub API                 │
│                       admin.html                                │
└─────────────────────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
  Máy demo NGANG        Máy demo DỌC
  (Laptop, TV,          (iPhone, iPad
   Tablet ngang)         đứng, Tablet dọc)
```

### Luồng hoạt động

1. **Admin** (ở nhà / văn phòng) mở `admin.html` → nhập PIN → cập nhật playlist → nhấn "Lưu & Deploy"
2. Admin Dashboard ghi `config.js` mới lên GitHub qua API
3. Máy hiển thị tại cửa hàng tự **reload lúc 08:00 sáng** → tải `config.js` mới → cập nhật playlist
4. Video chạy liên tục, **đồng bộ theo giờ hệ thống** — tất cả máy cùng mốc giờ (00:00, 00:05, 00:10...) bắt đầu lại từ đầu playlist

### Links

| | URL |
|---|---|
| Màn hình ngang | `https://cps-ad-display.pages.dev/` |
| Màn hình dọc | `https://cps-ad-display.pages.dev/vertical/` |
| Admin Dashboard | `https://cps-ad-display.pages.dev/admin.html` |
| GitHub repo | `https://github.com/CPS-VHWS/cps-ad-display` |

---

## 2. Cấu trúc thư mục

```
cps-ad-display/
│
├── index.html          ← Trang hiển thị NGANG (16:9) — laptop, TV, tablet ngang
├── config.js           ← ⚙️  Playlist + cấu hình app (do Admin Dashboard tự ghi)
├── manifest.json       ← PWA metadata cho màn hình ngang
├── sw.js               ← Service Worker (cho phép Add to Home Screen + cache offline)
├── admin.html          ← Admin Dashboard — quản lý playlist từ xa
├── setup.md            ← File này
│
├── icons/
│   ├── icon-192.png    ← Icon PWA 192×192px
│   └── icon-512.png    ← Icon PWA 512×512px
│
└── vertical/
    ├── index.html      ← Trang hiển thị DỌC (9:16) — phone, tablet đứng
    └── manifest.json   ← PWA metadata cho màn hình dọc
```

**Quy tắc:** Chỉ cần sửa `config.js` để thay đổi playlist. Các file còn lại không cần đụng đến trong vận hành thường ngày.

---

## 3. Cài đặt lần đầu

### 3.1 Lấy GitHub Personal Access Token

Token dùng để Admin Dashboard có quyền ghi `config.js` lên GitHub.

1. Đăng nhập GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. Nhấn **Generate new token**
3. Điền:
   - **Token name**: `cps-ad-display`
   - **Expiration**: tuỳ ý (khuyến nghị 1 năm)
   - **Repository access**: chọn `CPS-VHWS/cps-ad-display`
   - **Permissions → Contents**: `Read and write`
4. Nhấn **Generate token** → **sao chép ngay** (chỉ hiện 1 lần)

> ⚠️ **Không dán token vào code hoặc commit lên GitHub.** Token được lưu trong localStorage của trình duyệt admin, không đồng bộ lên server.

### 3.2 Cài đặt Admin Dashboard lần đầu

1. Mở `https://cps-ad-display.pages.dev/admin.html`
2. Nhập PIN: **`0526`**
3. Dán GitHub Token vào ô **Personal Access Token**
4. Nhấn **↓ Tải playlist từ GitHub** để load playlist hiện tại
5. Từ lần sau token được nhớ tự động (lưu trong trình duyệt)

---

## 4. Sử dụng Admin Dashboard

### 4.1 Giao diện

```
┌─────────────────────────────────────────────────────┐
│  Ad Display — Admin                                 │
│                                                     │
│  [Kết nối GitHub]  ← Owner / Repo / Token           │
│                                                     │
│  [▬ Ngang (3)] [▮ Dọc (2)]  ← Tab chuyển playlist  │
│                                                     │
│  ⠿  [Thumbnail]  Tên video · YouTube · 3:00        │
│  ⠿  [Thumbnail]  Tên video · GDrive  · 1:30        │
│  ⠿  [Thumbnail]  Ảnh banner · Image  · 0:05        │
│                                                     │
│  [+ Thêm mục]                                       │
│                                                     │
│  [Cài đặt App]  ← sync interval, reload time...     │
│                                                     │
│  Tổng: 3 mục · 4:35    [Export CSV] [Lưu & Deploy]  │
└─────────────────────────────────────────────────────┘
```

### 4.2 Thêm video YouTube

1. Chọn loại **▶ YouTube**
2. Dán link `https://youtube.com/watch?v=XXXXX` hoặc chỉ dán ID `XXXXX`
3. Nhập tên (tuỳ chọn)
4. Nhấn **Thêm** → duration tự động đọc từ YouTube API (nếu video public)

> **Video unlisted** (không công khai): YouTube IFrame API không đọc được duration tự động. Cần nhập duration thủ công (giây). Video vẫn phát được bình thường.

### 4.3 Thêm video Google Drive

Dùng khi video là **unlisted YouTube** hoặc muốn dùng file riêng không cần YouTube.

1. Mở video trên Google Drive → nhấn chuột phải → **Lấy link chia sẻ** → copy link
2. Lấy **File ID** từ link: `drive.google.com/file/d/**FILE_ID**/view`
3. Trong admin: chọn loại **☁ Google Drive (Video)**, dán File ID
4. Nhập duration (giây) — bắt buộc vì không đọc được tự động
5. Đảm bảo file đã **"Bất kỳ ai có đường link"** có thể xem

### 4.4 Thêm hình ảnh

1. Chọn loại **🖼 Hình ảnh**
2. Dán **Google Drive File ID** hoặc **URL trực tiếp** đến file ảnh (jpg, png, webp...)
3. Nhập duration (giây) — nếu để trống mặc định hiển thị **5 giây**

### 4.5 Sắp xếp thứ tự

- **Kéo thả**: giữ biểu tượng `⠿` ở đầu hàng và kéo lên/xuống
- **Nút ↑↓**: nhấn nút mũi tên ở cuối hàng

### 4.6 Import playlist bằng CSV

Cột theo thứ tự: `type, id, label, duration`

```csv
type,id,label,duration
,dQw4w9WgXcQ,Quảng cáo sản phẩm A,180
,bg3iEHHTGtQ,Quảng cáo sản phẩm B,
gdrive,1aBcDeFgHiJkLmNo,Video nội bộ,90
image,1xYzAbCdEfGhIjKl,Banner sale tháng 4,8
image,https://example.com/banner.jpg,Banner URL,5
```

- Cột `type` để trống = YouTube (mặc định)
- Cột `duration` để trống = tự đọc từ API (YouTube) hoặc 5 giây (image)

Nhấn **Import CSV** → chọn file → playlist được nạp vào tab đang chọn.

### 4.7 Lưu và triển khai

1. Sau khi chỉnh xong → nhấn **Lưu & Deploy**
2. Admin Dashboard ghi `config.js` mới lên GitHub (qua API)
3. GitHub Pages cập nhật trong ~1 phút
4. Máy hiển thị sẽ load config mới vào **08:00 sáng hôm sau** (hoặc refresh thủ công)

---

## 5. Triển khai lên máy hiển thị

Mỗi máy chỉ cần làm **một lần**. Sau đó mọi cập nhật playlist đều tự động.

### iPad / iPhone (Safari PWA)

1. Mở **Safari** (không dùng Chrome/Firefox) → vào URL tương ứng:
   - iPad ngang: `https://cps-ad-display.pages.dev/`
   - iPad đứng / iPhone: `https://cps-ad-display.pages.dev/vertical/`
2. Nhấn nút **Share** (hình vuông + mũi tên lên, thanh dưới màn hình)
3. Chọn **"Add to Home Screen"** → đặt tên → **Add**
4. Mở app từ màn hình chính → chạy standalone (không có thanh địa chỉ), tự fullscreen

**Khoá màn hình kiosk (tuỳ chọn):** Cài đặt → Trợ năng → Guided Access → bật → mở app → nhấn 3 lần nút Side → bật Guided Access

### Android (Chrome PWA)

1. Mở **Chrome** → vào URL
2. Menu **⋮** → **"Add to Home screen"** → **Add**
3. Mở từ màn hình chính → tự fullscreen

### MacBook (Chrome/Edge — Install as App)

1. Mở Chrome/Edge → vào URL
2. Nhấn icon **⊕** cuối thanh địa chỉ (hoặc menu → **Save and share → Install**) → **Install**
3. App chạy như cửa sổ riêng, không thanh trình duyệt

**Tự khởi động cùng máy (tuỳ chọn):**
- System Settings → General → Login Items → thêm app vừa cài

### Windows (Chrome/Edge — Install as App)

1. Mở Chrome/Edge → vào URL
2. Menu **⋮** → **Apps → Install this site as an app** → **Install**
3. **Tự khởi động:** `Win + R` → `shell:startup` → kéo shortcut app vào thư mục vừa mở

---

## 6. Cơ chế hoạt động

### 6.1 Phát video

Ứng dụng hỗ trợ 3 loại nguồn:

| Loại | Cách phát | Ghi chú |
|---|---|---|
| **YouTube** | YouTube IFrame API | Luôn muted, autoplay, không controls |
| **Google Drive video** | `<iframe>` embed Drive preview | Cần set quyền "Bất kỳ ai có link" |
| **Hình ảnh** | `<img>` object-fit cover | GDrive file hoặc URL trực tiếp |

Trình tự phát: video cuối cùng kết thúc (sự kiện `onStateChange = 0`) → chuyển sang video tiếp → hết playlist → quay lại đầu (loop).

### 6.2 Đồng bộ theo System Clock

Tất cả màn hình phát **cùng video, cùng thời điểm** mà không cần kết nối với nhau. Cơ chế:

```
Mỗi máy tự tính:
  ms_còn_lại = (syncInterval - (giờ_hiện_tại % syncInterval))

Đúng mốc (00:00, 00:05, 00:10, 00:15...) → startVideo(0)
```

Ví dụ với `syncIntervalMinutes = 5`:
- Lúc 10:03 → còn 2 phút nữa đến mốc 10:05
- Lúc 10:05:00.000 → tất cả máy nhảy về video đầu tiên đồng loạt
- Máy nào load muộn cũng đồng bộ theo giờ, không bị lệch

**Yêu cầu:** tất cả máy phải chỉnh đúng múi giờ hệ thống (Việt Nam: UTC+7).

### 6.3 Fullscreen kiosk

Thiết kế cho máy demo tại cửa hàng — **khách được phép dùng máy**:

```
Khởi động app        →  Vào fullscreen tự động
Khách click / chạm   →  Thoát fullscreen (khách dùng máy bình thường)
Tab bị ẩn rồi mở lại →  Vào fullscreen lại
Idle 2 phút          →  Vào fullscreen lại tự động
```

Khi fullscreen: video chiếm toàn màn hình, con trỏ ẩn, không có thanh trình duyệt.

### 6.4 Reload hàng ngày lúc 08:00

Mỗi máy hiển thị tự động `location.reload(true)` đúng 08:00 mỗi sáng. Mục đích:
- Tải `config.js` mới nhất từ GitHub (để nhận thay đổi playlist từ admin)
- Xóa cache cũ
- Reset trạng thái player nếu có lỗi tích luỹ qua đêm

### 6.5 Xử lý lỗi video

Khi YouTube trả về lỗi (video bị xoá, region lock, private...):
- `onError` callback được gọi
- Chờ `errorSkipDelay` ms (mặc định 2000ms)
- Tự động chuyển sang video tiếp theo

### 6.6 Hiển thị toàn màn hình (Object-fit cover)

YouTube IFrame không hỗ trợ CSS `object-fit`. Thay vào đó dùng trick:

```css
/* Ngang (16:9) */
width: 100vw;
height: 56.25vw;      /* 9/16 × 100vw */
min-width: 177.78vh;  /* 16/9 × 100vh */
min-height: 100vh;
transform: translate(-50%, -50%);
top: 50%; left: 50%;
```

Hiệu ứng: video luôn bao phủ toàn màn hình mà không bị kéo dài, bất kể tỉ lệ màn hình.

### 6.7 PWA (Add to Home Screen)

- `manifest.json` khai báo `display: standalone` → app mở không có thanh trình duyệt
- Service Worker (`sw.js`) cache các file HTML/CSS/JS → app hoạt động khi mất mạng tạm thời
- Landscape manifest: `orientation: landscape` | Portrait manifest: `orientation: portrait`

---

## 7. Tham chiếu cấu hình

### config.js

```js
// Playlist ngang — hiển thị ở index.html
const PLAYLIST_LANDSCAPE = [
  // YouTube (mặc định, không cần trường type)
  { id: 'dQw4w9WgXcQ', label: 'Quảng cáo A' },
  { id: 'bg3iEHHTGtQ', label: 'Quảng cáo B' },

  // Google Drive video
  { id: '1aBcDeFgHiJk', type: 'gdrive', label: 'Video nội bộ', duration: 90 },

  // Hình ảnh từ Google Drive
  { id: '1xYzAbCdEfGh', type: 'image', label: 'Banner', duration: 8 },

  // Hình ảnh từ URL trực tiếp
  { id: 'https://example.com/img.jpg', type: 'image', label: 'Banner URL' },
];

// Playlist dọc — hiển thị ở vertical/index.html
const PLAYLIST_PORTRAIT = [
  { id: 'dAqo0pib06M', label: 'Video dọc A' },
];

// Cấu hình app
const APP_CONFIG = {
  syncIntervalMinutes: 5,   // Đồng bộ mỗi 5 phút. Tăng lên 9999 để tắt sync
  dailyReloadHour:     8,   // Giờ tự reload (0–23)
  dailyReloadMinute:   0,   // Phút tự reload
  showStatusBar:    true,   // false = ẩn thanh trạng thái góc dưới phải
  errorSkipDelay:   2000,   // ms chờ trước khi skip video lỗi
};
```

### Các trường của mỗi mục playlist

| Trường | Bắt buộc | Giá trị | Mô tả |
|---|---|---|---|
| `id` | ✅ | string | YouTube Video ID, Google Drive File ID, hoặc URL ảnh |
| `label` | | string | Tên hiển thị trên thanh trạng thái |
| `type` | | `'gdrive'` / `'image'` | Bỏ trống = YouTube |
| `duration` | | số (giây) | YouTube: tự đọc. GDrive: bắt buộc. Image: mặc định 5 |

---

## 8. Vận hành & Debug

### Thanh trạng thái (góc dưới phải)

```
10:03:25 | Quảng cáo A | sync 1:35
    │           │             │
  Giờ hiện   Tên video    Còn bao lâu
   tại        đang phát   đến lần sync
                           tiếp theo
```

Ẩn thanh trạng thái: đặt `showStatusBar: false` trong `APP_CONFIG`.

### Console logs

Mở DevTools (F12) → Console → tìm prefix `[AdDisplay]`:

```
[AdDisplay] Error: 150 → skip       ← video bị region lock / private
[AdDisplay] Error: 101 → skip       ← video bị embedding disabled
[AdDisplay:Portrait] Error: 100     ← video không tìm thấy
```

**Mã lỗi YouTube:**

| Mã | Nguyên nhân |
|---|---|
| 2 | VideoID không hợp lệ |
| 5 | Lỗi HTML5 player |
| 100 | Video không tồn tại hoặc private |
| 101 / 150 | Chủ video tắt tính năng embed |

### Checklist khi video không phát

- [ ] Video YouTube có bật được embed không? (Thử mở trực tiếp trên YouTube)
- [ ] Trang đang chạy qua HTTPS? (YouTube IFrame API không hoạt động với `file://`)
- [ ] Google Drive video đã set quyền "Bất kỳ ai có link"?
- [ ] `config.js` đã được update chưa? (Xem source của trang)
- [ ] Thử xoá cache: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

---

## 9. Cập nhật code

```bash
# Lần đầu — clone repo về
git clone https://github.com/CPS-VHWS/cps-ad-display.git
cd cps-ad-display

# Sau khi sửa code
git add tên-file-đã-sửa
git commit -m "mô tả ngắn"
git push

# Nếu bị rejected vì admin vừa lưu config.js qua Dashboard
git pull --rebase
git push
```

GitHub Pages tự deploy sau ~1 phút khi có push mới.

> **Lưu ý bảo mật:** Không bao giờ commit GitHub Token vào code. GitHub có hệ thống quét tự động và sẽ block push ngay lập tức nếu phát hiện token dạng `ghp_...`.
