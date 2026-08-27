// ═══════════════════════════════════════════════════════════════
//  Shared helpers for Cloudflare Pages Functions (functions/api/*)
//  Proxies admin.html's GitHub reads/writes so the real GitHub PAT
//  never reaches the browser. Auth is a single shared secret
//  (ADMIN_API_KEY) checked against every request.
// ═══════════════════════════════════════════════════════════════

const OWNER = 'CPS-VHWS';
const REPO  = 'cps-ad-display';

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const enc = new TextEncoder();
  const ab = enc.encode(a), bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

export function checkAuth(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const key = auth.replace(/^Bearer\s+/i, '');
  return !!env.ADMIN_API_KEY && timingSafeEqual(key, env.ADMIN_API_KEY);
}

export function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}

function b64ToUtf8(b64) {
  const bytes = Uint8Array.from(atob(b64.replace(/\n/g, '')), c => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}
function utf8ToB64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

export async function ghGet(env, path) {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'cps-ad-display-admin',
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `GitHub GET failed: ${res.status}`);
  return { content: b64ToUtf8(data.content), sha: data.sha };
}

export async function ghPut(env, path, content, message, sha) {
  const body = { message, content: utf8ToB64(content) };
  if (sha) body.sha = sha;
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'cps-ad-display-admin',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `GitHub PUT failed: ${res.status}`);
  return data;
}
