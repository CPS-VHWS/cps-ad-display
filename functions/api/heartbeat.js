import { checkAuth, jsonResponse } from '../_shared.js';

// TTL cho mỗi heartbeat — không báo cáo lại trong 30 phút thì tự "rớt" khỏi
// danh sách online (KV tự xoá key hết hạn, không cần logic lọc thời gian ở đây).
const TTL_SECONDS = 30 * 60;
const KEY_PREFIX = 'device:';

// POST — máy hiển thị tự gọi định kỳ, không cần auth (không có gì nhạy cảm để bảo vệ,
// tệ nhất là ai đó gửi heartbeat giả — không ảnh hưởng chức năng hiển thị video).
export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const id = String(body.id || '').slice(0, 128);
    if (!id) return jsonResponse({ message: 'Missing id' }, 400);
    const entry = {
      mode: body.mode === 'portrait' ? 'portrait' : 'landscape',
      region: body.region ? String(body.region).slice(0, 32) : null,
      campaign: body.campaign ? String(body.campaign).slice(0, 32) : null,
      lastSeen: Date.now(),
    };
    await env.HEARTBEAT_KV.put(KEY_PREFIX + id, JSON.stringify(entry), { expirationTtl: TTL_SECONDS });
    return jsonResponse({ ok: true });
  } catch (e) {
    return jsonResponse({ message: e.message }, 500);
  }
}

// GET — admin.html gọi để xem danh sách máy đang online, cần Admin API Key.
export async function onRequestGet({ request, env }) {
  if (!checkAuth(request, env)) return jsonResponse({ message: 'Unauthorized' }, 401);
  try {
    const list = await env.HEARTBEAT_KV.list({ prefix: KEY_PREFIX });
    const devices = (await Promise.all(list.keys.map(async k => {
      const raw = await env.HEARTBEAT_KV.get(k.name);
      if (!raw) return null;
      return { id: k.name.slice(KEY_PREFIX.length), ...JSON.parse(raw) };
    }))).filter(Boolean).sort((a, b) => b.lastSeen - a.lastSeen);
    return jsonResponse({ count: devices.length, devices });
  } catch (e) {
    return jsonResponse({ message: e.message }, 500);
  }
}
