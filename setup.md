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
│                      Cloudflare Pages                           │
│              (host tĩnh, miễn phí, không giới hạn BW)          │
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
2. Admin Dashboard ghi `config.js` mới lên GitHub qua API → Cloudflare tự deploy trong ~30 giây
3. Máy hiển thị tại cửa hàng tự **reload mỗi đầu giờ** (8:00, 9:00, 10:00...) → tải `config.js` mới → cập nhật playlist
4. Video chạy liên tục, **đồng bộ theo giờ hệ thống** — tất cả máy cùng mốc giờ (00:00, 00:05, 00:10...) bắt đầu lại từ đầu playlist

### Links

| | URL |
|---|---|
| Màn hình ngang | `https://cps-ad-display.pages.dev/` |
| Màn hình dọc | `https://cps-ad-display.pages.dev/vertical/` |
| Admin Dashboard | `https://cps-ad-display.pages.dev/admin.html` |
| Admin PIN | `0526` |
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

**Quy tắc:** Trong vận hành thường ngày chỉ cần dùng Admin Dashboard — không cần đụng vào code hay file nào.

---

## 3. Cài đặt lần đầu

### 3.1 Lấy GitHub Personal Access Token

Token dùng để Admin Dashboard có quyền ghi `config.js` lên GitHub (Cloudflare tự kéo từ GitHub).

1. Đăng nhập GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. Nhấn **Generate new token**
3. Điền:
   - **Token name**: `cps-ad-display`
   - **Expiration**: tuỳ ý (khuyến nghị 1 năm)
   - **Repository access**: chọn `CPS-VHWS/cps-ad-display`
   - **Permissions → Contents**: `Read and write`
4. Nhấn **Generate token** → **sao chép ngay** (chỉ hiện 1 lần)

> ⚠️ **Không dán token vào code hoặc commit lên GitHub.** Token lưu trong localStorage trình duyệt admin, không bao giờ lên server.

### 3.2 Truy cập Admin Dashboard lần đầu

1. Mở `https://cps-ad-display.pages.dev/admin.html`
2. Nhập PIN: **`0526`**
3. Dán GitHub Token vào ô **Personal Access Token**
4. Nhấn **↓ Tải playlist từ GitHub** để load playlist hiện tại
5. Từ lần sau token được nhớ tự động (lưu trong trình duyệt)

---

## 4. Sử dụng Admin Dashboard

### 4.1 Giao diện tổng quan

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
│  [Cài đặt App]  ← sync interval...                  │
│                                                     │
│  Tổng: 3 mục · 4:35    [Export CSV] [Lưu & Deploy]  │
└─────────────────────────────────────────────────────┘
```

### 4.2 Thêm video YouTube

1. Chọn loại **▶ YouTube**
2. Dán link `https://youtube.com/watch?v=XXXXX` hoặc chỉ dán ID `XXXXX`
3. Nhập tên (tuỳ chọn)
4. Nhấn **Thêm** → duration tự động đọc từ YouTube API (nếu video public)

> **Video unlisted** (không công khai): không đọc được duration tự động — nhập thủ công (giây). Video vẫn phát bình thường.
>
> **Video bị tắt embedding** (lỗi 101/150): không phát được qua IFrame API — dùng Google Drive thay thế.

### 4.3 Thêm video Google Drive

Dùng thay thế cho YouTube khi video là unlisted hoặc bị tắt embed.

1. Mở video trên Google Drive → chuột phải → **Lấy link chia sẻ** → copy
2. Lấy **File ID** từ link: `drive.google.com/file/d/`**`FILE_ID`**`/view`
3. Trong admin: chọn **☁ Google Drive (Video)** → dán File ID
4. Nhập duration (giây) — bắt buộc
5. Đảm bảo quyền chia sẻ: **"Bất kỳ ai có đường link"**

### 4.4 Thêm hình ảnh

1. Chọn loại **🖼 Hình ảnh**
2. Dán **Google Drive File ID** hoặc **URL trực tiếp** (jpg, png, webp...)
3. Duration để trống → mặc định **5 giây**

### 4.5 Sắp xếp thứ tự

- **Kéo thả**: giữ biểu tượng `⠿` đầu hàng, kéo lên/xuống
- **Nút ↑↓**: nhấn mũi tên ở cuối hàng

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

- `type` để trống = YouTube
- `duration` để trống = tự đọc (YouTube) hoặc 5 giây (image)

Nhấn **Import CSV** → chọn file → playlist nạp vào tab đang chọn.

Nhấn **↓ File mẫu** để tải template CSV sẵn.

### 4.7 Lưu và triển khai

