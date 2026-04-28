// ── Config Watcher ─────────────────────────────────────────────
// Polls config.js every syncIntervalMinutes.
// Sets _configChanged = true when content differs → display pages
// reload at the next video boundary (see startVideo).
function startConfigWatcher(configUrl) {
  const intervalMs = (APP_CONFIG.syncIntervalMinutes || 5) * 60 * 1000;
  let fingerprint = null;
  fetch(configUrl + '?_t=' + Date.now(), { cache: 'no-store' })
    .then(r => r.text()).then(t => { fingerprint = t; })
    .catch(() => {});
  setInterval(() => {
    fetch(configUrl + '?_t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.text()).then(t => {
        if (fingerprint && t !== fingerprint) _configChanged = true;
        fingerprint = t;
      }).catch(() => {});
  }, intervalMs);
}
