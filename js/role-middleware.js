/* ===== ROLE-BASED AUTHENTICATION MIDDLEWARE ===== */
const RoleMiddleware = {
    // Check if user has premium access
    checkPremium: (req, res, next) => {
        const user = Auth.getCurrentUser();
        if (!user) {
            return res.status(401).json({ 
                message: "Vui lòng đăng nhập để tiếp tục" 
            });
        }
        
        if (!Auth.isPremium(user)) {
            return res.status(403).json({ 
                message: "Tính năng này chỉ dành cho Premium User",
                upgradeUrl: "/premium-upgrade"
            });
        }
        
        req.user = user;
        next();
    },

    // Check if user has admin access
    checkAdmin: (req, res, next) => {
        const user = Auth.getCurrentUser();
        if (!user) {
            return res.status(401).json({ 
                message: "Vui lòng đăng nhập để tiếp tục" 
            });
        }
        
        if (user.role !== 'admin') {
            return res.status(403).json({ 
                message: "Tính năng này chỉ dành cho Admin" 
            });
        }
        
        req.user = user;
        next();
    },

    // Check if user can access specific feature
    checkFeature: (feature) => (req, res, next) => {
        const user = Auth.getCurrentUser();
        if (!user) {
            return res.status(401).json({ 
                message: "Vui lòng đăng nhập để tiếp tục" 
            });
        }

        // Premium features
        const premiumFeatures = [
            'bulk-purchase',
            'priority-support',
            'exclusive-products',
            'advanced-analytics',
            'custom-orders'
        ];

        // Admin features
        const adminFeatures = [
            'user-management',
            'system-settings',
            'financial-reports',
            'product-management',
            'order-approval'
        ];

        if (premiumFeatures.includes(feature) && !Auth.isPremium(user)) {
            return res.status(403).json({ 
                message: `Tính năng ${feature} chỉ dành cho Premium User`,
                upgradeUrl: "/premium-upgrade"
            });
        }

        if (adminFeatures.includes(feature) && user.role !== 'admin') {
            return res.status(403).json({ 
                message: `Tính năng ${feature} chỉ dành cho Admin` 
            });
        }

        req.user = user;
        next();
    },

    // Middleware for API calls
    apiMiddleware: {
        premium: (callback) => {
            return (data) => {
                const user = Auth.getCurrentUser();
                if (!Auth.isPremium(user)) {
                    return { 
                        error: "Premium access required",
                        upgradeUrl: "/premium-upgrade"
                    };
                }
                return callback(data);
            };
        },

        admin: (callback) => {
            return (data) => {
                const user = Auth.getCurrentUser();
                if (user.role !== 'admin') {
                    return { 
                        error: "Admin access required" 
                    };
                }
                return callback(data);
            };
        }
    },

    // Client-side route protection
    protectRoute: (requiredRole) => {
        const user = Auth.getCurrentUser();
        
        if (!user) {
            window.location.href = '/auth.html?tab=login&redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }

        if (requiredRole === 'premium' && !Auth.isPremium(user)) {
            this.showPremiumUpgradeModal();
            return false;
        }

        if (requiredRole === 'admin' && user.role !== 'admin') {
            this.showAccessDeniedModal();
            return false;
        }

        return true;
    },

    // Show premium upgrade modal
    showPremiumUpgradeModal: () => {
        const modal = document.createElement('div');
        modal.className = 'premium-upgrade-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⭐ Nâng cấp Premium</h3>
                    <button class="modal-close" onclick="this.closest('.premium-upgrade-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="premium-features">
                        <h4>Quyền lợi Premium:</h4>
                        <ul>
                            <li>🎁 Giảm giá 25% tất cả sản phẩm</li>
                            <li>⚡ Ưu tiên hỗ trợ 24/7</li>
                            <li>🛒 Mua hàng số lượng lớn</li>
                            <li>📊 Xem báo cáo chi tiết</li>
                            <li>🎨 Giao diện Premium độc quyền</li>
                        </ul>
                    </div>
                    <div class="premium-price">
                        <p class="price-label">Giá nâng cấp:</p>
                        <p class="price-amount">499.000đ/tháng</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="this.closest('.premium-upgrade-modal').remove()">
                        Để sau
                    </button>
                    <button class="btn btn-premium" onclick="window.location.href='/premium-upgrade.html'">
                        Nâng cấp ngay
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    // Show access denied modal
    showAccessDeniedModal: () => {
        const modal = document.createElement('div');
        modal.className = 'access-denied-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🚫 Truy cập bị từ chối</h3>
                    <button class="modal-close" onclick="this.closest('.access-denied-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <p>Bạn không có quyền truy cập vào trang này.</p>
                    <p>Vui lòng liên hệ Admin nếu cần hỗ trợ.</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.access-denied-modal').remove()">
                        Đóng
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoleMiddleware;
}
