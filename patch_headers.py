import glob
import re

html_files = glob.glob('*.html')

new_actions_html = """    <div class="hdr-actions">
      <a href="deposit.html" class="action-box" id="wallet-btn" style="display:none;">
        <div class="action-icon" style="background:#e0f2fe; color:#0ea5e9;"><i class="fas fa-wallet"></i></div>
        <div class="action-info">
          <span class="action-label">Số dư</span>
          <span class="action-value" id="wallet-amount">0 đ</span>
        </div>
      </a>
      <a href="checkout.html" class="action-box" id="cart-btn">
        <div class="action-icon">
          <i class="fas fa-shopping-cart"></i>
          <span class="cart-badge" id="cart-badge">0</span>
        </div>
        <div class="action-info">
          <span class="action-label">Giỏ hàng</span>
          <span class="action-value" id="cart-amount">0 đ</span>
        </div>
      </a>
      <div class="action-box notif-box" id="notif-btn" style="position:relative; display:none; cursor:pointer;">
        <div class="action-icon"><i class="fas fa-bell"></i><span class="notif-badge" id="notif-badge" style="display:none;">0</span></div>
        <div class="notif-dropdown" id="notif-dropdown">
          <div class="notif-header">
            <span style="font-weight:700; font-size:14px;">Thông báo</span>
            <button onclick="markAllNotifRead(event)"><i class="fas fa-check-double"></i> Đánh dấu đã đọc</button>
          </div>
          <div class="notif-list" id="notif-list"></div>
        </div>
      </div>
      <div class="action-box" id="auth-btn">
        <div class="action-icon auth"><i class="fas fa-user"></i></div>
        <div class="auth-texts">
          <a href="auth.html?tab=login" id="link-login">ĐĂNG NHẬP</a>
          <a href="auth.html?tab=register" id="link-register">ĐĂNG KÝ</a>
        </div>
      </div>
      <a href="tel:0336556137" class="contact-cta" id="contact-cta">
        <div class="ring"><i class="fab fa-whatsapp"></i></div>
        <div class="cta-info">
          <span class="cta-label">LIÊN HỆ NGAY</span>
          <span class="cta-phone">033.655.6137</span>
        </div>
      </a>
      <button class="menu-toggle" id="menu-toggle"><i class="fas fa-bars"></i></button>
    </div>"""

count = 0
for file in html_files:
    if file == 'admin.html' or file == 'auth.html': 
        continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pattern = r'<div class="hdr-actions">.*?</header>'
    
    if re.search(pattern, content, re.DOTALL):
        new_content = re.sub(pattern, new_actions_html + '\n  </div>\n</header>', content, flags=re.DOTALL)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        count += 1
print(f'Updated {count} files.')
