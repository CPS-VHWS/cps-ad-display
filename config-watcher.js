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
