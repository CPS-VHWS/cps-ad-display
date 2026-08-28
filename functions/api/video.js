import { checkAuth, ghGetMeta, ghPutBase64, jsonResponse } from '../_shared.js';

// Video dự phòng phát khi máy mất mạng (YouTube không tải được).
// Đường dẫn cố định — app Android biết sẵn, không cần cấu hình gì thêm.
const SLOTS = {
  landscape: 'videos/fallback-landscape.mp4',
  portrait: 'videos/fallback-portrait.mp4',
};

// Cloudflare Pages từ chối phục vụ file > 25 MiB, nên chặn ở 20MB cho có biên an toàn.
const MAX_BYTES = 20 * 1024 * 1024;

// GET — admin.html hỏi xem 2 khe đã có file chưa, dung lượng bao nhiêu.
export async function onRequestGet({ request, env }) {
  if (!checkAuth(request, env)) return jsonResponse({ message: 'Unauthorized' }, 401);
  try {
    const out = {};
    for (const [slot, path] of Object.entries(SLOTS)) {
      const meta = await ghGetMeta(env, path);
      out[slot] = meta ? { exists: true, size: meta.size, path } : { exists: false, path };
    }
    return jsonResponse(out);
  } catch (e) {
    return jsonResponse({ message: e.message }, 500);
  }
}

// PUT — nhận { slot, contentBase64 } từ admin, commit lên GitHub.
// Cloudflare Pages tự deploy, file có ngay tại /videos/fallback-*.mp4
export async function onRequestPut({ request, env }) {
  if (!checkAuth(request, env)) return jsonResponse({ message: 'Unauthorized' }, 401);
  try {
    const body = await request.json();
    const path = SLOTS[body.slot];
    if (!path) return jsonResponse({ message: 'slot phải là landscape hoặc portrait' }, 400);

    const b64 = String(body.contentBase64 || '');
    if (!b64) return jsonResponse({ message: 'Thiếu nội dung file' }, 400);

    // Ước lượng kích thước thật từ độ dài base64 (4 ký tự ↔ 3 byte)
    const bytes = Math.floor(b64.length * 3 / 4);
    if (bytes > MAX_BYTES) {
      return jsonResponse({
        message: `File ${(bytes / 1048576).toFixed(1)}MB — vượt giới hạn 20MB. Nén lại rồi thử tiếp.`,
      }, 413);
    }

    // Có sha = ghi đè file cũ; không có = tạo mới
    const meta = await ghGetMeta(env, path);
    const data = await ghPutBase64(
      env, path, b64,
      `chore: cập nhật video dự phòng (${body.slot}) qua admin dashboard`,
      meta?.sha
    );
    return jsonResponse({ ok: true, size: bytes, sha: data.content.sha });
  } catch (e) {
    return jsonResponse({ message: e.message }, 500);
  }
}