1. Chỉnh xong → nhấn **Lưu & Deploy**
2. Admin Dashboard ghi `config.js` lên GitHub qua API
3. Cloudflare Pages tự deploy trong **~30 giây**
4. Máy hiển thị nhận playlist mới vào **đầu giờ tiếp theo** (hoặc refresh thủ công)

---

## 5. Triển khai lên máy hiển thị

Mỗi máy chỉ cần cài **một lần**. Mọi cập nhật playlist sau đó đều tự động.

### iPad / iPhone (Safari PWA)

1. Mở **Safari** — bắt buộc dùng Safari, không dùng Chrome/Firefox
2. Vào URL:
   - iPad ngang / MacBook: `https://cps-ad-display.pages.dev/`
   - iPad đứng / iPhone: `https://cps-ad-display.pages.dev/vertical/`
3. Nhấn **Share** (biểu tượng hình vuông + mũi tên lên)
4. Chọn **"Add to Home Screen"** → đặt tên → **Add**
5. Mở app từ màn hình chính → standalone, tự fullscreen

**Khoá kiosk (tuỳ chọn):** Cài đặt → Trợ năng → Guided Access → bật → mở app → nhấn 3 lần nút Side

### Android (Chrome PWA)

1. Mở **Chrome** → vào URL
2. Menu **⋮** → **"Add to Home screen"** → **Add**
3. Mở từ màn hình chính → tự fullscreen

### MacBook (Chrome/Edge — Install as App)

1. Mở Chrome/Edge → vào URL
2. Nhấn icon **⊕** cuối thanh địa chỉ → **Install**
3. App chạy như cửa sổ riêng, không có thanh trình duyệt

**Tự khởi động cùng máy:** System Settings → General → Login Items → thêm app vừa cài

### Windows (Chrome/Edge — Install as App)

1. Mở Chrome/Edge → vào URL
2. Menu **⋮** → **Apps → Install this site as an app** → **Install**
3. **Tự khởi động:** `Win + R` → gõ `shell:startup` → Enter → kéo shortcut app vào

---

## 6. Cơ chế hoạt động

### 6.1 Phát video

Hỗ trợ 3 loại nguồn:

| Loại | Cách phát | Lưu ý |
|---|---|---|
| **YouTube** | YouTube IFrame API | Luôn muted, autoplay, không controls |
| **Google Drive video** | `<iframe>` embed Drive preview | Quyền "Bất kỳ ai có link" |
| **Hình ảnh** | `<img>` object-fit cover | GDrive File ID hoặc URL trực tiếp |

Khi video kết thúc → chuyển tiếp → hết playlist → loop lại từ đầu.

### 6.2 Đồng bộ theo System Clock

Tất cả màn hình phát **cùng video, cùng thời điểm** — không cần kết nối với nhau, chỉ cần đúng múi giờ:

```
Mỗi máy tự tính:
  ms_còn_lại = syncInterval - (giờ_hiện_tại % syncInterval)

Đúng mốc (10:00, 10:05, 10:10...) → tất cả máy nhảy về video đầu tiên
```

Ví dụ `syncIntervalMinutes = 5`: lúc 10:03 còn 2 phút → lúc 10:05:00.000 tất cả đồng loạt reset.

**Yêu cầu:** tất cả máy đúng múi giờ UTC+7 (Việt Nam).

### 6.3 Reload mỗi giờ

Mỗi máy tự động reload đúng đầu giờ (8:00, 9:00, 10:00...). Mục đích:
- Tải `config.js` mới nhất → nhận playlist vừa cập nhật từ admin
- Reset cache và trạng thái player

Playlist thay đổi trên admin → máy hiển thị cập nhật **trong vòng tối đa 1 giờ**.

### 6.4 Fullscreen kiosk

Thiết kế cho máy demo — **khách được phép dùng máy trực tiếp**:

```
App khởi động          →  Vào fullscreen tự động
Khách click / chạm     →  Thoát fullscreen (khách dùng máy)
Tab bị ẩn rồi mở lại  →  Vào fullscreen lại
Không tương tác 2 phút →  Vào fullscreen lại tự động
```

### 6.5 Xử lý lỗi video

YouTube trả lỗi (xoá, region lock, tắt embed...) → chờ 2 giây → tự skip sang video tiếp.

### 6.6 Hiển thị cover toàn màn hình

YouTube IFrame không hỗ trợ CSS `object-fit`. Dùng trick CSS:

```css
/* Ngang (16:9) */
width: 100vw;  height: 56.25vw;
min-width: 177.78vh;  min-height: 100vh;
position: absolute;  top: 50%;  left: 50%;
transform: translate(-50%, -50%);
```

