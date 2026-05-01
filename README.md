# QuocHuy.MMO - Premium System

🚀 **Hệ thống MMO tự động với Premium User và Role-based Access Control**

## 📋 Overview

QuocHuy.MMO là nền tảng thương mại điện tử chuyên nghiệp cho các dịch vụ MMO (Facebook, Gmail, Proxy, VPS, Tool) với hệ thống phân quyền nâng cao và giao diện Premium độc quyền.

## ✨ Features

### 🎯 Core Features
- **🛒 E-commerce Platform**: Mua bán tài khoản MMO tự động 100%
- **👥 User Management**: Hệ thống tài khoản với role-based access control
- **💳 Payment Integration**: Hỗ trợ nhiều phương thức thanh toán
- **📊 Admin Dashboard**: Quản lý toàn bộ hệ thống
- **🔒 Security**: Bảo mật đa lớp với authentication middleware

### ⭐ Premium System
- **🎨 Premium UI**: Giao diện độc quyền với gradient và animations
- **💎 25% Discount**: Giảm giá trên tất cả sản phẩm cho Premium User
- **🚀 Priority Support**: Hỗ trợ 24/7 với ưu tiên cao nhất
- **🛍️ Bulk Purchase**: Mua hàng số lượng không giới hạn
- **📈 Advanced Analytics**: Báo cáo chi tiết và thống kê
- **🏆 Premium Badge**: Hiển thị trạng thái Premium trên toàn hệ thống

### 🛡️ Role-based Access Control
- **👤 User**: Truy cập cơ bản, mua hàng thông thường
- **⭐ Premium**: Tất cả quyền User + 25% discount + UI Premium
- **👑 Admin**: Toàn quyền quản lý hệ thống và user

## 🏗️ Architecture

### Frontend Stack
- **HTML5** & **CSS3** với responsive design
- **Vanilla JavaScript** (ES6+) với modular architecture
- **Font Awesome 6** cho icons
- **Google Fonts** (Be Vietnam Pro)

### Backend System
- **Firebase** (Authentication, Firestore)
- **LocalStorage** cho client-side data persistence
- **RESTful API** design patterns

### Security Features
- **Role-based Middleware** cho authentication
- **Input Validation** và sanitization
- **XSS Protection** và CSRF prevention
- **Secure Password Hashing** (SHA-256)

## 📁 Project Structure

```
quochuy-mmo/
├── css/
│   ├── style.css              # Main styling
│   ├── premium.css            # Premium UI theme
│   ├── checkout.css           # Checkout page styles
│   └── history.css            # History page styles
├── js/
│   ├── auth.js               # Authentication & user management
│   ├── role-middleware.js    # Role-based access control
│   ├── premium-pricing.js     # Pricing logic with discounts
│   ├── ui-switcher.js        # Dynamic UI switching
│   ├── common.js             # Shared utilities
│   ├── script.js             # Main application logic
│   ├── sync.js               # Data synchronization
│   ├── views.js              # View components
│   └── firebase-config.js     # Firebase configuration
├── assets/                  # Static assets (images, icons)
├── admin.html               # Admin dashboard
├── premium-upgrade.html      # Premium upgrade page
├── test-premium-system.html # Testing interface
└── index.html               # Main homepage
```

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase project (optional, for cloud sync)
- Web server (for development)

### Installation

1. **Clone repository**
   ```bash
   git clone https://github.com/yourusername/quochuy-mmo.git
   cd quochuy-mmo
   ```

