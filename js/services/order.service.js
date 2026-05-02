/**
 * OrderService – QuocHuy MMO
 * ============================================================
 * Xử lý toàn bộ order flow.
 *
 * NGUYÊN TẮC:
 *  - Frontend KHÔNG tự tính giá
 *  - Gọi PricingService.calcCartTotals() cho mọi order
 *  - Lưu final_price (không để frontend modify sau)
 *  - Verify user balance trước khi trừ tiền
 * ============================================================
 */

'use strict';

const OrderService = (() => {
  const ORDERS_KEY = 'mmo_orders';

  // ─── Lấy tất cả orders ───────────────────────────────────
  function getAllOrders() {
    try {
      return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  // ─── Tạo order ID unique ──────────────────────────────────
  function generateOrderId() {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  // ─── Tạo order mới ───────────────────────────────────────
  /**
   * Toàn bộ logic giá tính tại đây, không trust frontend.
   *
   * @param {object} user      – verified user từ RoleGuard
   * @param {Array}  cartItems – [{ id, title, price, qty }]
   * @returns {{ order, totals }}
   */
  function createOrder(user, cartItems) {
    // 1. Guard: user phải đăng nhập
    if (!user) throw new Error('Bạn cần đăng nhập để đặt hàng');

    // 2. Validate cart
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      throw new Error('Giỏ hàng trống');
    }

    // 3. Tính giá qua PricingService (không để frontend tự tính)
    const totals = PricingService.calcCartTotals(user, cartItems);

    if (totals.final_total <= 0) {
      throw new Error('Tổng tiền không hợp lệ');
    }

    // 4. Re-verify balance từ mmo_users (không trust currentUser.balance)
    const users   = JSON.parse(localStorage.getItem('mmo_users') || '[]');
    const userIdx = users.findIndex(u => u.username === user.username);
    if (userIdx === -1) throw new Error('Không tìm thấy tài khoản');

    const freshUser = users[userIdx];
    if ((freshUser.balance || 0) < totals.final_total) {
      throw new Error(`Số dư không đủ. Cần ${totals.final_total.toLocaleString()}đ, hiện có ${(freshUser.balance || 0).toLocaleString()}đ`);
    }

    // 5. Tạo order record
    const orderId = generateOrderId();
    const order   = {
      id:              orderId,
      user_id:         user.username,
      items:           totals.items.map(item => ({
        id:          item.id,
        title:       item.title || item.name,
        qty:         item.qty,
        base_price:  item.base_price,
        final_price: item.final_price,
      })),
      original_price:  totals.original_total,  // Giá trước discount
      final_price:     totals.final_total,      // Giá sau discount (lưu bất biến)
      total_saved:     totals.total_saved,
      is_premium_order: totals.is_premium,
      user_role_at_order: user.role,            // Snapshot role lúc đặt hàng
      status:          'completed',
      created_at:      new Date().toISOString(),
    };

    // 6. Trừ balance
    freshUser.balance = (freshUser.balance || 0) - totals.final_total;
    freshUser.updatedAt = new Date().toISOString();

    // 7. Ghi transaction vào user history
    const txn = {
      id:     orderId,
      date:   new Date().toISOString(),
      desc:   `Mua hàng: ${cartItems.length} sản phẩm${totals.is_premium ? ' (Giá Premium -25%)' : ''}`,
      amount: -totals.final_total,
      type:   'purchase',
      status: 'Thành công',
      meta: {
        original_price: totals.original_total,
        final_price:    totals.final_total,
        saved:          totals.total_saved,
      },
    };

    freshUser.transactions = freshUser.transactions || [];
    freshUser.transactions.unshift(txn);

    // 8. Lưu users
    users[userIdx] = freshUser;
    localStorage.setItem('mmo_users', JSON.stringify(users));

    // 9. Lưu order vào mmo_orders
    const orders = getAllOrders();
    orders.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

    // 10. Sync mmo_currentUser
    localStorage.setItem('mmo_currentUser', JSON.stringify(freshUser));

    // 11. Clear cart
    localStorage.removeItem('mmo_cart');

    console.log(`[OrderService] Order tạo thành công: ${orderId}`, {
      original: totals.original_total,
      final:    totals.final_total,
      saved:    totals.total_saved,
    });

    return { order, totals, updatedUser: freshUser };
  }

  // ─── Lấy orders của user ─────────────────────────────────
  function getOrdersByUser(username) {
    return getAllOrders().filter(o => o.user_id === username);
  }

  // ─── Public API ───────────────────────────────────────────
  return {
    createOrder,
    getAllOrders,
    getOrdersByUser,
  };
})();

window.OrderService = OrderService;
console.log('✅ OrderService loaded');
