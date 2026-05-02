/**
 * LayoutManager – QuocHuy MMO
 * ============================================================
 * Dispatcher chọn và áp dụng layout đúng theo role.
 *
 * NGUYÊN TẮC:
 *  - Không if/else rải rác trong từng component
 *  - Một điểm duy nhất quyết định layout
 *  - Luôn re-verify user trước khi apply
 * ============================================================
 */

'use strict';

const LayoutManager = (() => {
  // ─── Map role → Layout ────────────────────────────────────
  const LAYOUT_MAP = {
    admin:   DefaultLayout,   // Admin dùng default (admin có trang riêng)
    premium: PremiumLayout,
    user:    DefaultLayout,
  };

  let _currentLayout = null;
  let _flashInterval = null;

  // ─── Lấy layout theo role ────────────────────────────────
  function get(role) {
    return LAYOUT_MAP[role] || DefaultLayout;
  }

  // ─── Apply layout cho user hiện tại ─────────────────────
  /**
   * Gọi một lần sau khi DOM ready.
   * RoleGuard.getVerifiedUser() tự handle expiry.
   */
  function apply() {
    const user    = RoleGuard.getVerifiedUser();
    const role    = user?.role || 'guest';
    const layout  = user ? get(role) : DefaultLayout;

    // Không apply lại nếu đã apply đúng layout này rồi
    const currentDataLayout = document.body.getAttribute('data-role-layout');
    if (currentDataLayout === role) return;

    // Đánh dấu layout đã apply
    document.body.setAttribute('data-role-layout', role);
    _currentLayout = layout;

    // Apply layout
    if (layout === PremiumLayout) {
      PremiumLayout.apply(user);
      initFlashSale(user);
      initCountdown();
    } else {
      DefaultLayout.apply();
      stopCountdown();
    }

    // Update product cards với đúng giá
    _updateProductPrices(user);

    console.log(`[LayoutManager] Applied layout: ${layout.id} for role: ${role}`);
  }

  // ─── Update giá sản phẩm theo role ───────────────────────
  function _updateProductPrices(user) {
    // Update tất cả .price-new trên page
    document.querySelectorAll('.product-card').forEach(card => {
      const priceEl   = card.querySelector('.price-new');
      const priceDisc = card.querySelector('.price-disc');
      if (!priceEl) return;

      // Lấy base price từ data attribute (phải được set khi render card)
      const basePrice = parseInt(card.dataset.basePrice);
      if (!basePrice || isNaN(basePrice)) return;

      const finalPrice = PricingService.getFinalPrice(user, basePrice);

      if (user && PricingService.isPremiumActive(user)) {
        priceEl.textContent = finalPrice.toLocaleString('vi-VN') + 'đ';
        priceEl.classList.add('premium-price');

        // Hiện giá gốc bị gạch
        let oldEl = card.querySelector('.price-original-goc');
        if (!oldEl) {
          oldEl = document.createElement('span');
          oldEl.className = 'price-original-goc';
          priceEl.parentNode.insertBefore(oldEl, priceEl.nextSibling);
        }
        oldEl.textContent = basePrice.toLocaleString('vi-VN') + 'đ';

        // Update discount badge
        if (priceDisc) {
          priceDisc.textContent = '-25%';
          priceDisc.classList.add('premium-disc-badge');
        }
      } else {
        // Reset về giá gốc
        priceEl.textContent = basePrice.toLocaleString('vi-VN') + 'đ';
        priceEl.classList.remove('premium-price');

        const oldEl = card.querySelector('.price-original-goc');
        if (oldEl) oldEl.remove();
      }
    });
  }

  // ─── Init Flash Sale (chỉ premium) ───────────────────────
  function initFlashSale(user) {
    if (!user || !PricingService.isPremiumActive(user)) return;

    const container = document.getElementById('flash-sale-grid');
    if (!container) return;

    // Flash sale items (top 4 sản phẩm đắt nhất, giảm thêm 40%)
    const flashItems = _getFlashSaleItems();

    container.innerHTML = flashItems.map(item => {
      const flashPrice = PricingService.getFlashSalePrice(user, item.price);
      return `
        <div class="flash-card" data-base-price="${item.price}">
          <div class="flash-badge">⚡ -40%</div>
          <div class="flash-icon-wrap"><i class="${item.icon}"></i></div>
          <h4 class="flash-name">${item.name}</h4>
          <div class="flash-pricing">
            <span class="flash-price-new">${flashPrice.toLocaleString()}đ</span>
            <span class="flash-price-old">${item.price.toLocaleString()}đ</span>
          </div>
          <button class="flash-buy-btn buy-btn" data-id="${item.id}" data-price="${flashPrice}" data-name="${item.name}">
            <i class="fas fa-bolt"></i> Mua Flash Sale
          </button>
        </div>
      `;
    }).join('');

    // Bind events
    container.querySelectorAll('.flash-buy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const { id, price, name } = btn.dataset;
        _addFlashToCart({ id: `flash-${id}`, name, price: parseInt(price), qty: 1 });
      });
    });
  }

  // ─── Lấy flash sale items ────────────────────────────────
  function _getFlashSaleItems() {
    // Hardcode top flash items (trong real app, fetch từ DB)
    return [
      { id: 'flash-1', name: 'Facebook Siêu VIP', price: 229000, icon: 'fab fa-facebook' },
      { id: 'flash-2', name: 'Gmail Full Verify',  price: 139000, icon: 'fas fa-envelope' },
      { id: 'flash-3', name: 'Proxy IPv6 VN',      price: 89000,  icon: 'fas fa-server' },
      { id: 'flash-4', name: 'TikTok 1K Sub',      price: 149000, icon: 'fab fa-tiktok' },
    ];
  }

  // ─── Thêm flash item vào giỏ ────────────────────────────
  function _addFlashToCart(item) {
    let cart = JSON.parse(localStorage.getItem('mmo_cart') || '[]');
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ ...item, icon: 'fas fa-box', color: '#f59e0b' });
    }
    localStorage.setItem('mmo_cart', JSON.stringify(cart));

    if (window.UI?.showToast) {
      window.UI.showToast('Thành công', `Đã thêm ${item.name} (Flash Sale) vào giỏ!`, 'success');
    }

    // Refresh cart badge
    if (window.refreshCartUI) window.refreshCartUI();
  }

  // ─── Countdown timer cho flash sale ──────────────────────
  function initCountdown() {
    stopCountdown();

    // Flash sale kết thúc vào cuối ngày hôm nay
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 0);

    function tick() {
      const now  = new Date();
      const diff = endOfDay - now;

      if (diff <= 0) {
        stopCountdown();
        return;
      }

      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');

      const hEl = document.getElementById('c-hours');
      const mEl = document.getElementById('c-mins');
      const sEl = document.getElementById('c-secs');

      if (hEl) hEl.textContent = h;
      if (mEl) mEl.textContent = m;
      if (sEl) sEl.textContent = s;
    }

    tick();
    _flashInterval = setInterval(tick, 1000);
  }

  function stopCountdown() {
    if (_flashInterval) {
      clearInterval(_flashInterval);
      _flashInterval = null;
    }
  }

  // ─── Public API ───────────────────────────────────────────
  return {
    get,
    apply,
    initFlashSale,
    stopCountdown,
  };
})();

window.LayoutManager = LayoutManager;
console.log('✅ LayoutManager loaded');
