import { checkAuth, jsonResponse } from '../_shared.js';

// Máy hiển thị chỉ báo cáo ~2 lần/ngày (xem HEARTBEAT_MIN_GAP_MS trong
// config-watcher.js), nên TTL để 26 tiếng: máy im lặng trọn 1 ngày mới rớt
// khỏi danh sách. KV tự xoá key hết hạn — không cần job dọn dẹp.
const TTL_SECONDS = 26 * 60 * 60;
const KEY_PREFIX = 'device:';

// Thông tin máy lưu trong KV *metadata* thay vì value: list() trả metadata
// kèm luôn, nên GET chỉ tốn 1 lượt list thay vì 1 list + N lượt get.
function kvMissing(env) {
  return !env.HEARTBEAT_KV
    ? jsonResponse({ message: 'Chưa bind KV namespace HEARTBEAT_KV trên Cloudflare (xem setup.md §3.1d)' }, 500)
    : null;
}

// POST — máy hiển thị tự gọi, không cần auth (không có gì nhạy cảm để bảo vệ,
// tệ nhất là ai đó gửi heartbeat giả — không ảnh hưởng việc phát video).
export async function onRequestPost({ request, env }) {
  const missing = kvMissing(env);
  if (missing) return missing;
  try {
    const body = await request.json();
    const id = String(body.id || '').slice(0, 128);
    if (!id) return jsonResponse({ message: 'Missing id' }, 400);
    const meta = {
      mode: body.mode === 'portrait' ? 'portrait' : 'landscape',
      region: body.region ? String(body.region).slice(0, 32) : null,
      campaign: body.campaign ? String(body.campaign).slice(0, 32) : null,
      appVersion: body.appVersion ? String(body.appVersion).slice(0, 16) : null,
      lastError: body.lastError ? String(body.lastError).slice(0, 32) : null,
      lastSeen: Date.now(),
    };
    await env.HEARTBEAT_KV.put(KEY_PREFIX + id, '', { expirationTtl: TTL_SECONDS, metadata: meta });
    return jsonResponse({ ok: true });
  } catch (e) {
    return jsonResponse({ message: e.message }, 500);
  }
}

// GET — admin.html gọi để xem danh sách máy đã báo cáo, cần Admin API Key.
export async function onRequestGet({ request, env }) {
  if (!checkAuth(request, env)) return jsonResponse({ message: 'Unauthorized' }, 401);
  const missing = kvMissing(env);
  if (missing) return missing;
  try {
    const devices = [];
    let cursor;
    do {
      const page = await env.HEARTBEAT_KV.list({ prefix: KEY_PREFIX, cursor });
      for (const k of page.keys) {
        if (k.metadata) devices.push({ id: k.name.slice(KEY_PREFIX.length), ...k.metadata });
      }
      cursor = page.list_complete ? null : page.cursor;
    } while (cursor);
    devices.sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
    return jsonResponse({ count: devices.length, devices });
  } catch (e) {
    return jsonResponse({ message: e.message }, 500);
  }
}
