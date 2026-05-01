const Views = {
    Home: () => {
        let homeHtml = `
<main class="main-content" id="main-content">
  <!-- HERO SLIDER -->
  <section class="hero-slider" id="hero-slider">
    <div id="slider-track">
      <div class="slide active" data-index="0">
        <div class="slide-bg" style="background:linear-gradient(135deg,#0c1445 0%,#1a237e 35%,#1565c0 70%,#0d47a1 100%)"></div>
        <div class="slide-inner">
          <div class="slide-text">
            <span class="slide-tag"><i class="fas fa-bolt"></i>HOT DEAL</span>
            <h2 class="slide-title">Via Facebook Việt Cổ<br><span class="grad-blue">Giảm 30% Toàn Bộ</span></h2>
            <p class="slide-desc">Tài khoản Facebook Việt cổ, ngâm IP sạch, 2FA đầy đủ. Thích hợp chạy Ads, Seeding, kinh doanh online. Bảo hành 1 đổi 1.</p>
            <div class="slide-btns">
              <a href="/facebook" class="slide-btn btn-primary" data-link><i class="fas fa-shopping-cart"></i>Mua ngay</a>
            </div>
          </div>
          <div class="slide-visual">
            <img src="prod_fb.png" alt="Facebook" style="max-width: 400px; height: auto; animation: float 6s ease-in-out infinite;">
          </div>
        </div>
      </div>
      <div class="slide" data-index="1">
        <div class="slide-bg" style="background:linear-gradient(135deg,#1b5e20 0%,#2e7d32 35%,#388e3c 70%,#1b5e20 100%)"></div>
        <div class="slide-inner">
          <div class="slide-text">
            <span class="slide-tag tag-green"><i class="fas fa-star"></i>BEST SELLER</span>
            <h2 class="slide-title">Gmail Việt Cổ VIP<br><span class="grad-green">Ngâm IP – Full Info</span></h2>
            <p class="slide-desc">Gmail Việt cổ đã qua quy trình ngâm IP chuyên nghiệp. Phù hợp chạy Ads Google, đăng ký dịch vụ.</p>
            <div class="slide-btns">
              <a href="/gmail" class="slide-btn btn-green" data-link><i class="fas fa-shopping-cart"></i>Mua ngay</a>
            </div>
          </div>
          <div class="slide-visual">
            <img src="prod_gm.png" alt="Gmail VIP" style="max-width: 400px; height: auto; animation: float 6s ease-in-out infinite;">
          </div>
        </div>
      </div>
    </div>
    <button class="slider-arrow" id="slider-prev"><i class="fas fa-chevron-left"></i></button>
    <button class="slider-arrow" id="slider-next"><i class="fas fa-chevron-right"></i></button>
    <div class="slider-dots" id="slider-dots">
      <button class="dot active" data-index="0"></button>
      <button class="dot" data-index="1"></button>
    </div>
  </section>

  <!-- TRUST BAR -->
  <section class="trust-bar">
    <div class="container">
      <div class="trust-grid">
        <div class="trust-item"><div class="trust-ico"><i class="fas fa-shipping-fast"></i></div><div class="trust-copy"><strong>Giao hàng tự động</strong><span>Nhận tài khoản ngay</span></div></div>
        <div class="trust-item"><div class="trust-ico"><i class="fas fa-shield-alt"></i></div><div class="trust-copy"><strong>Bảo hành 1 đổi 1</strong><span>Cam kết đổi trả trong 24h</span></div></div>
        <div class="trust-item"><div class="trust-ico"><i class="fas fa-headset"></i></div><div class="trust-copy"><strong>Hỗ trợ 24/7</strong><span>Tư vấn chuyên nghiệp</span></div></div>
        <div class="trust-item"><div class="trust-ico"><i class="fas fa-medal"></i></div><div class="trust-copy"><strong>Uy tín #1</strong><span>Hơn 50.000 khách hàng</span></div></div>
      </div>
    </div>
  </section>

  <div class="container">
`;
        
        // Render top 4 products of first 2 categories
        CATEGORIES.slice(0, 2).forEach(cat => {
            let cardsHtml = cat.products.slice(0, 4).map(p => window.UI.renderProductCard(p, cat.icon, cat.color)).join('');
            homeHtml += `
    <section class="product-section anim-up">
      <div class="section-header">
        <div class="section-title-wrap">
          <span class="section-icon" style="background:${cat.color}"><i class="${cat.icon}"></i></span>
          <h2 class="section-title">BÁN CHẠY – ${cat.title}</h2>
        </div>
        <div class="section-right">
          <a href="/${cat.id}" class="view-all" data-link>Xem tất cả <i class="fas fa-arrow-right"></i></a>
        </div>
      </div>
      <div class="product-slider-wrap">
        <div class="page-grid">
            ${cardsHtml}
        </div>
      </div>
    </section>
            `;
        });

        homeHtml += `
  </div>
</main>`;
        return homeHtml;
    },

    initHomeScripts: () => {
        // Basic slider logic
        const track = document.getElementById('slider-track');
        if(!track) return;
        let index = 0;
        const slides = track.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        
        const goToSlide = (i) => {
            slides[index].classList.remove('active');
            if(dots[index]) dots[index].classList.remove('active');
            index = (i + slides.length) % slides.length;
            slides[index].classList.add('active');
            if(dots[index]) dots[index].classList.add('active');
        };

        document.getElementById('slider-next')?.addEventListener('click', () => goToSlide(index + 1));
        document.getElementById('slider-prev')?.addEventListener('click', () => goToSlide(index - 1));
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => goToSlide(parseInt(e.target.dataset.index)));
        });

        // Auto slide
        setInterval(() => {
            if(document.getElementById('slider-track')) goToSlide(index + 1);
        }, 5000);
    },

    Category: (cat) => {
        let cardsHtml = cat.products.map(p => window.UI.renderProductCard(p, cat.icon, cat.color)).join('');
        return `
<main class="main-content" style="min-height:70vh">
  <div class="container">
    <section class="product-section anim-up">
      <div class="section-header">
        <div class="section-title-wrap">
          <span class="section-icon" style="background:${cat.color}"><i class="${cat.icon}"></i></span>
          <h2 class="section-title">${cat.title}</h2>
        </div>
      </div>
      <div class="page-grid">
        ${cardsHtml}
      </div>
    </section>
  </div>
</main>
        `;
    },

    Auth: () => {
        const hashParams = window.location.hash.split('?')[1] || '';
        const urlParams = new URLSearchParams(hashParams);
        const tab = urlParams.get('tab') || 'login';
        const isLogin = tab === 'login';
        const isRegister = tab === 'register';
        const isForgot = tab === 'forgot';
        
        return `
<main class="main-content" style="min-height:70vh; display:flex; align-items:center; justify-content:center; padding: 40px 0;">
  <div class="auth-box" style="background:var(--card-bg); border:1px solid var(--border); border-radius:16px; padding:40px; width:100%; max-width:460px; box-shadow:0 10px 30px rgba(0,0,0,0.1);">
    <h2 style="text-align:center; font-size:24px; margin-bottom:10px; color:var(--text)">${isLogin ? 'Đăng Nhập' : isRegister ? 'Đăng Ký' : 'Quên Mật Khẩu'}</h2>
    <p style="text-align:center; color:var(--text-muted); margin-bottom:30px; line-height:1.7;">
      ${isLogin ? 'Chào mừng bạn trở lại với QuocHuy MMO' : isRegister ? 'Tạo tài khoản để trải nghiệm dịch vụ' : 'Nhập email đã đăng ký để đặt lại mật khẩu'}
    </p>
    
    <form id="auth-form" onsubmit="return false;">
      ${!isForgot ? `
      <div style="margin-bottom:20px;">
        <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--text);">Tên đăng nhập</label>
        <input type="text" id="auth-username" required minlength="4" style="width:100%; padding:12px 15px; border-radius:8px; border:1px solid var(--border); background:rgba(0,0,0,0.03); color:var(--text); font-size:15px; outline:none;">
      </div>
      ` : ''}
      
      ${isRegister || isForgot ? `
      <div style="margin-bottom:20px;">
        <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--text);">Email</label>
        <input type="email" id="auth-email" required style="width:100%; padding:12px 15px; border-radius:8px; border:1px solid var(--border); background:rgba(0,0,0,0.03); color:var(--text); font-size:15px; outline:none;">
      </div>
      ` : ''}

      ${!isForgot ? `
      <div style="margin-bottom:30px;">
        <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--text);">Mật khẩu</label>
        <input type="password" id="auth-password" required minlength="6" style="width:100%; padding:12px 15px; border-radius:8px; border:1px solid var(--border); background:rgba(0,0,0,0.03); color:var(--text); font-size:15px; outline:none;">
      </div>
      ` : `
      <div style="margin-bottom:20px;">
        <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--text);">Mật khẩu mới</label>
        <input type="password" id="auth-password" required minlength="6" style="width:100%; padding:12px 15px; border-radius:8px; border:1px solid var(--border); background:rgba(0,0,0,0.03); color:var(--text); font-size:15px; outline:none;">
      </div>
      <div style="margin-bottom:30px;">
        <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--text);">Nhập lại mật khẩu</label>
        <input type="password" id="auth-password-confirm" required minlength="6" style="width:100%; padding:12px 15px; border-radius:8px; border:1px solid var(--border); background:rgba(0,0,0,0.03); color:var(--text); font-size:15px; outline:none;">
      </div>
      `}

      <button type="submit" id="auth-submit-btn" style="width:100%; padding:14px; background:var(--primary); color:#fff; border:none; border-radius:8px; font-size:16px; font-weight:bold; cursor:pointer; transition:0.3s;">
        ${isLogin ? 'ĐĂNG NHẬP NGAY' : isRegister ? 'TẠO TÀI KHOẢN' : 'ĐẶT LẠI MẬT KHẨU'}
      </button>
      
      <div style="text-align:center; margin-top:20px; font-size:14px;">
        ${isLogin ? 
          `Chưa có tài khoản? <a href="/auth?tab=register" data-link style="color:var(--primary); font-weight:600;">Đăng ký ngay</a> · <a href="/auth?tab=forgot" data-link style="color:var(--primary); font-weight:600;">Quên mật khẩu</a>` : 
          isRegister ?
          `Đã có tài khoản? <a href="/auth?tab=login" data-link style="color:var(--primary); font-weight:600;">Đăng nhập</a>` :
          `Đã nhớ mật khẩu? <a href="/auth?tab=login" data-link style="color:var(--primary); font-weight:600;">Đăng nhập</a>`}
      </div>
    </form>
  </div>
</main>
        `;
    },

    initAuthScripts: () => {
        const form = document.getElementById('auth-form');
        if(!form) return;
        const hashParams = window.location.hash.split('?')[1] || '';
        const urlParams = new URLSearchParams(hashParams);
        const tab = urlParams.get('tab') || 'login';
        const isLogin = tab === 'login';
        const isRegister = tab === 'register';
        const isForgot = tab === 'forgot';

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('auth-submit-btn');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
            btn.disabled = true;

            try {
                if(isLogin) {
                    const u = document.getElementById('auth-username').value.trim();
                    const p = document.getElementById('auth-password').value;
                    if(u.length < 4 || p.length < 6) throw new Error('Tên đăng nhập hoặc mật khẩu không hợp lệ');
                    await window.Auth.login(u, p);
                    window.UI.showToast('Thành công', 'Đăng nhập thành công', 'success');
                } else if(isRegister) {
                    const u = document.getElementById('auth-username').value.trim();
                    const p = document.getElementById('auth-password').value;
                    const em = document.getElementById('auth-email').value.trim();
                    if(u.length < 4 || p.length < 6) throw new Error('Tên đăng nhập phải từ 4 ký tự, mật khẩu từ 6 ký tự');
                    if(!em || !em.includes('@')) throw new Error('Email không hợp lệ');
                    await window.Auth.register(u, p, em);
                    window.UI.showToast('Thành công', 'Đăng ký thành công', 'success');
                    await window.Auth.login(u, p);
                } else if(isForgot) {
                    const em = document.getElementById('auth-email').value.trim();
                    const p = document.getElementById('auth-password').value;
                    const confirm = document.getElementById('auth-password-confirm').value;
                    if(!em || !em.includes('@')) throw new Error('Email không hợp lệ');
                    if(p.length < 6) throw new Error('Mật khẩu mới phải từ 6 ký tự');
                    if(p !== confirm) throw new Error('Mật khẩu xác nhận không trùng khớp');
                    await window.Auth.resetPassword(em, p);
                    window.UI.showToast('Thành công', 'Mật khẩu đã được đặt lại. Vui lòng đăng nhập lại.', 'success');
                }
                setTimeout(() => window.Router.navigate((isLogin || isRegister) ? '/' : '/auth?tab=login'), 700);
            } catch(err) {
                window.UI.showToast('Lỗi', err.message, 'error');
                btn.innerHTML = isLogin ? 'ĐĂNG NHẬP NGAY' : isRegister ? 'TẠO TÀI KHOẢN' : 'ĐẶT LẠI MẬT KHẨU';
                btn.disabled = false;
            }
        });
    },

    Cart: () => {
        const cart = window.Cart.getItems();
        if(cart.length === 0) {
            return `
<main class="main-content" style="min-height:70vh; display:flex; align-items:center; justify-content:center; flex-direction:column;">
    <img src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png" style="width:150px; opacity:0.5; margin-bottom:20px;">
    <h2 style="color:var(--text-muted);">Giỏ hàng của bạn đang trống</h2>
    <a href="/" data-link style="margin-top:20px; padding:12px 24px; background:var(--primary); color:#fff; border-radius:8px; font-weight:bold;"><i class="fas fa-arrow-left"></i> Tiếp tục mua sắm</a>
</main>
            `;
        }

        let cartRows = cart.map(item => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:rgba(0,0,0,0.2); border-radius:8px; margin-bottom:10px;">
                <div style="flex:1">
                    <h4 style="margin:0 0 5px 0;">${item.title}</h4>
                    <span style="color:var(--primary); font-weight:bold;">${item.price.toLocaleString()}đ</span>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <button onclick="Cart.updateQty('${item.id}', ${item.qty - 1})" style="width:30px; height:30px; border-radius:5px; border:none; background:var(--border); color:#fff; cursor:pointer;">-</button>
                    <span style="font-weight:bold; width:20px; text-align:center;">${item.qty}</span>
                    <button onclick="Cart.updateQty('${item.id}', ${item.qty + 1})" style="width:30px; height:30px; border-radius:5px; border:none; background:var(--primary); color:#fff; cursor:pointer;">+</button>
                    <button onclick="Cart.remove('${item.id}')" style="margin-left:15px; background:none; border:none; color:var(--danger); cursor:pointer; font-size:18px;"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');

        return `
<main class="main-content" style="min-height:70vh; padding: 40px 0;">
    <div class="container" style="display:grid; grid-template-columns:2fr 1fr; gap:30px;">
        <div class="cart-items-wrap" style="background:var(--card-bg); border:1px solid var(--border); border-radius:12px; padding:20px;">
            <h2 style="margin-bottom:20px; border-bottom:1px solid var(--border); padding-bottom:15px;">Giỏ hàng (${cart.reduce((a,b)=>a+b.qty,0)} sản phẩm)</h2>
            ${cartRows}
        </div>
        <div class="cart-summary-wrap" style="background:var(--card-bg); border:1px solid var(--border); border-radius:12px; padding:20px; height:max-content;">
            <h3 style="margin-bottom:20px;">Tóm tắt đơn hàng</h3>
            <div style="display:flex; justify-content:space-between; margin-bottom:15px; font-size:15px; color:var(--text-muted);">
                <span>Tổng tiền:</span>
                <span style="color:var(--text); font-weight:bold; font-size:18px;">${window.Cart.getTotal().toLocaleString()}đ</span>
            </div>
            <button onclick="Views.doCheckout()" id="checkout-btn" style="width:100%; padding:15px; background:var(--primary); color:#fff; border:none; border-radius:8px; font-size:16px; font-weight:bold; cursor:pointer; transition:0.3s;">
                THANH TOÁN NGAY
            </button>
            <p style="text-align:center; margin-top:15px; font-size:13px; color:var(--text-muted);"><i class="fas fa-shield-alt"></i> Thanh toán an toàn, tự động 100%</p>
        </div>
    </div>
</main>
        `;
    },

    doCheckout: async () => {
        const btn = document.getElementById('checkout-btn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        btn.disabled = true;
        try {
            await window.Cart.checkout();
            window.UI.showToast('Thành công', 'Thanh toán thành công! Chuyển hướng...', 'success');
            setTimeout(() => window.Router.navigate('/dashboard'), 1500);
        } catch (err) {
            window.UI.showToast('Lỗi', err.message, 'error');
            btn.innerHTML = 'THANH TOÁN NGAY';
            btn.disabled = false;
        }
    },

    Dashboard: () => {
        const user = window.Auth.getCurrentUser();
        if(!user) {
            setTimeout(() => window.Router.navigate('/auth'), 0);
            return '';
        }

        const txns = user.transactions || [];
        const txnRows = txns.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding:20px;">Chưa có giao dịch nào</td></tr>' :
            txns.map(t => `
            <tr style="border-bottom:1px solid var(--border);">
                <td style="padding:15px;">${t.id}</td>
                <td style="padding:15px;">${new Date(t.date).toLocaleString('vi-VN')}</td>
                <td style="padding:15px;">
                    ${t.desc}
                    ${t.status ? `<div style="font-size:12px; color:${t.status === 'Thành công' ? '#10b981' : t.status === 'Thất bại' ? '#ef4444' : '#f59e0b'}; margin-top:6px;">${t.status}</div>` : ''}
                </td>
                <td style="padding:15px; font-weight:bold; color:${t.amount > 0 ? '#10b981' : '#ef4444'}">${t.amount > 0 ? '+' : ''}${t.amount.toLocaleString()}đ</td>
            </tr>
            `).join('');

        return `
<main class="main-content" style="min-height:70vh; padding: 40px 0;">
    <div class="container">
        <div style="background:var(--card-bg); border:1px solid var(--border); border-radius:12px; padding:30px; margin-bottom:30px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <h2 style="margin-bottom:10px;">Xin chào, ${user.username}!</h2>
                <p style="color:var(--text-muted);">Email: ${user.email} | Ngày tham gia: ${new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
            <div style="text-align:right;">
                <div style="font-size:14px; color:var(--text-muted); margin-bottom:5px;">Số dư hiện tại</div>
                <div style="font-size:32px; font-weight:bold; color:#10b981; margin-bottom:10px;">${user.balance.toLocaleString()} đ</div>
                <a href="/deposit" data-link style="display:inline-block; padding:10px 20px; background:#10b981; color:#fff; border-radius:6px; font-weight:bold;"><i class="fas fa-plus-circle"></i> Nạp thêm</a>
            </div>
        </div>

        <div style="background:var(--card-bg); border:1px solid var(--border); border-radius:12px; padding:30px;">
            <h3 style="margin-bottom:20px; border-bottom:1px solid var(--border); padding-bottom:15px;">Lịch sử giao dịch</h3>
            <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; text-align:left;">
                    <thead>
                        <tr style="background:rgba(0,0,0,0.3);">
                            <th style="padding:15px; border-radius:8px 0 0 8px;">Mã GD</th>
                            <th style="padding:15px;">Thời gian</th>
                            <th style="padding:15px;">Nội dung</th>
                            <th style="padding:15px; border-radius:0 8px 8px 0;">Số tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${txnRows}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</main>
        `;
    },

    Deposit: () => {
        const user = window.Auth.getCurrentUser();
        if(!user) {
            setTimeout(() => window.Router.navigate('/auth'), 0);
            return '';
        }

        return `
<main class="main-content" style="min-height:70vh; padding: 40px 0;">
    <div class="container" style="max-width:800px;">
        <div style="background:var(--card-bg); border:1px solid var(--border); border-radius:12px; padding:40px; text-align:center;">
            <h2 style="margin-bottom:15px;"><i class="fas fa-wallet" style="color:#10b981;"></i> Nạp Tiền Vào Tài Khoản</h2>
            <p style="color:var(--text-muted); margin-bottom:30px;">Nhập số tiền bạn muốn nạp. Yêu cầu sẽ được gửi cho admin duyệt, sau đó tiền sẽ được cộng vào tài khoản.</p>
            
            <div style="display:grid; grid-template-columns:1fr; gap:20px; text-align:left; max-width:420px; margin:0 auto;">
                <div style="background:#fff; padding:20px; border-radius:12px;">
                    <label style="display:block; font-size:13px; color:var(--text-muted); margin-bottom:8px;">Số tiền nạp</label>
                    <input id="deposit-amount" type="number" min="10000" step="1000" placeholder="Nhập số tiền (VD: 500000)" style="width:100%; padding:14px; border:1px solid var(--border); border-radius:10px; background:#f8fafc; font-size:15px;">
                </div>
                <button onclick="Views.requestDeposit()" id="request-deposit-btn" style="width:100%; padding:14px; background:#10b981; color:#fff; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">
                    Gửi yêu cầu nạp tiền
                </button>
                <p style="color:#f59e0b;">Yêu cầu sẽ được gửi cho admin duyệt. Khi admin chấp nhận, tiền sẽ tự động cộng vào số dư của bạn.</p>
            </div>
        </div>
    </div>
</main>
        `;
    },

    requestDeposit: () => {
        const amount = parseInt(document.getElementById('deposit-amount').value, 10);
        if (Number.isNaN(amount) || amount < 10000) {
            window.UI.showToast('Nhập số tiền hợp lệ tối thiểu 10.000đ', 'error');
            return;
        }
        const user = window.Auth.getCurrentUser();
        const users = window.Auth.getUsers();
        const idx = users.findIndex(u => u.username === user.username);
        if (idx === -1) {
            window.UI.showToast('Không tìm thấy người dùng.', 'error');
            return;
        }
        const request = {
            id: 'DEP-' + Date.now(),
            date: new Date().toISOString(),
            amount,
            type: 'deposit-request',
            status: 'Đang xử lý',
            desc: 'Yêu cầu nạp tiền'
        };
        users[idx].transactions = users[idx].transactions || [];
        users[idx].transactions.unshift(request);
        localStorage.setItem('mmo_users', JSON.stringify(users));
        window.UI.showToast('Yêu cầu nạp tiền đã được gửi. Vui lòng đợi admin duyệt.', 'success');
        if (window.Router) {
            window.Router.navigate('/dashboard');
        } else {
            window.location.reload();
        }
    },

    History: () => {
        const user = window.Auth.getCurrentUser();
        if(!user) {
            setTimeout(() => window.Router.navigate('/auth'), 0);
            return '';
        }

        const txns = user.transactions || [];
        const txnRows = txns.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding:20px;">Chưa có giao dịch nào</td></tr>' :
            txns.map(t => `
            <tr style="border-bottom:1px solid var(--border);">
                <td style="padding:15px;">${t.id}</td>
                <td style="padding:15px;">${new Date(t.date).toLocaleString('vi-VN')}</td>
                <td style="padding:15px;">${t.desc}</td>
                <td style="padding:15px; font-weight:bold; color:${t.amount > 0 ? '#10b981' : '#ef4444'}">${t.amount > 0 ? '+' : ''}${t.amount.toLocaleString()}đ</td>
            </tr>
            `).join('');

        return `
<main class="main-content" style="min-height:70vh; padding: 40px 0;">
    <div class="container">
        <div style="background:var(--card-bg); border:1px solid var(--border); border-radius:12px; padding:30px; margin-bottom:30px;">
            <h2 style="margin-bottom:10px;">Lịch sử giao dịch của ${user.username}</h2>
            <p style="color:var(--text-muted);">Theo dõi chi tiết nạp tiền và mua hàng.</p>
        </div>

        <div style="background:var(--card-bg); border:1px solid var(--border); border-radius:12px; padding:30px;">
            <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; text-align:left;">
                    <thead>
                        <tr style="background:rgba(0,0,0,0.1);">
                            <th style="padding:15px; border-radius:8px 0 0 8px;">Mã GD</th>
                            <th style="padding:15px;">Thời gian</th>
                            <th style="padding:15px;">Nội dung</th>
                            <th style="padding:15px; border-radius:0 8px 8px 0;">Số tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${txnRows}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</main>
        `;
    },

    Search: () => {
        const hashParams = window.location.hash.split('?')[1] || '';
        const query = new URLSearchParams(hashParams).get('query') || '';
        const normalized = query.trim().toLowerCase();
        const results = [];
        CATEGORIES.forEach(cat => {
            cat.products.forEach(prod => {
                if(normalized && (prod.title.toLowerCase().includes(normalized) || prod.desc.toLowerCase().includes(normalized))) {
                    results.push({ ...prod, category: cat });
                }
            });
        });

        const resultHtml = results.length === 0 ? `
            <div style="padding:60px 20px; text-align:center; color:var(--text-muted);">
                <h3>Không tìm thấy kết quả cho "${query}"</h3>
                <p>Thử lại với từ khóa khác hoặc xem các sản phẩm nổi bật bên dưới.</p>
            </div>
        ` : results.map(item => window.UI.renderProductCard(item, item.category.icon, item.category.color)).join('');

        return `
<main class="main-content" style="min-height:70vh; padding:40px 0;">
    <div class="container">
        <div style="margin-bottom:32px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
            <div>
                <h2 style="margin:0;">Kết quả tìm kiếm</h2>
                <p style="margin:8px 0 0; color:var(--text-muted);">Tìm kiếm: "${query || '---'}"</p>
            </div>
            <a href="/" data-link style="padding:12px 22px; background:var(--primary); color:#fff; border-radius:10px; font-weight:700;">Quay về Trang chủ</a>
        </div>
        <div class="page-grid">
            ${resultHtml}
        </div>
    </div>
</main>
        `;
    },

    NotFound: () => `
<main class="main-content" style="min-height:70vh; display:flex; align-items:center; justify-content:center; flex-direction:column;">
    <h1 style="font-size:120px; color:var(--primary); font-weight:900; line-height:1; text-shadow:0 10px 30px rgba(0,0,0,0.5);">404</h1>
    <h2 style="font-size:24px; margin-bottom:20px;">Ôi không! Trang bạn tìm không tồn tại.</h2>
    <a href="/" data-link style="padding:12px 30px; background:var(--primary); color:#fff; border-radius:30px; font-weight:bold; font-size:16px;"><i class="fas fa-home"></i> Trở về Trang Chủ</a>
</main>
    `,

    Guide: () => `<main class="main-content" style="min-height:70vh; padding:50px 0;"><div class="container"><h1 style="text-align:center;margin-bottom:30px;">Hướng Dẫn Mua Hàng</h1><div style="background:var(--card-bg); padding:30px; border-radius:12px; border:1px solid var(--border);"><p>Tính năng đang được cập nhật...</p></div></div></main>`,
    Contact: () => `<main class="main-content" style="min-height:70vh; padding:50px 0;"><div class="container"><h1 style="text-align:center;margin-bottom:30px;">Liên Hệ</h1><div style="background:var(--card-bg); padding:30px; border-radius:12px; border:1px solid var(--border);"><p>Zalo/Hotline: 033.655.6137</p></div></div></main>`,
    News: () => `<main class="main-content" style="min-height:70vh; padding:50px 0;"><div class="container"><h1 style="text-align:center;margin-bottom:30px;">Tin Tức Cập Nhật</h1><div style="background:var(--card-bg); padding:30px; border-radius:12px; border:1px solid var(--border);"><p>Trang tin tức đang trong quá trình chuyển đổi...</p></div></div></main>`
};

window.Views = Views;
