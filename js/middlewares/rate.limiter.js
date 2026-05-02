/**
 * RateLimiter – QuocHuy MMO
 * ============================================================
 * Chống brute-force login.
 * Lưu attempt history vào localStorage (tồn tại qua reload).
 *
 * Config mặc định:
 *  - maxAttempts : 5 lần
 *  - windowMs    : 15 phút
 * ============================================================
 */

'use strict';

const RateLimiter = (() => {
  const STORAGE_KEY   = 'mmo_rate_limits';
  const MAX_ATTEMPTS  = 5;
  const WINDOW_MS     = 15 * 60 * 1000; // 15 phút

  // ─── Lấy store từ localStorage ───────────────────────────
  function _getStore() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  // ─── Lưu store ────────────────────────────────────────────
  function _saveStore(store) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
      console.error('[RateLimiter] Không lưu được store:', e);
    }
  }

  // ─── Dọn dẹp entries cũ ──────────────────────────────────
  function _cleanup(store) {
    const now = Date.now();
    for (const key in store) {
      store[key].attempts = store[key].attempts.filter(t => now - t < WINDOW_MS);
      if (store[key].attempts.length === 0) delete store[key];
    }
    return store;
  }

  // ─── Kiểm tra limit ──────────────────────────────────────
  /**
   * @param {string} key          – thường là username hoặc IP
   * @param {number} [maxAttempts] – override default
   * @param {number} [windowMs]    – override default
   * @returns {{ allowed: boolean, remaining: number, resetInMs: number }}
   */
  function check(key, maxAttempts = MAX_ATTEMPTS, windowMs = WINDOW_MS) {
    if (!key) return { allowed: false, remaining: 0, resetInMs: 0 };

    let store = _getStore();
    store     = _cleanup(store);

    const now    = Date.now();
    const record = store[key] || { attempts: [] };

    // Lọc attempts trong window
    const recent = record.attempts.filter(t => now - t < windowMs);

    if (recent.length >= maxAttempts) {
      const oldestAttempt = Math.min(...recent);
      const resetInMs     = windowMs - (now - oldestAttempt);
      console.warn(`[RateLimiter] "${key}" bị giới hạn. Reset sau ${Math.ceil(resetInMs / 1000)}s`);
      return { allowed: false, remaining: 0, resetInMs };
    }

    return { allowed: true, remaining: maxAttempts - recent.length, resetInMs: 0 };
  }

  // ─── Ghi nhận 1 attempt thất bại ────────────────────────
  function recordAttempt(key) {
    if (!key) return;

    let store = _getStore();
    store     = _cleanup(store);

    const now    = Date.now();
    const record = store[key] || { attempts: [] };
    record.attempts.push(now);
    store[key] = record;

    _saveStore(store);
    console.log(`[RateLimiter] Ghi nhận attempt cho "${key}": ${record.attempts.length} lần`);
  }

  // ─── Xóa record (sau login thành công) ──────────────────
  function clear(key) {
    if (!key) return;
    const store = _getStore();
    delete store[key];
    _saveStore(store);
  }

  // ─── Public API ───────────────────────────────────────────
  return { check, recordAttempt, clear };
})();

window.RateLimiter = RateLimiter;
console.log('✅ RateLimiter loaded');