2. **Setup Firebase (Optional)**
   - Tạo project trên [Firebase Console](https://console.firebase.google.com/)
   - Copy configuration vào `js/firebase-config.js`
   - Enable Authentication và Firestore

3. **Run locally**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

4. **Access application**
   - Mở browser: `http://localhost:8000`
   - Admin: `http://localhost:8000/admin.html`

## 👥 User Roles & Permissions

### User (Default)
- ✅ Browse products
- ✅ Add to cart
- ✅ Checkout
- ✅ View order history
- ❌ No discount
- ❌ Standard UI

### Premium
- ✅ All User permissions
- ✅ **25% discount** on all products
- ✅ Premium UI theme
- ✅ Priority support
- ✅ Bulk purchase
- ✅ Advanced analytics

### Admin
- ✅ All Premium permissions
- ✅ User management
- ✅ Role assignment
- ✅ Order management
- ✅ Financial reports
- ✅ System settings

## 💎 Premium System Details

### Pricing Logic
```javascript
// Premium users get 25% discount
const finalPrice = originalPrice * 0.75;

// Example:
// Original: 100.000đ
// Premium Price: 75.000đ (25% off)
```

### UI Switching
```javascript
// Automatic UI switching based on user role
if (user.role === 'premium') {
  loadPremiumUI();  // Loads premium.css
} else {
  loadDefaultUI(); // Uses default theme
}
```

### Role Management
```javascript
// Upgrade user to Premium
Auth.upgradeToPremium(userId);

// Remove Premium status
Auth.removePremium(userId);

// Check if user is Premium
Auth.isPremium(user); // returns true/false
```

## 🔧 Configuration

### Firebase Setup
```javascript
// js/firebase-config.js
const MMO_FIREBASE_CONFIG = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... other config
};
```

### Premium Pricing
```javascript
// Customize discount rate
const PREMIUM_DISCOUNT = 0.25; // 25%

// Premium subscription price
const PREMIUM_MONTHLY_PRICE = 499000; // VND
```

## 🧪 Testing

### Test Interface
Access `test-premium-system.html` để test:
- User role creation
- Premium pricing calculations
- UI switching functionality
- Role-based access control
- Admin panel features

### Test Cases
1. **User Registration**: Tạo tài khoản với role mặc định
2. **Premium Upgrade**: Nâng cấp user lên Premium
3. **Pricing Validation**: Kiểm tra discount 25%
4. **UI Switching**: Test chuyển đổi giao diện
5. **Admin Functions**: Test quản lý user và roles

## 📱 Responsive Design

- **Desktop**: 1200px+ (Full experience)
- **Tablet**: 768px-1199px (Adapted layout)
- **Mobile**: <768px (Optimized interface)
- **Premium UI**: Responsive trên tất cả devices

## 🔒 Security Features

### Authentication
- SHA-256 password hashing
- Session management
- Role-based access control
- Input validation

### Data Protection
- XSS prevention
- CSRF protection
- Secure data storage
- Privacy compliance

## 🚀 Deployment

### GitHub Pages
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select source: `main` branch
4. Access: `https://username.github.io/quochuy-mmo`

### Custom Domain
```html
<!-- Add to index.html -->
<meta name="base" href="https://yourdomain.com/">
```

### Environment Variables
```bash
# Production
NODE_ENV=production
FIREBASE_CONFIG=production

# Development
NODE_ENV=development
FIREBASE_CONFIG=development
```

## 📊 Performance

### Optimization
- **Lazy Loading**: Components và images
- **Code Splitting**: JavaScript modules
- **Caching**: Static assets optimization
- **Minification**: CSS/JS compression

### Metrics
- **Page Load**: <2 seconds
- **Time to Interactive**: <3 seconds
- **Mobile Score**: 90+ (Lighthouse)
- **SEO Score**: 95+ (Lighthouse)

## 🤝 Contributing

### Development Workflow
1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Submit Pull Request

### Code Standards
- **ES6+** JavaScript
- **BEM** CSS methodology
- **Semantic HTML5**
- **Responsive Design**
- **Cross-browser Compatibility**

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **User Guide**: [Premium Features Guide](docs/premium-guide.md)
- **Admin Manual**: [Admin Documentation](docs/admin-manual.md)
- **API Reference**: [API Documentation](docs/api-reference.md)

### Contact
- **Email**: contact@quochuy.mmo
- **Phone**: 033.655.6137
- **Telegram**: @nqh2411
- **GitHub Issues**: [Report Issues](https://github.com/yourusername/quochuy-mmo/issues)

## 🗺️ Roadmap

### Version 2.0 (Q2 2026)
- [ ] Mobile App (React Native)
- [ ] Advanced Analytics Dashboard
- [ ] Multi-language Support
- [ ] API Rate Limiting
- [ ] Subscription Management

### Version 2.1 (Q3 2026)
- [ ] AI-powered Recommendations
- [ ] Advanced Search Filters
- [ ] Real-time Notifications
- [ ] Performance Monitoring
- [ ] A/B Testing Framework

## 📈 Analytics & Monitoring

### User Metrics
- User registration rate
- Premium conversion rate
- Average order value
- Customer lifetime value

### System Performance
- Page load times
- Error rates
- API response times
- Database performance

---

**⭐ Made with ❤️ in Vietnam by QuocHuy Team**

*Last updated: May 2026*
