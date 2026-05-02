/**
 * RoleGuard – QuocHuy MMO
 * ============================================================
 * Middleware kiểm tra quyền truy cập.
 *
 * NGUYÊN TẮC BẮT BUỘC:
 *  - KHÔNG trust window.mmo_currentUser trực tiếp
 *  - Luôn re-fetch từ mmo_users[] để verify
 *  - Kiểm tra premium_expired_at khi role = 'premium'
 * ============================================================
 */

'use strict';

const RoleGuard = (() => {
  // Thứ bậc role (số càng cao = quyền càng cao)
  const ROLE_HIERARCHY = {
    user:    0,
    premium: 1,
    admin:   2,
  };

  // ─── Helper: lấy identifier của user (hỗ trợ cả 2 field) ─
  function _getUname(u) {
    return (u && (u.username || u.user || u.email)) || null;
  }

  // ─── Re-fetch user từ source (mmo_users[]) ───────────────
  /**
   * Lấy user đã verify từ mmo_users, không trust mmo_currentUser.
   * Đồng thời check premium expiry và auto-downgrade nếu hết hạn.
   *
   * Hỗ trợ cả 2 field name: `username` (mới) và `user` (cũ / auth.html).
   * @returns {object|null}
   */
  function getVerifiedUser() {
    try {
      const currentRaw = localStorage.getItem('mmo_currentUser');
      if (!currentRaw) return null;

      const current = JSON.parse(currentRaw);
      if (!current) return null;

      // Normalize: lấy identifier dù là `username` hay `user`
      const currentId = _getUname(current);
      if (!currentId) return null;

      // Re-fetch từ mmo_users để lấy role mới nhất
      const users = JSON.parse(localStorage.getItem('mmo_users') || '[]');

      // Match bằng username, user, hoặc email
      const fresh = users.find(u => {
        const uid = _getUname(u);
        return uid && (
          uid === currentId ||
          (u.email && u.email === current.email)
        );
      });

      if (!fresh) {
        // User không tồn tại trong DB → force logout
        console.warn('[RoleGuard] User không tồn tại trong mmo_users → clear session');
        localStorage.removeItem('mmo_currentUser');
        return null;
      }

      // Chuẩn hoá: gán username = user nếu chưa có (backward compat)
      if (!fresh.username && fresh.user) fresh.username = fresh.user;
      if (!fresh.user && fresh.username)  fresh.user     = fresh.username;

      // Check premium expiry
      if (fresh.role === 'premium' && fresh.premium_expired_at) {
        const expiry = new Date(fresh.premium_expired_at);
        if (!isNaN(expiry.getTime()) && expiry <= new Date()) {
          console.log('[RoleGuard] Premium hết hạn cho:', _getUname(fresh), '→ auto-downgrade');
          fresh.role = 'user';
          delete fresh.premium_expired_at;

          // Update mmo_users
          const idx = users.findIndex(u => _getUname(u) === _getUname(fresh));
          if (idx !== -1) {
            users[idx] = fresh;
            localStorage.setItem('mmo_users', JSON.stringify(users));
          }
          // Update mmo_currentUser
          localStorage.setItem('mmo_currentUser', JSON.stringify(fresh));
        }
      }

      // Sync mmo_currentUser nếu role đã thay đổi
      if (fresh.role !== current.role) {
        localStorage.setItem('mmo_currentUser', JSON.stringify(fresh));
      }

      return fresh;
    } catch (e) {
      console.error('[RoleGuard] getVerifiedUser() error:', e);
      return null;
    }
  }

  // ─── Kiểm tra quyền ──────────────────────────────────────
  /**
   * @param {string} requiredRole – 'user' | 'premium' | 'admin'
   * @returns {{ allowed: boolean, user: object|null, reason: string }}
   */
  function check(requiredRole) {
    const user = getVerifiedUser();

    if (!user) {
      return { allowed: false, user: null, reason: 'unauthenticated' };
    }

    const userLevel     = ROLE_HIERARCHY[user.role]     ?? -1;
    const requiredLevel = ROLE_HIERARCHY[requiredRole]  ?? 999;

    if (userLevel < requiredLevel) {
      console.warn(`[RoleGuard] "${user.username}" (${user.role}) không có quyền truy cập "${requiredRole}"`);
      return {
        allowed: false,
        user,
        reason: `insufficient_role:required=${requiredRole},current=${user.role}`,
      };
    }

    return { allowed: true, user, reason: 'ok' };
  }

  // ─── Require – throw nếu không đủ quyền ─────────────────
  function require(requiredRole) {
    const result = check(requiredRole);
    if (!result.allowed) {
      throw new Error(`[RoleGuard] Không đủ quyền: ${result.reason}`);
    }
    return result.user;
  }

  // ─── Public API ───────────────────────────────────────────
  return { check, require, getVerifiedUser, ROLE_HIERARCHY };
})();

window.RoleGuard = RoleGuard;
console.log('✅ RoleGuard loaded');
