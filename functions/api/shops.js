import { checkAuth, ghGet, ghPut, jsonResponse } from '../_shared.js';

// Danh sách shop (name, region) — máy Android tải trực tiếp file tĩnh shops.json
// (không qua route này) để chọn Shop lúc kích hoạt lần đầu. Route này chỉ dùng
// cho admin.html đọc/ghi qua GitHub API, giống hệt pattern của config.js.
const PATH = 'shops.json';

export async function onRequestGet({ request, env }) {
  if (!checkAuth(request, env)) return jsonResponse({ message: 'Unauthorized' }, 401);
  try {
    const { content, sha } = await ghGet(env, PATH);
    return jsonResponse({ content, sha });
  } catch (e) {
    return jsonResponse({ message: e.message }, 500);
  }
}

export async function onRequestPut({ request, env }) {
  if (!checkAuth(request, env)) return jsonResponse({ message: 'Unauthorized' }, 401);
  try {
    const body = await request.json();
    if (typeof body.content !== 'string') return jsonResponse({ message: 'Missing content' }, 400);
    const data = await ghPut(env, PATH, body.content, 'chore: update shop list via admin dashboard', body.sha);
    return jsonResponse({ sha: data.content.sha });
  } catch (e) {
    return jsonResponse({ message: e.message }, 500);
  }
}
