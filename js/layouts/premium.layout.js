/**
 * PremiumLayout – QuocHuy MMO
 * ============================================================
 * Dark luxury layout cho Premium members.
 * Gold accent, dark background, exclusive features visible.
 *
 * KHÁC BIỆT so với DefaultLayout:
 *  - Dark bg: #0d0d1a
 *  - Gold accent: #f59e0b
 *  - Premium badge hiển thị trong header
 *  - Flash Sale section visible
 *  - Giá hiển thị có "Giá Premium" breakdown
 * ============================================================
 */

'use strict';

const PremiumLayout = {
  id: 'premium',

  // CSS variables cho theme (override style.css defaults)
  cssVars: {
    '--bg-body':      '#0d0d1a',
    '--card-bg':      '#12122a',
    '--border':       '#2a2a5a',
    '--text':         '#e8e8ff',
    '--text-muted':   '#9090c0',
    '--primary':      '#f59e0b',
    '--primary-dark': '#d97706',
    '--accent':       '#f59e0b',
    '--header-bg':    '#070714',
    '--nav-bg':       '#0d0d1a',
    '--premium-gold': '#f59e0b',
    '--premium-glow': 'rgba(245, 158, 11, 0.3)',
  },

  // Apply layout lên document
  apply(user) {
    document.body.setAttribute('data-layout', 'premium');
    document.body.classList.remove('layout-default');
    document.body.classList.add('layout-premium');

    // Hiện premium-only elements
    document.querySelectorAll('[data-premium-only]').forEach(el => {
      el.style.display = '';
    });

    // Ẩn default-only elements
    document.querySelectorAll('[data-default-only]').forEach(el => {
      el.style.display = 'none';
    });

    // Inject Premium Member Badge vào header
    this._injectPremiumBadge(user);

    // Hiện flash sale section
    const flashSale = document.getElementById('premium-flash-sale');
    if (flashSale) flashSale.style.display = '';

    // Inject premium announcement bar
    this._injectPremiumBar(user);
  },

  // Render premium badge trong header auth area
  renderBadge(user) {
    const expiry = user.premium_expired_at
      ? `<span class="prem-badge-expiry">Hết hạn: ${new Date(user.premium_expired_at).toLocaleDateString('vi-VN')}</span>`
      : `<span class="prem-badge-expiry">Vĩnh viễn</span>`;

    return `
      <div class="premium-member-badge" id="premium-member-badge">
        <span class="prem-star">⭐</span>
        <span class="prem-text">PREMIUM</span>
        ${expiry}
      </div>
    `;
  },

  // Inject badge vào header
  _injectPremiumBadge(user) {
    // Remove cũ nếu có
    const old = document.getElementById('premium-member-badge');
    if (old) old.remove();

    const authArea = document.getElementById('auth-area') || document.getElementById('auth-texts');
    if (!authArea || !user) return;

    const badge = document.createElement('div');
    badge.innerHTML = this.renderBadge(user);
    authArea.parentNode.insertBefore(badge.firstElementChild, authArea);
  },

  // Inject premium announcement bar ở top
  _injectPremiumBar(user) {
    const old = document.getElementById('premium-announcement-bar');
    if (old) old.remove();

    const bar = document.createElement('div');
    bar.id = 'premium-announcement-bar';
    bar.className = 'premium-announcement-bar';
    bar.innerHTML = `
      <span>⭐ Chào mừng <strong>${user ? user.username : ''}</strong> – Thành viên Premium!</span>
      <span class="prem-discount-info">💎 Bạn đang được giảm <strong>25%</strong> tất cả sản phẩm</span>
    `;
    document.body.insertBefore(bar, document.body.firstChild);
  },

  // Render flash sale section (chỉ premium)
  renderFlashSaleSection() {
    return `
      <section class="premium-flash-sale" id="premium-flash-sale" data-premium-only>
        <div class="container">
          <div class="flash-sale-header">
            <div class="flash-sale-title-wrap">
              <span class="flash-icon">⚡</span>
              <div>
                <h2 class="flash-title">FLASH SALE ĐỘC QUYỀN PREMIUM</h2>
                <p class="flash-subtitle">Chỉ dành cho thành viên Premium · Giảm thêm 40%</p>
              </div>
            </div>
            <div class="flash-countdown" id="flash-countdown">
              <span class="countdown-label">Kết thúc sau:</span>
              <div class="countdown-timer">
                <span class="c-unit" id="c-hours">00</span>
                <span class="c-sep">:</span>
                <span class="c-unit" id="c-mins">00</span>
                <span class="c-sep">:</span>
                <span class="c-unit" id="c-secs">00</span>
              </div>
            </div>
          </div>
          <div class="flash-grid" id="flash-sale-grid">
            <!-- Injected by LayoutManager.initFlashSale() -->
          </div>
        </div>
      </section>
    `;
  },
};

window.PremiumLayout = PremiumLayout;
console.log('✅ PremiumLayout loaded');
