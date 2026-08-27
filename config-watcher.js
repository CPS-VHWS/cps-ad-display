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
      .catch(() => {})
      .finally(() => { fetching = false; });
  }

  doFetch(); // lấy fingerprint ban đầu
  setInterval(doFetch, intervalMs);
}

// ── Device Heartbeat ───────────────────────────────────────────
// Báo "còn sống" định kỳ tới /api/heartbeat (cùng nhịp với config watcher)
// để admin.html biết máy nào đang online. id thiết bị random, lưu localStorage
// nên giữ nguyên qua các lần reload/PWA relaunch trên cùng 1 máy.
function getDeviceId() {
  try {
    let id = localStorage.getItem('cps_device_id');
    if (!id) {
      id = 'dev-' + (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
      localStorage.setItem('cps_device_id', id);
    }
    return id;
  } catch (e) {
    return 'dev-' + Math.random().toString(36).slice(2); // localStorage bị chặn (private mode) — dùng id tạm cho phiên này
  }
}

function startHeartbeat(info) {
  const intervalMs = (APP_CONFIG.syncIntervalMinutes || 5) * 60 * 1000;
  const id = getDeviceId();
  function ping() {
    fetch('/api/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, mode: info.mode, region: info.region || null, campaign: info.campaign || null }),
      keepalive: true,
    }).catch(() => {});
  }
  ping();
  setInterval(ping, intervalMs);
}
