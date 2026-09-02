// ═══════════════════════════════════════════════════════════════
//  Phục vụ video offline từ R2 tại /media/<tên file>.
//
//  Cố ý dùng đường dẫn /media/ chứ không phải /videos/: thư mục videos/ đang có
//  file tĩnh thật trong repo, đặt hàm ở đó sẽ tranh chấp với file tĩnh. Tách hẳn
//  đường dẫn thì hai cách chứa video sống song song được, chuyển dần không gãy.
//
//  App Android hỏi HEAD trước để lấy ETag rồi mới quyết có tải hay không, nên
//  HEAD BẮT BUỘC phải trả đúng ETag và Content-Length. Thiếu là máy tải lại
//  35MB mỗi tiếng dù chẳng có gì mới.
// ═══════════════════════════════════════════════════════════════

const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._ -]{0,79}\.mp4$/i;

export async function onRequest({ request, params, env }) {
  const method = request.method.toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  if (!env.VIDEOS) {
    return new Response('Chưa gắn R2 binding VIDEOS trên Cloudflare Pages.', { status: 500 });
  }

  const key = Array.isArray(params.path) ? params.path.join('/') : String(params.path || '');
  // Trả 404 thật cho tên sai. Khác hẳn file tĩnh của Pages: gõ sai đường dẫn ở đó
  // lại trả về trang index kèm mã 200, khiến app tải nhầm HTML rồi thất bại im lặng.
  if (!NAME_RE.test(key)) return new Response('Not Found', { status: 404 });

  try {
    if (method === 'HEAD') {
      const head = await env.VIDEOS.head(key);
      if (!head) return new Response(null, { status: 404 });
      const headers = new Headers();
      head.writeHttpMetadata(headers);
      headers.set('etag', head.httpEtag);
      headers.set('content-length', String(head.size));
      headers.set('content-type', head.httpMetadata?.contentType || 'video/mp4');
      // Bắt buộc hỏi lại máy chủ mỗi lần: video đổi mà máy còn ăn bản cũ trong
      // bộ đệm thì cơ chế so ETag mất tác dụng hoàn toàn.
      headers.set('cache-control', 'no-cache');
      return new Response(null, { status: 200, headers });
    }

    const obj = await env.VIDEOS.get(key);
    if (!obj) return new Response('Not Found', { status: 404 });
    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    headers.set('etag', obj.httpEtag);
    headers.set('content-type', obj.httpMetadata?.contentType || 'video/mp4');
    headers.set('cache-control', 'no-cache');
    return new Response(obj.body, { status: 200, headers });
  } catch (e) {
    return new Response(`Lỗi đọc R2: ${e.message}`, { status: 500 });
  }
}
