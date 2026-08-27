import { checkAuth, ghGet, ghPut, jsonResponse } from '../_shared.js';

const PATH = 'config.js';

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
    const data = await ghPut(env, PATH, body.content, 'chore: update playlists via admin dashboard', body.sha);
    return jsonResponse({ sha: data.content.sha });
  } catch (e) {
    return jsonResponse({ message: e.message }, 500);
  }
}