Video luôn bao phủ toàn màn hình, không bị letterbox hay pillarbox.

### 6.7 PWA (Add to Home Screen)

- `manifest.json` → `display: standalone` → mở không có thanh trình duyệt
- Service Worker → cache file tĩnh → hoạt động khi mất mạng tạm thời
- Landscape: `orientation: landscape` | Portrait: `orientation: portrait`

### 6.8 Hosting — Cloudflare Pages

| Thứ | Chi tiết |
|---|---|
| **Video** | Phát từ YouTube CDN / Google CDN — không qua Cloudflare |
| **Files Cloudflare serve** | HTML + JS + config ≈ ~15KB/reload/máy |
| **2000 máy reload/giờ** | 2000 × 15KB = 30MB/giờ — không đáng kể |
| **CDN** | Cloudflare — xử lý hàng triệu req/s |
| **Bandwidth** | Không giới hạn (free tier) |
| **Commercial use** | Cho phép |

---

## 7. Tham chiếu cấu hình

### config.js

```js
// Playlist ngang — hiển thị ở index.html
const PLAYLIST_LANDSCAPE = [
  { id: 'dQw4w9WgXcQ', label: 'Quảng cáo A' },                          // YouTube
  { id: '1aBcDeFgHiJk', type: 'gdrive', label: 'Video Drive', duration: 90 }, // Google Drive
  { id: '1xYzAbCdEfGh', type: 'image',  label: 'Banner',      duration: 8  }, // Ảnh Drive
  { id: 'https://example.com/img.jpg', type: 'image', label: 'Banner URL' },  // Ảnh URL
];

// Playlist dọc — hiển thị ở vertical/index.html
const PLAYLIST_PORTRAIT = [
  { id: 'dAqo0pib06M', label: 'Video dọc A' },
];

const APP_CONFIG = {
  syncIntervalMinutes: 5,   // Đồng bộ mỗi 5 phút (tăng lên 9999 để tắt)
  showStatusBar:    true,   // false = ẩn thanh trạng thái góc dưới phải
  errorSkipDelay:   2000,   // ms chờ trước khi skip video lỗi
};
```

### Các trường playlist

| Trường | Bắt buộc | Mô tả |
|---|---|---|
| `id` | ✅ | YouTube Video ID, Google Drive File ID, hoặc URL ảnh |
| `label` | | Tên hiển thị trên thanh trạng thái |
| `type` | | Bỏ trống = YouTube \| `'gdrive'` \| `'image'` |
| `duration` | | YouTube: tự đọc — GDrive: bắt buộc — Image: mặc định 5s |

---

## 8. Vận hành & Debug

### Thanh trạng thái (góc dưới phải màn hình)

```
10:03:25 | Quảng cáo A | sync 1:35
    │           │             │
  Giờ hiện   Tên video    Còn bao lâu đến
   tại        đang phát   lần sync tiếp
```

Ẩn: đặt `showStatusBar: false` trong `APP_CONFIG`.

### Lỗi YouTube thường gặp

| Mã | Nguyên nhân | Cách xử lý |
|---|---|---|
| 2 | VideoID không hợp lệ | Kiểm tra lại ID |
| 100 | Video không tồn tại / private | Xoá khỏi playlist |
| 101 / 150 | Chủ video tắt embedding | Dùng Google Drive thay thế |
| 5 | Lỗi HTML5 player | Tự skip, thường tự hết |

> `⚠ chưa có duration` trong admin: chỉ là cảnh báo hiển thị — video vẫn phát bình thường. Nhấn **"Tự động lấy thời lượng"** để fetch, hoặc nhập thủ công.

### Checklist khi video không phát

- [ ] Đang chạy qua HTTPS? (`file://` không hoạt động với YouTube API)
- [ ] Video YouTube có bật embed không? (thử mở trực tiếp trên YouTube)
- [ ] Google Drive đã set "Bất kỳ ai có link"?
- [ ] `config.js` đã được update? (Ctrl+U xem source)
- [ ] Xoá cache: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)

---

## 9. Cập nhật code

```bash
# Clone lần đầu
git clone https://github.com/CPS-VHWS/cps-ad-display.git
cd cps-ad-display

# Sau khi sửa file
git add tên-file
git commit -m "mô tả thay đổi"
git push
# → Cloudflare Pages tự deploy trong ~30 giây

# Nếu bị rejected (admin vừa lưu config.js qua Dashboard)
git pull --rebase && git push
```

> **Lưu ý bảo mật:** Không bao giờ commit GitHub Token. GitHub tự quét và block push ngay nếu phát hiện token dạng `ghp_...`.
