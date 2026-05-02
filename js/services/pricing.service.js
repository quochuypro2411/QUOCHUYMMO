/**
 * PricingService – QuocHuy MMO
 * ============================================================
 * Toàn bộ logic tính giá TẬP TRUNG tại đây.
 * Không viết logic giá ở bất kỳ component nào khác.
 *
 * Nguyên tắc:
 *  - Frontend KHÔNG tự tính giá cuối
 *  - Mọi thứ phải qua getFinalPrice()
 *  - PremiumActive check cả role + expiry
 * ============================================================
 */

'use strict';

const PricingService = (() => {
  // ─── Config (không hardcode rải rác) ──────────────────────
  const PREMIUM_DISCOUNT_RATE = 0.25;  // 25% off
  const FLASH_SALE_DISCOUNT   = 0.40;  // 40% off (chỉ cho premium flash sale)

  // ─── Kiểm tra premium còn hạn không ──────────────────────
  function isPremiumActive(user) {
    if (!user) return false;
    if (user.role !== 'premium') return false;

    // Không có expiry → vĩnh viễn
    if (!user.premium_expired_at) return true;

    const expiry = new Date(user.premium_expired_at);
    if (isNaN(expiry.getTime())) {
      console.warn('[PricingService] premium_expired_at không hợp lệ:', user.premium_expired_at);
      return false;
    }

    return expiry > new Date();
  }

  // ─── Tính giá cuối cho 1 sản phẩm ────────────────────────
  function getFinalPrice(user, basePrice) {
    if (typeof basePrice !== 'number' || isNaN(basePrice) || basePrice < 0) {
      console.error('[PricingService] basePrice không hợp lệ:', basePrice);
      return 0;
    }

    if (!isPremiumActive(user)) {
      return basePrice;
    }

    return Math.floor(basePrice * (1 - PREMIUM_DISCOUNT_RATE));
  }

  // ─── Tính giá flash sale (chỉ premium) ───────────────────
  function getFlashSalePrice(user, basePrice) {
    if (!isPremiumActive(user)) {
      throw new Error('Flash sale chỉ dành cho thành viên Premium');
    }
    return Math.floor(basePrice * (1 - FLASH_SALE_DISCOUNT));
  }

  // ─── Tính breakdown cho order summary ────────────────────
  function getPriceBreakdown(user, basePrice) {
    const finalPrice     = getFinalPrice(user, basePrice);
    const discountAmount = basePrice - finalPrice;
    const isPrem         = isPremiumActive(user);

    return {
      base_price:      basePrice,
      final_price:     finalPrice,
      discount_amount: discountAmount,
      discount_rate:   isPrem ? PREMIUM_DISCOUNT_RATE : 0,
      is_premium:      isPrem,
    };
  }

  // ─── Tính toàn bộ giỏ hàng ───────────────────────────────
  function calcCartTotals(user, cartItems) {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return { items: [], original_total: 0, final_total: 0, total_saved: 0 };
    }

    let originalTotal = 0;
    let finalTotal    = 0;

    const items = cartItems.map(item => {
      const basePrice  = item.price || 0;
      const breakdown  = getPriceBreakdown(user, basePrice * (item.qty || 1));
      originalTotal   += breakdown.base_price;
      finalTotal      += breakdown.final_price;
      return {
        ...item,
        base_price:   basePrice,
        final_price:  breakdown.final_price / (item.qty || 1),
        breakdown,
      };
    });

    return {
      items,
      original_total: originalTotal,
      final_total:    finalTotal,
      total_saved:    originalTotal - finalTotal,
      is_premium:     isPremiumActive(user),
    };
  }

  // ─── Public API ───────────────────────────────────────────
  return {
    isPremiumActive,
    getFinalPrice,
    getFlashSalePrice,
    getPriceBreakdown,
    calcCartTotals,
    PREMIUM_DISCOUNT_RATE,
    FLASH_SALE_DISCOUNT,
  };
})();

window.PricingService = PricingService;
console.log('✅ PricingService loaded');
