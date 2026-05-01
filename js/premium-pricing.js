/* ===== PREMIUM PRICING SYSTEM ===== */
const PremiumPricing = {
    // Calculate final price with premium discount
    calculatePrice: (originalPrice, user = null) => {
        if (!user) {
            user = Auth.getCurrentUser();
        }
        
        if (Auth.isPremium(user)) {
            return {
                originalPrice: originalPrice,
                finalPrice: originalPrice * 0.75, // 25% discount
                discount: 25,
                discountAmount: originalPrice * 0.25,
                isPremium: true
            };
        }
        
        return {
            originalPrice: originalPrice,
            finalPrice: originalPrice,
            discount: 0,
            discountAmount: 0,
            isPremium: false
        };
    },

    // Format price display with premium styling
    formatPriceDisplay: (priceInfo, element) => {
        const { originalPrice, finalPrice, discount, discountAmount, isPremium } = priceInfo;
        
        if (isPremium && discount > 0) {
            element.innerHTML = `
                <div class="price-group premium-price">
                    <span class="price-new">${this.formatCurrency(finalPrice)}</span>
                    <span class="price-old">${this.formatCurrency(originalPrice)}</span>
                    <span class="price-disc premium-badge">-${discount}%</span>
                </div>
            `;
        } else {
            element.innerHTML = `
                <div class="price-group">
                    <span class="price-new">${this.formatCurrency(finalPrice)}</span>
                </div>
            `;
        }
    },

    // Format currency
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    },

    // Apply premium pricing to all product cards
    applyToAllProducts: () => {
        const user = Auth.getCurrentUser();
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const priceElement = card.querySelector('.card-pricing');
            if (priceElement) {
                const priceText = priceElement.querySelector('.price-new')?.textContent;
                if (priceText) {
                    const originalPrice = this.parsePrice(priceText);
                    const priceInfo = this.calculatePrice(originalPrice, user);
                    this.formatPriceDisplay(priceInfo, priceElement);
                }
            }
        });
    },

    // Parse price from text
    parsePrice: (priceText) => {
        // Remove currency symbols and dots, then convert to number
        const cleanPrice = priceText.replace(/[^\d]/g, '');
        return parseInt(cleanPrice) || 0;
    },

    // Calculate cart total with premium discount
    calculateCartTotal: (cartItems, user = null) => {
        let originalTotal = 0;
        let finalTotal = 0;
        
        cartItems.forEach(item => {
            const priceInfo = this.calculatePrice(item.price, user);
            originalTotal += item.price * item.quantity;
            finalTotal += priceInfo.finalPrice * item.quantity;
        });
        
        return {
            originalTotal,
            finalTotal,
            totalDiscount: originalTotal - finalTotal,
            discountPercentage: originalTotal > 0 ? Math.round((originalTotal - finalTotal) / originalTotal * 100) : 0,
            isPremium: Auth.isPremium(user)
        };
    },

    // Update cart display with premium pricing
    updateCartDisplay: () => {
        const user = Auth.getCurrentUser();
        const cart = JSON.parse(localStorage.getItem('mmo_cart') || '[]');
        
        if (cart.length === 0) {
            document.getElementById('cart-amount').textContent = '0 đ';
            document.getElementById('cart-badge').textContent = '0';
            return;
        }
        
        const cartTotal = this.calculateCartTotal(cart, user);
        
        // Update cart amount
        document.getElementById('cart-amount').textContent = this.formatCurrency(cartTotal.finalTotal);
        document.getElementById('cart-badge').textContent = cart.length;
        
        // Add premium badge to cart if user is premium
        const cartBtn = document.getElementById('cart-btn');
        if (cartTotal.isPremium && !cartBtn.querySelector('.premium-indicator')) {
            const premiumIndicator = document.createElement('span');
            premiumIndicator.className = 'premium-indicator';
            premiumIndicator.innerHTML = '⭐';
            premiumIndicator.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                background: linear-gradient(135deg, #8B5CF6, #EC4899);
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
            `;
            cartBtn.appendChild(premiumIndicator);
        }
    },

    // Show premium pricing comparison
    showPricingComparison: (originalPrice) => {
        const user = Auth.getCurrentUser();
        const premiumPrice = this.calculatePrice(originalPrice, user);
        
        if (!premiumPrice.isPremium) {
            return `
                <div class="pricing-comparison">
                    <div class="regular-price">
                        <span class="price-label">Giá thường:</span>
                        <span class="price-value">${this.formatCurrency(originalPrice)}</span>
                    </div>
                    <div class="premium-preview">
                        <span class="price-label">Premium:</span>
                        <span class="price-value">${this.formatCurrency(originalPrice * 0.75)}</span>
                        <span class="discount-badge">-25%</span>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="pricing-comparison premium-active">
                <div class="premium-price-display">
                    <span class="price-label">Giá Premium:</span>
                    <span class="price-value">${this.formatCurrency(premiumPrice.finalPrice)}</span>
                    <span class="saved-amount">Tiết kiệm ${this.formatCurrency(premiumPrice.discountAmount)}</span>
                </div>
            </div>
        `;
    },

    // Initialize premium pricing system
    init: () => {
        // Apply premium pricing when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.applyToAllProducts();
                this.updateCartDisplay();
            });
        } else {
            this.applyToAllProducts();
            this.updateCartDisplay();
        }
        
        // Listen for user login/logout events
        document.addEventListener('userLoggedIn', () => {
            this.applyToAllProducts();
            this.updateCartDisplay();
        });
        
        document.addEventListener('userLoggedOut', () => {
            this.applyToAllProducts();
            this.updateCartDisplay();
        });
    }
};

// Auto-initialize
PremiumPricing.init();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PremiumPricing;
}
