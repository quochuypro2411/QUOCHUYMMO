/* ===== UI SWITCHING LOGIC BASED ON USER ROLE ===== */
const UISwitcher = {
    // Initialize UI based on current user
    init: () => {
        const user = Auth.getCurrentUser();
        
        if (user) {
            UISwitcher.applyUserUI(user);
            // Listen for user changes
            document.addEventListener('userLoggedIn', (e) => {
                UISwitcher.applyUserUI(e.detail.user);
            });
            
            document.addEventListener('userLoggedOut', () => {
                UISwitcher.resetToDefaultUI();
            });
        } else {
            UISwitcher.resetToDefaultUI();
        }
    },

    // Apply UI based on user role
    applyUserUI: (user) => {
        if (Auth.isPremium(user)) {
            UISwitcher.loadPremiumUI();
        } else {
            UISwitcher.loadDefaultUI();
        }
        
        // Add admin-specific UI if needed
        if (user.role === 'admin') {
            UISwitcher.loadAdminUI();
        }
        
        // Update user info display
        UISwitcher.updateUserDisplay(user);
        
        // Apply premium pricing
        PremiumPricing.applyToAllProducts();
        PremiumPricing.updateCartDisplay();
    },

    // Load Premium UI
    loadPremiumUI: () => {
        // Add premium CSS
        UISwitcher.loadPremiumCSS();
        
        // Add premium class to body
        document.body.classList.add('premium-user');
        document.body.classList.remove('default-user');
        
        // Add premium badge to header
        UISwitcher.addPremiumBadge();
        
        // Add premium features to navigation
        UISwitcher.addPremiumNavItems();
        
        // Update product cards with premium styling
        UISwitcher.updateProductCards();
        
        // Show premium notifications
        UISwitcher.showPremiumWelcome();
    },

    // Load Default UI
    loadDefaultUI: () => {
        // Remove premium CSS
        UISwitcher.unloadPremiumCSS();
        
        // Remove premium class from body
        document.body.classList.remove('premium-user');
        document.body.classList.add('default-user');
        
        // Remove premium badge
        UISwitcher.removePremiumBadge();
        
        // Remove premium navigation items
        UISwitcher.removePremiumNavItems();
        
        // Reset product cards
        UISwitcher.resetProductCards();
    },

    // Load Admin UI
    loadAdminUI: () => {
        // Add admin class to body
        document.body.classList.add('admin-user');
        
        // Add admin link to navigation
        UISwitcher.addAdminNavItem();
        
        // Add admin controls
        UISwitcher.addAdminControls();
    },

    // Reset to Default UI (when logged out)
    resetToDefaultUI: () => {
        document.body.classList.remove('premium-user', 'admin-user');
        document.body.classList.add('default-user');
        
        UISwitcher.unloadPremiumCSS();
        UISwitcher.removePremiumBadge();
        UISwitcher.removePremiumNavItems();
        UISwitcher.removeAdminNavItem();
        UISwitcher.resetProductCards();
    },

    // Load Premium CSS
    loadPremiumCSS: () => {
        if (!document.getElementById('premium-css')) {
            const link = document.createElement('link');
            link.id = 'premium-css';
            link.rel = 'stylesheet';
            link.href = 'css/premium.css';
            document.head.appendChild(link);
        }
    },

    // Unload Premium CSS
    unloadPremiumCSS: () => {
        const premiumCSS = document.getElementById('premium-css');
        if (premiumCSS) {
            premiumCSS.remove();
        }
    },

    // Add Premium Badge to Header
    addPremiumBadge: () => {
        if (document.getElementById('premium-badge')) return;
        
        const authBtn = document.getElementById('auth-btn');
        if (authBtn) {
            const badge = document.createElement('div');
            badge.id = 'premium-badge';
            badge.className = 'premium-badge';
            badge.innerHTML = '⭐ Premium';
            badge.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                background: linear-gradient(135deg, #8B5CF6, #EC4899);
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
                z-index: 1000;
                animation: premiumGlow 2s ease-in-out infinite;
            `;
            authBtn.style.position = 'relative';
            authBtn.appendChild(badge);
        }
    },

    // Remove Premium Badge
    removePremiumBadge: () => {
        const badge = document.getElementById('premium-badge');
        if (badge) {
            badge.remove();
        }
    },

    // Add Premium Navigation Items
    addPremiumNavItems: () => {
        const navList = document.getElementById('nav-list');
        if (!navList || document.getElementById('nav-premium')) return;
        
        const premiumItems = [
            {
                id: 'nav-premium',
                icon: 'fas fa-gem',
                text: 'Premium',
                href: '#premium'
            },
            {
                id: 'nav-exclusive',
                icon: 'fas fa-crown',
                text: 'Độc quyền',
                href: '#exclusive'
            }
        ];
        
        premiumItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'nav-item premium-nav-item';
            li.innerHTML = `
                <a href="${item.href}">
                    <span class="nav-icon"><i class="${item.icon}"></i></span>
                    <span class="nav-text">${item.text}</span>
                </a>
            `;
            navList.appendChild(li);
        });
    },

    // Remove Premium Navigation Items
    removePremiumNavItems: () => {
        const premiumItems = document.querySelectorAll('.premium-nav-item');
        premiumItems.forEach(item => item.remove());
    },

    // Add Admin Navigation Item
    addAdminNavItem: () => {
        const navList = document.getElementById('nav-list');
        if (!navList || document.getElementById('nav-admin')) return;
        
        const li = document.createElement('li');
        li.className = 'nav-item admin-nav-item';
        li.innerHTML = `
            <a href="admin.html">
                <span class="nav-icon"><i class="fas fa-cog"></i></span>
                <span class="nav-text">Admin</span>
            </a>
        `;
        navList.appendChild(li);
    },

    // Remove Admin Navigation Item
    removeAdminNavItem: () => {
        const adminItem = document.getElementById('nav-admin');
        if (adminItem) {
            adminItem.parentElement.remove();
        }
    },

    // Add Admin Controls
    addAdminControls: () => {
        // Add admin controls to relevant pages
        if (window.location.pathname.includes('facebook.html') || 
            window.location.pathname.includes('gmail.html')) {
            UISwitcher.addProductAdminControls();
        }
    },

    // Add Product Admin Controls
    addProductAdminControls: () => {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            if (card.querySelector('.admin-controls')) return;
            
            const controls = document.createElement('div');
            controls.className = 'admin-controls';
            controls.innerHTML = `
                <button class="admin-btn" onclick="editProduct('${card.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="admin-btn" onclick="deleteProduct('${card.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            controls.style.cssText = `
                position: absolute;
                top: 10px;
                left: 10px;
                display: flex;
                gap: 5px;
                z-index: 100;
            `;
            card.appendChild(controls);
        });
    },

    // Update Product Cards for Premium
    updateProductCards: () => {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            // Add premium badge if not already present
            if (!card.querySelector('.premium-indicator')) {
                const indicator = document.createElement('div');
                indicator.className = 'premium-indicator';
                indicator.innerHTML = '⭐';
                indicator.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: linear-gradient(135deg, #8B5CF6, #EC4899);
                    color: white;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    box-shadow: 0 0 15px rgba(139, 92, 246, 0.5);
                    animation: premiumGlow 2s ease-in-out infinite;
                `;
                card.appendChild(indicator);
            }
        });
    },

    // Reset Product Cards
    resetProductCards: () => {
        const indicators = document.querySelectorAll('.premium-indicator');
        indicators.forEach(indicator => indicator.remove());
    },

    // Update User Display
    updateUserDisplay: (user) => {
        const authTexts = document.getElementById('auth-texts');
        if (authTexts) {
            authTexts.innerHTML = `
                <div class="user-info">
                    <div class="user-name">${user.user || user.email}</div>
                    <div class="user-role">${user.role}</div>
                </div>
                <a href="#" onclick="Auth.logout(); return false;" class="logout-btn">Đăng xuất</a>
            `;
        }
    },

    // Show Premium Welcome Message
    showPremiumWelcome: () => {
        // Show welcome message only once per session
        if (sessionStorage.getItem('premium-welcome-shown')) return;
        
        const welcome = document.createElement('div');
        welcome.className = 'premium-welcome';
        welcome.innerHTML = `
            <div class="welcome-content">
                <h3>🎉 Chào mừng Premium User!</h3>
                <p>Bạn đang được giảm giá 25% tất cả sản phẩm</p>
                <button onclick="this.parentElement.parentElement.remove()">Tiếp tục</button>
            </div>
        `;
        welcome.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #8B5CF6, #EC4899);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            animation: slideInRight 0.5s ease-out;
        `;
        
        document.body.appendChild(welcome);
        sessionStorage.setItem('premium-welcome-shown', 'true');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (welcome.parentElement) {
                welcome.remove();
            }
        }, 5000);
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', UISwitcher.init);
} else {
    UISwitcher.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UISwitcher;
}
