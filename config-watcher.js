// ── Config Watcher ─────────────────────────────────────────────
// Polls config.js every syncIntervalMinutes.
// Sets _configChanged = true when content differs → display pages
// reload at the next video boundary (see syncAndPlay).
function startConfigWatcher(configUrl) {
  const intervalMs = (APP_CONFIG.syncIntervalMinutes || 5) * 60 * 1000;
  let fingerprint = null;
  let fetching = false;

  function doFetch() {
    if (fetching) return;
    fetching = true;
    fetch(configUrl + '?_t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.text())
      .then(t => {
        if (fingerprint && t !== fingerprint) _configChanged = true;
        fingerprint = t;
      })
      .catch(() => { window._lastError = { type: 'config_fetch', at: Date.now() }; })
      .finally(() => { fetching = false; });
  }

  doFetch(); // lấy fingerprint ban đầu
  setInterval(doFetch, intervalMs);
}

// ── Device Heartbeat ───────────────────────────────────────────
// Báo "máy này còn hoạt động" tới /api/heartbeat để admin.html thống kê.
//
// Nhịp: gọi 1 lần mỗi lần trang load, nhưng tự chặn nếu lần gửi thành công
// gần nhất chưa quá HEARTBEAT_MIN_GAP_MS → thực tế ~2 lần/ngày/máy.
// Cố ý KHÔNG dùng syncIntervalMinutes: admin chỉnh mốc đồng bộ xuống thấp
// sẽ làm số lượt ghi KV tăng vọt (free tier chỉ 1.000 lượt ghi/ngày).
const HEARTBEAT_MIN_GAP_MS = 12 * 60 * 60 * 1000;

function startHeartbeat(info) {
  let id, lastPing;
  try {
    id = localStorage.getItem('cps_device_id');
    if (!id) {
      id = 'dev-' + (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
      localStorage.setItem('cps_device_id', id);
    }
    lastPing = parseInt(localStorage.getItem('cps_device_last_ping') || '0', 10) || 0;
  } catch (e) {
    return; // Không lưu được id ổn định (private mode / storage bị chặn)
            // → bỏ qua hẳn, tránh sinh id rác mới mỗi lần load làm sai số liệu.
  }

  if (Date.now() - lastPing < HEARTBEAT_MIN_GAP_MS) return;

  // App Android gắn version vào User-Agent dạng "CPSDisplayApp/1.0.2" — lấy ra nếu có,
  // để admin biết máy đang chạy bản app nào mà không cần thêm lượt gọi mạng riêng.
  const uaMatch = navigator.userAgent.match(/CPSDisplayApp\/([\w.]+)/);
  const appVersion = uaMatch ? uaMatch[1] : null;

  // Lỗi gần nhất (nếu có) trong phiên hiện tại — chỉ báo nếu xảy ra trong 1 giờ gần đây,
  // tránh báo lỗi cũ đã tự phục hồi từ lâu.
  const err = window._lastError;
  const lastError = (err && Date.now() - err.at < 60 * 60 * 1000) ? err.type : null;

  fetch('/api/heartbeat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id, mode: info.mode, region: info.region || null, campaign: info.campaign || null,
      appVersion, lastError,
    }),
    keepalive: true,
  })
    .then(res => {
      // Chỉ ghi nhận khi server nhận thành công — máy đang mất mạng sẽ thử lại
      // ở lần reload kế tiếp thay vì im lặng bỏ qua suốt 12 tiếng.
      if (res.ok) { try { localStorage.setItem('cps_device_last_ping', String(Date.now())); } catch (e) {} }
    })
    .catch(() => {});
}
