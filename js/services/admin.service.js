/**
 * AdminService – QuocHuy MMO
 * ============================================================
 * Các thao tác admin: upgrade/downgrade premium, quản lý user.
 *
 * BẮT BUỘC:
 *  - Mọi action phải qua RoleGuard.require('admin')
 *  - Không trust caller từ frontend
 *  - Log đầy đủ mọi thao tác
 * ============================================================
 */

'use strict';

const AdminService = (() => {

  // ─── Upgrade user lên Premium ─────────────────────────────
  /**
   * @param {string} targetUsername – username cần upgrade
   * @param {number} durationDays   – số ngày (0 = vĩnh viễn)
   */
  function upgradeUser(targetUsername, durationDays = 30) {
    // 1. Verify caller là admin (re-fetch từ source)
    const adminUser = RoleGuard.require('admin');

    const users   = AuthService.getAllUsers();
    const idx     = users.findIndex(u => u.username === targetUsername);

    if (idx === -1) throw new Error(`Không tìm thấy user: ${targetUsername}`);

    const target  = users[idx];

    // 2. Không upgrade chính mình (tránh privilege escalation nhầm)
    // Admin đã là admin, skip
    if (target.role === 'admin') {
      throw new Error('Không thể thay đổi role của tài khoản admin');
    }

    // 3. Tính expiry
    let expiredAt = null;
    if (durationDays > 0) {
      const d = new Date();
      d.setDate(d.getDate() + durationDays);
      expiredAt = d.toISOString();
    }

    // 4. Update
    target.role               = 'premium';
    target.premium_expired_at = expiredAt;
    target.updatedAt          = new Date().toISOString();

    // 5. Ghi log vào transaction của target
    target.transactions = target.transactions || [];
    target.transactions.unshift({
      id:     'ADM-' + Date.now(),
      date:   new Date().toISOString(),
      desc:   `Được nâng cấp lên Premium${expiredAt ? ` (${durationDays} ngày)` : ' (Vĩnh viễn)'} bởi admin`,
      amount: 0,
      type:   'premium_upgrade',
      status: 'Thành công',
    });

    users[idx] = target;
    AuthService.saveAllUsers(users);

    // Sync currentUser nếu đang là user này
    _syncCurrentUserIfNeeded(target);

    console.log(`[AdminService] Upgrade "${targetUsername}" lên Premium (by ${adminUser.username})`, {
      expires: expiredAt || 'never',
    });

    // Gửi notification cho user
    _notifyUser(targetUsername, `⭐ Tài khoản của bạn đã được nâng cấp lên Premium${expiredAt ? ` (${durationDays} ngày)` : ' (Vĩnh viễn)'}!`);

    return target;
  }

  // ─── Downgrade user về Normal ────────────────────────────
  function downgradeUser(targetUsername) {
    const adminUser = RoleGuard.require('admin');

    const users = AuthService.getAllUsers();
    const idx   = users.findIndex(u => u.username === targetUsername);

    if (idx === -1) throw new Error(`Không tìm thấy user: ${targetUsername}`);

    const target = users[idx];

    if (target.role === 'admin') {
      throw new Error('Không thể downgrade tài khoản admin');
    }

    if (target.role === 'user') {
      throw new Error(`"${targetUsername}" đã là tài khoản thường`);
    }

    target.role               = 'user';
    target.premium_expired_at = null;
    target.updatedAt          = new Date().toISOString();

    target.transactions = target.transactions || [];
    target.transactions.unshift({
      id:     'ADM-' + Date.now(),
      date:   new Date().toISOString(),
      desc:   'Premium bị thu hồi bởi admin',
      amount: 0,
      type:   'premium_downgrade',
      status: 'Thành công',
    });

    users[idx] = target;
    AuthService.saveAllUsers(users);
    _syncCurrentUserIfNeeded(target);

    console.log(`[AdminService] Downgrade "${targetUsername}" về User (by ${adminUser.username})`);
    _notifyUser(targetUsername, 'ℹ️ Quyền Premium của bạn đã bị thu hồi.');

    return target;
  }

  // ─── Cập nhật balance ────────────────────────────────────
  function updateBalance(targetUsername, amount, desc = '') {
    const adminUser = RoleGuard.require('admin');

    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('Số tiền không hợp lệ');
    }

    const users = AuthService.getAllUsers();
    const idx   = users.findIndex(u => u.username === targetUsername);
    if (idx === -1) throw new Error(`Không tìm thấy user: ${targetUsername}`);

    const target      = users[idx];
    const oldBalance  = target.balance || 0;
    target.balance    = oldBalance + amount;
    target.updatedAt  = new Date().toISOString();

    const txnDesc = desc || (amount >= 0
      ? `Admin cộng ${amount.toLocaleString()}đ`
      : `Admin trừ ${Math.abs(amount).toLocaleString()}đ`);

    target.transactions = target.transactions || [];
    target.transactions.unshift({
      id:     'ADM-' + Date.now(),
      date:   new Date().toISOString(),
      desc:   txnDesc,
      amount: amount,
      type:   'admin_balance',
      status: 'Thành công',
    });

    users[idx] = target;
    AuthService.saveAllUsers(users);
    _syncCurrentUserIfNeeded(target);

    console.log(`[AdminService] Balance update "${targetUsername}": ${oldBalance} → ${target.balance} (by ${adminUser.username})`);
    _notifyUser(targetUsername, `💰 ${txnDesc}. Số dư mới: ${target.balance.toLocaleString()}đ`);

    return target;
  }

  // ─── Approve deposit request ─────────────────────────────
  function approveDeposit(targetUsername, txnId, amount) {
    const adminUser = RoleGuard.require('admin');

    const users = AuthService.getAllUsers();
    const idx   = users.findIndex(u => u.username === targetUsername);
    if (idx === -1) throw new Error(`Không tìm thấy user: ${targetUsername}`);

    const target = users[idx];
    const txns   = target.transactions || [];
    const txnIdx = txns.findIndex(t => t.id === txnId);
    if (txnIdx === -1) throw new Error('Không tìm thấy giao dịch');

    txns[txnIdx].status = 'Thành công';
    target.balance      = (target.balance || 0) + amount;
    target.transactions = txns;
    target.updatedAt    = new Date().toISOString();

    users[idx] = target;
    AuthService.saveAllUsers(users);
    _syncCurrentUserIfNeeded(target);

    console.log(`[AdminService] Approve deposit ${txnId} cho "${targetUsername}" (${amount.toLocaleString()}đ) by ${adminUser.username}`);
    _notifyUser(targetUsername, `✅ Yêu cầu nạp tiền ${amount.toLocaleString()}đ đã được duyệt!`);

    return target;
  }

  // ─── Lấy tất cả users cho admin panel ───────────────────
  function getAllUsersForAdmin() {
    RoleGuard.require('admin');
    return AuthService.getAllUsers();
  }

  // ─── Helper: sync currentUser nếu cùng user ──────────────
  function _syncCurrentUserIfNeeded(updatedUser) {
    try {
      const current = JSON.parse(localStorage.getItem('mmo_currentUser'));
      if (current && current.username === updatedUser.username) {
        localStorage.setItem('mmo_currentUser', JSON.stringify(updatedUser));
      }
    } catch { /* bỏ qua nếu parse lỗi */ }
  }

  // ─── Gửi notification cho user ───────────────────────────
  function _notifyUser(username, message) {
    try {
      const key    = `mmo_notifs_${username}`;
      const notifs = JSON.parse(localStorage.getItem(key) || '[]');
      notifs.unshift({
        id:      'N-' + Date.now(),
        message,
        read:    false,
        date:    new Date().toISOString(),
      });
      localStorage.setItem(key, JSON.stringify(notifs));
    } catch (e) {
      console.warn('[AdminService] _notifyUser error:', e);
    }
  }

  // ─── Public API ───────────────────────────────────────────
  return {
    upgradeUser,
    downgradeUser,
    updateBalance,
    approveDeposit,
    getAllUsersForAdmin,
  };
})();

window.AdminService = AdminService;
console.log('✅ AdminService loaded');
