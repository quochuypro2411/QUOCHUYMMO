/**
 * Auth – QuocHuy MMO
 * ============================================================
 * UI layer cho authentication.
 * Logic thực sự nằm trong AuthService + RateLimiter + RoleGuard.
 *
 * File này chỉ:
 *  - Gọi AuthService (không tự implement logic)
 *  - Update UI header sau login/logout
 *  - Hiển thị premium badge nếu user là premium
 * ============================================================
 */

'use strict';

const Auth = {
  // ── Init ──────────────────────────────────────────────────
  init: () => {
    if (!localStorage.getItem('mmo_users')) {
      localStorage.setItem('mmo_users', JSON.stringify([]));
    }
    Auth.updateUI();
  },

  // ── Getters (delegate to RoleGuard để re-verify) ──────────
  getUsers:       () => AuthService.getAllUsers(),
  getCurrentUser: () => RoleGuard.getVerifiedUser(), // Re-verify, không trust raw

  // ── Permissions ───────────────────────────────────────────
  getDefaultPermissions: (isAdmin = false) => AuthService.getDefaultPermissions(isAdmin),

  hasPermission: (user, key) => {
    if (!user) return false;
    if (user.role === 'admin' || user.isAdmin) return true;
    return user.permissions?.[key] === true;
  },

  hashPassword: AuthService.hashPassword,

  // ── Login (với rate-limit từ AuthService) ─────────────────
  login: async (username, password) => {
    return new Promise(async (resolve, reject) => {
      try {
        // AuthService.login() đã tích hợp RateLimiter
        const user = await AuthService.login(username, password);
        Auth.updateUI();

        // Apply layout theo role
        if (window.LayoutManager) {
          LayoutManager.apply();
        }

        resolve(user);
      } catch (err) {
        console.error('[Auth.login] Error:', err.message);
        reject(err);
      }
    });
  },

  // ── Register ──────────────────────────────────────────────
  register: async (username, password, email) => {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await AuthService.register(username, password, email);
        resolve(user);
      } catch (err) {
        console.error('[Auth.register] Error:', err.message);
        reject(err);
      }
    });
  },

  // ── Reset Password ────────────────────────────────────────
  resetPassword: async (email, password) => {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await AuthService.resetPassword(email, password);
        resolve(user);
      } catch (err) {
        console.error('[Auth.resetPassword] Error:', err.message);
        reject(err);
      }
    });
  },

  // ── Logout ────────────────────────────────────────────────
  logout: () => {
    AuthService.logout();
    Auth.updateUI();

    // Reset về default layout
    if (window.LayoutManager) {
      DefaultLayout.apply();
    }

    if (window.Router) {
      window.Router.navigate('/');
    } else {
      window.location.href = 'index.html';
    }
  },

  // ── Update UI header ──────────────────────────────────────
  updateUI: () => {
    const user    = Auth.getCurrentUser(); // Re-verified user
    const authArea = document.getElementById('auth-area');
    if (!authArea) return;

    if (user) {
      // Kiểm tra premium status qua PricingService (nếu đã load)
      const isPremium = window.PricingService
        ? PricingService.isPremiumActive(user)
        : (user.role === 'premium');

      // Premium badge HTML
      const premiumBadge = isPremium
        ? `<span class="premium-header-badge">⭐ PREMIUM</span>`
        : '';

      // Expiry info
      const expiryInfo = isPremium && user.premium_expired_at
        ? `<span style="font-size:10px; color:#f59e0b; margin-left:4px;">(${new Date(user.premium_expired_at).toLocaleDateString('vi-VN')})</span>`
        : '';

      authArea.innerHTML = `
        <div class="user-dropdown">
          <div class="user-dropdown-toggle" id="user-dropdown-toggle">
            ${premiumBadge}
            <span class="user-greeting">Hi, ${user.username || user.user}${expiryInfo}</span>
            <span class="user-balance" style="color:#10b981; font-weight:bold; margin-left:5px;">${(user.balance || 0).toLocaleString()}đ</span>
            <i class="fas fa-chevron-down" style="font-size:10px; margin-left:4px; opacity:0.6;"></i>
          </div>
          <div class="user-dropdown-menu" id="user-dropdown-menu">
            <a href="/dashboard" data-link><i class="fas fa-tachometer-alt"></i> Dashboard</a>
            <a href="/deposit" data-link><i class="fas fa-wallet"></i> Nạp tiền</a>
            ${user.role === 'admin' ? `<a href="admin.html"><i class="fas fa-cog"></i> Quản trị</a>` : ''}
            ${!isPremium && user.role !== 'admin' ? `<a href="/premium" data-link style="color:#f59e0b;"><i class="fas fa-star"></i> Nâng cấp Premium</a>` : ''}
            <a href="#" onclick="Auth.logout(); return false;" style="color:#ef4444;"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a>
          </div>
        </div>
      `;

      // Toggle dropdown
      const toggle = document.getElementById('user-dropdown-toggle');
      const menu   = document.getElementById('user-dropdown-menu');
      if (toggle && menu) {
        toggle.addEventListener('click', (e) => {
          e.stopPropagation();
          menu.classList.toggle('show');
        });
        document.addEventListener('click', () => menu.classList.remove('show'));
      }

    } else {
      authArea.innerHTML = `
        <a href="/auth?tab=login"    id="link-login"    data-link>ĐĂNG NHẬP</a>
        <a href="/auth?tab=register" id="link-register" data-link>ĐĂNG KÝ</a>
      `;
    }

    // Update wallet balance hiển thị trong header nếu có #wallet-amount
    const walletAmount = document.getElementById('wallet-amount');
    const walletBtn    = document.getElementById('wallet-btn');
    if (user) {
      if (walletBtn)    walletBtn.style.display = 'flex';
      if (walletAmount) walletAmount.textContent = (user.balance || 0).toLocaleString() + ' đ';
    } else {
      if (walletBtn)    walletBtn.style.display = 'none';
    }

    // Update notification button
    const notifBtn = document.getElementById('notif-btn');
    if (user && notifBtn) {
      notifBtn.style.display = 'flex';
      Auth._updateNotifBadge(user);
    } else if (notifBtn) {
      notifBtn.style.display = 'none';
    }
  },

  // ── Update notification badge ────────────────────────────
  _updateNotifBadge: (user) => {
    if (!user) return;
    try {
      const key    = `mmo_notifs_${user.username || user.user}`;
      const notifs = JSON.parse(localStorage.getItem(key) || '[]');
      const unread = notifs.filter(n => !n.read).length;

      const badge = document.getElementById('notif-badge');
      if (badge) {
        badge.textContent = unread;
        badge.style.display = unread > 0 ? 'flex' : 'none';
      }

      const list = document.getElementById('notif-list');
      if (list) {
        if (notifs.length === 0) {
          list.innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-muted);">Không có thông báo</div>';
        } else {
          list.innerHTML = notifs.slice(0, 10).map(n => `
            <div class="notif-item ${n.read ? 'read' : 'unread'}" data-id="${n.id}">
              <div class="notif-msg">${n.message}</div>
              <div class="notif-time">${new Date(n.date).toLocaleString('vi-VN')}</div>
            </div>
          `).join('');
        }
      }
    } catch (e) {
      console.warn('[Auth._updateNotifBadge] Error:', e);
    }
  },
};

// ── Mark all notifications read ──────────────────────────
window.markAllNotifRead = (e) => {
  if (e) e.stopPropagation();
  const user = Auth.getCurrentUser();
  if (!user) return;
  const key    = `mmo_notifs_${user.username}`;
  const notifs = JSON.parse(localStorage.getItem(key) || '[]');
  notifs.forEach(n => { n.read = true; });
  localStorage.setItem(key, JSON.stringify(notifs));
  Auth._updateNotifBadge(user);
};

window.Auth = Auth;
console.log('✅ Auth (with RateLimiter + PremiumBadge) loaded');
