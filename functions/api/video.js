// ═══════════════════════════════════════════════════════════════
//  Upload / liệt kê / xoá video offline trong R2.
//
//  Vì sao R2 chứ không đẩy thẳng vào GitHub: GitHub Contents API bắt buộc
//  gửi nội dung file dạng base64 nhét trong JSON, nghĩa là Worker phải nạp
//  cả 18MB vào bộ nhớ rồi mã hoá thành chuỗi ~24MB — đo được ~21ms CPU,
//  trong khi gói Workers Free chỉ cho 10ms mỗi request. Không lách được.
//
//  R2 thì nhận thẳng luồng dữ liệu (request.body), Worker chỉ làm ống dẫn
//  nên gần như không tốn CPU dù file bao nhiêu MB.
//
//  File tải lên được phục vụ tại /media/<tên file> — xem functions/media/[[path]].js
// ═══════════════════════════════════════════════════════════════
import { checkAuth, jsonResponse } from '../_shared.js';

// Cloudflare Free cho body tối đa 100MB. Chặn ở 60MB để lỡ ai up nhầm file
// khổng lồ thì bị từ chối sớm, thay vì chờ tải hết rồi mới hỏng.
const MAX_BYTES = 60 * 1024 * 1024;

// Chỉ nhận tên file phẳng, không dấu, không thư mục con. Chặn luôn khả năng
// đặt tên kiểu "../config.js" để ghi đè chỗ khác.
const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}\.mp4$/;

function noBucket() {
  return jsonResponse({
    message: 'Chưa gắn R2 bucket. Vào Cloudflare > Pages > project > Settings > ' +
             'Bindings > R2, thêm binding tên VIDEOS trỏ tới bucket chứa video.'
  }, 500);
}

// ── Tải file lên ────────────────────────────────────────────────
export async function onRequestPut({ request, env }) {
  if (!checkAuth(request, env)) return jsonResponse({ message: 'Unauthorized' }, 401);
  if (!env.VIDEOS) return noBucket();

  const name = new URL(request.url).searchParams.get('name') || '';
  if (!NAME_RE.test(name)) {
    return jsonResponse({
      message: 'Tên file không hợp lệ. Chỉ dùng chữ không dấu, số, dấu chấm/gạch, kết thúc bằng .mp4'
    }, 400);
  }

  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > MAX_BYTES) {
    return jsonResponse({
      message: `File ${(declared / 1048576).toFixed(1)}MB, vượt mức cho phép 60MB.`
    }, 413);
  }
  if (!request.body) return jsonResponse({ message: 'Không có nội dung file.' }, 400);

  try {
    // Chuyển tiếp thẳng luồng byte sang R2 — không nạp vào bộ nhớ, không mã hoá
    const obj = await env.VIDEOS.put(name, request.body, {
      httpMetadata: { contentType: 'video/mp4' },
    });
    return jsonResponse({
      name,
      size: obj.size,
      etag: obj.httpEtag,
      url: `/media/${name}`,
    });
  } catch (e) {
    return jsonResponse({ message: `Lưu vào R2 hỏng: ${e.message}` }, 500);
  }
}

// ── Liệt kê file đang có ────────────────────────────────────────
export async function onRequestGet({ request, env }) {
  if (!checkAuth(request, env)) return jsonResponse({ message: 'Unauthorized' }, 401);
  if (!env.VIDEOS) return noBucket();
  try {
    const listed = await env.VIDEOS.list({ limit: 200 });
    return jsonResponse({
      videos: listed.objects.map(o => ({
        name: o.key,
        size: o.size,
        uploaded: o.uploaded,
        url: `/media/${o.key}`,
      })),
    });
  } catch (e) {
    return jsonResponse({ message: e.message }, 500);
  }
}

// ── Xoá ─────────────────────────────────────────────────────────
export async function onRequestDelete({ request, env }) {
  if (!checkAuth(request, env)) return jsonResponse({ message: 'Unauthorized' }, 401);
  if (!env.VIDEOS) return noBucket();
  const name = new URL(request.url).searchParams.get('name') || '';
  if (!NAME_RE.test(name)) return jsonResponse({ message: 'Tên file không hợp lệ.' }, 400);
  try {
    await env.VIDEOS.delete(name);
    return jsonResponse({ deleted: name });
  } catch (e) {
    return jsonResponse({ message: e.message }, 500);
  }
}
