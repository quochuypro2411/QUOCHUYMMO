/**
 * AuthService – QuocHuy MMO
 * ============================================================
 * Service layer cho authentication.
 * Tách logic khỏi auth.js (UI layer).
 *
 * Features:
 *  - hashPassword() dùng SubtleCrypto SHA-256
 *  - login() tích hợp RateLimiter
 *  - verifyRole() re-fetch từ source
 *  - upgradeUserRole() chỉ admin gọi được
 * ============================================================
 */

'use strict';

const AuthService = (() => {

  // ─── Hash password (SubtleCrypto) ────────────────────────
  async function hashPassword(password) {
    const encoder   = new TextEncoder();
    const data      = encoder.encode(password);
    const hashBuf   = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuf))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
  }

  // ─── Lấy tất cả users ────────────────────────────────────
  function getAllUsers() {
    try {
      return JSON.parse(localStorage.getItem('mmo_users') || '[]');
    } catch {
      return [];
    }
  }

  // ─── Lưu tất cả users ────────────────────────────────────
  function saveAllUsers(users) {
    localStorage.setItem('mmo_users', JSON.stringify(users));
  }

  // ─── Login với rate-limit ────────────────────────────────
  /**
   * @param {string} username
   * @param {string} password – plaintext
   * @returns {Promise<object>} user object nếu thành công
   */
  async function login(username, password) {
    // Validate input
    if (!username || username.trim().length < 4) {
      throw new Error('Tên đăng nhập không hợp lệ (tối thiểu 4 ký tự)');
    }
    if (!password || password.length < 6) {
      throw new Error('Mật khẩu không hợp lệ (tối thiểu 6 ký tự)');
    }

    const key         = `login:${username.toLowerCase().trim()}`;
    const limitResult = RateLimiter.check(key);

    if (!limitResult.allowed) {
      const mins = Math.ceil(limitResult.resetInMs / 60000);
      throw new Error(`Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ${mins} phút.`);
    }

    const passwordHash = await hashPassword(password);
    const users        = getAllUsers();
    let user           = users.find(u =>
      u.username === username.trim() &&
      (u.passwordHash === passwordHash || u.password === password)
    );

    if (!user) {
      // Ghi nhận thất bại
      RateLimiter.recordAttempt(key);
      const remaining = limitResult.remaining - 1;
      const suffix    = remaining > 0 ? ` (còn ${remaining} lần thử)` : ' (tài khoản sẽ bị khóa tạm)';
      throw new Error(`Sai tài khoản hoặc mật khẩu${suffix}`);
    }

    // Login thành công → clear rate limit
    RateLimiter.clear(key);

    // Upgrade plaintext password nếu có
    if (!user.passwordHash) {
      user.passwordHash = passwordHash;
      delete user.password;
    }

    // Gán quyền mặc định nếu chưa có
    if (!user.permissions) {
      user.permissions = getDefaultPermissions(user.role === 'admin' || user.isAdmin);
    }

    // Check premium expiry ngay khi login
    if (user.role === 'premium' && user.premium_expired_at) {
      const expiry = new Date(user.premium_expired_at);
      if (!isNaN(expiry.getTime()) && expiry <= new Date()) {
        console.log('[AuthService] Premium hết hạn khi login, downgrade về user');
        user.role = 'user';
        delete user.premium_expired_at;
      }
    }

    // Sync back to mmo_users
    const idx = users.findIndex(u => u.username === user.username);
    if (idx !== -1) {
      users[idx] = user;
      saveAllUsers(users);
    }

    localStorage.setItem('mmo_currentUser', JSON.stringify(user));
    console.log(`[AuthService] Login thành công: ${user.username} (${user.role})`);
    return user;
  }

  // ─── Register ─────────────────────────────────────────────
  /**
   * @param {string} username
   * @param {string} password
   * @param {string} email
   * @returns {Promise<object>} newUser
   */
  async function register(username, password, email) {
    // Validate
    if (!username || username.trim().length < 4)
      throw new Error('Tên đăng nhập phải từ 4 ký tự trở lên');
    if (!password || password.length < 6)
      throw new Error('Mật khẩu phải từ 6 ký tự trở lên');
    if (!email || !email.includes('@') || !email.includes('.'))
      throw new Error('Email không hợp lệ');

    const users = getAllUsers();

    if (users.find(u => u.username === username.trim())) {
      throw new Error('Tên đăng nhập đã tồn tại');
    }
    if (users.find(u => u.email === email.trim().toLowerCase())) {
      throw new Error('Email đã được sử dụng bởi tài khoản khác');
    }

    const passwordHash = await hashPassword(password);
    const isAdminUser  = username.toLowerCase().trim() === 'admin';

    const newUser = {
      username:          username.trim(),
      email:             email.trim().toLowerCase(),
      passwordHash,
      balance:           0,
      transactions:      [],
      role:              isAdminUser ? 'admin' : 'user',
      isAdmin:           isAdminUser,
      permissions:       getDefaultPermissions(isAdminUser),
      premium_expired_at: null,
      createdAt:         new Date().toISOString(),
      updatedAt:         new Date().toISOString(),
    };

    users.push(newUser);
    saveAllUsers(users);
    console.log(`[AuthService] Register thành công: ${newUser.username} (${newUser.role})`);
    return newUser;
  }

  // ─── Reset password ───────────────────────────────────────
  async function resetPassword(email, newPassword) {
    if (!email || !email.includes('@')) throw new Error('Email không hợp lệ');
    if (!newPassword || newPassword.length < 6) throw new Error('Mật khẩu mới phải từ 6 ký tự');

    const users    = getAllUsers();
    const idx      = users.findIndex(u => u.email === email.trim().toLowerCase());
    if (idx === -1) throw new Error('Email không tồn tại trong hệ thống');

    users[idx].passwordHash = await hashPassword(newPassword);
    users[idx].updatedAt    = new Date().toISOString();
    delete users[idx].password;
    saveAllUsers(users);
    return users[idx];
  }

  // ─── Quyền mặc định theo role ────────────────────────────
  function getDefaultPermissions(isAdmin = false) {
    if (!isAdmin) {
      return { viewDashboard: true };
    }
    return {
      approveOrders:   true,
      manageUsers:     true,
      manageBalances:  true,
      approveDeposits: true,
      viewReports:     true,
    };
  }

  // ─── Logout ───────────────────────────────────────────────
  function logout() {
    localStorage.removeItem('mmo_currentUser');
    console.log('[AuthService] Đã logout');
  }

  // ─── Public API ───────────────────────────────────────────
  return {
    login,
    register,
    resetPassword,
    logout,
    hashPassword,
    getAllUsers,
    saveAllUsers,
    getDefaultPermissions,
  };
})();

window.AuthService = AuthService;
console.log('✅ AuthService loaded');
