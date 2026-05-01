from pathlib import Path
import re

pages = {
    'facebook.html': {
        'title': 'Tài khoản Facebook',
        'description': 'Chọn tài khoản Facebook Việt cổ, quốc tế, chạy Ads và seeding. Tất cả được cung cấp với IP sạch, full info và hỗ trợ chuyển nhượng nhanh.',
        'hero': 'Các gói tài khoản Facebook uy tín, phù hợp bán hàng, quảng cáo và chạy seeding. Cam kết giao nhanh, bảo hành 1 đổi 1.',
        'badge': ['Facebook Việt cổ', 'IP sạch', 'Chuyển nhượng nhanh'],
        'cards': [
            ('ic-fb', 'fab fa-facebook-f', 'Facebook Việt cổ', 'Tài khoản Việt cổ, IP sạch, full info, bảo hành 1 đổi 1.', '125k'),
            ('ic-fb-alt', 'fas fa-bullhorn', 'Facebook chạy Ads', 'Nick chuyên chạy quảng cáo, sẵn sàng lên đơn nhanh.', '189k'),
            ('ic-fb-prem', 'fas fa-user-secret', 'Nick seeding', 'Nick seeding uy tín, an toàn cho Fanpage và Group.', '79k'),
            ('ic-gm-blue', 'fas fa-id-badge', 'Facebook full info', 'Tài khoản đầy đủ thông tin cá nhân, dễ dùng, dễ quản lý.', '149k'),
            ('ic-fb-vip', 'fas fa-sync-alt', 'Chuyển nhượng nhanh', 'Hỗ trợ nhận chuyển nhượng ngay trong ngày.', '239k'),
            ('ic-fb-alt', 'fas fa-globe', 'Facebook quốc tế', 'Tài khoản quốc tế chất lượng, chạy dịch vụ nước ngoài tốt.', '199k'),
        ],
    },
    'gmail.html': {
        'title': 'Gmail / Email',
        'description': 'Gmail/Email chất lượng, Việt cổ, full info, phù hợp đăng ký dịch vụ, chạy quảng cáo và kết nối tài khoản an toàn.',
        'hero': 'Bộ tài khoản email chuyên biệt cho MMO: từ Gmail Việt cổ đến email doanh nghiệp, đầy đủ xác thực, sẵn sàng dùng ngay.',
        'badge': ['Gmail VIP', 'Google Workspace', 'Full info'],
        'cards': [
            ('ic-gm-red', 'fas fa-envelope', 'Gmail Việt cổ VIP', 'Gmail đã ngâm IP, full info, tương thích Ads và dịch vụ.', '99k'),
            ('ic-gm-blue', 'fas fa-building', 'Email doanh nghiệp', 'Email Google Workspace chuẩn doanh nghiệp, bảo mật cao.', '199k'),
            ('ic-gm-green', 'fas fa-user-check', 'Email xác thực đầy đủ', 'Email đã liên kết số điện thoại, hoạt động ổn định.', '129k'),
            ('ic-gm-orange', 'fas fa-globe', 'Email quốc tế', 'Email nước ngoài đa năng, dùng được các dịch vụ quốc tế.', '159k'),
            ('ic-gm-purple', 'fas fa-exchange-alt', 'Gmail chuyển nhượng', 'Hỗ trợ chuyển nhượng, đổi chủ nhanh chóng.', '189k'),
            ('ic-gm-teal', 'fas fa-bolt', 'Gmail chạy Ads', 'Gmail chất lượng cao dùng cho chiến dịch quảng cáo và xác thực.', '139k'),
        ],
    },
    'tool.html': {
        'title': 'Phần mềm Tool',
        'description': 'Tool MMO chuyên nghiệp hỗ trợ auto seeding, quản lý fanpage, tăng tương tác, phân tích hiệu suất và chạy chiến dịch.',
        'hero': 'Công cụ tự động dành cho nhà bán hàng MMO: từ seeding, quản lý đến chạy quảng cáo, giúp tiết kiệm thời gian và tăng hiệu quả.',
        'badge': ['Auto seeding', 'Quản lý Fanpage', 'Tăng tương tác'],
        'cards': [
            ('ic-gm-orange', 'fas fa-robot', 'Tool Auto seeding', 'Tự động tăng tương tác: like, comment, share cho nội dung.', '199k'),
            ('ic-gm-green', 'fas fa-cogs', 'Tool quản lý fanpage', 'Quản lý bài đăng, bình luận và inbox dễ dàng.', '159k'),
            ('ic-gm-blue', 'fas fa-chart-line', 'Tool phân tích', 'Phân tích hiệu suất chiến dịch, tối ưu chiến lược.', '179k'),
            ('ic-gm-purple', 'fas fa-user-plus', 'Tool tăng like/sub', 'Tự động tăng like và sub cho bài viết, kênh.', '129k'),
            ('ic-gm-teal', 'fas fa-bolt', 'Tool chạy Ads', 'Tăng hiệu quả quảng cáo với tác vụ tự động ổn định.', '219k'),
            ('ic-gm-red', 'fas fa-shield-alt', 'Tool bảo mật', 'Bảo vệ tài khoản, giúp vận hành an toàn khi dùng tool.', '169k'),
        ],
    },
    'proxy.html': {
        'title': 'Proxy / VPS',
        'description': 'Proxy & VPS chất lượng cao, ổn định tốc độ, bảo mật cho MMO, chạy quảng cáo và quản lý nhiều tài khoản.',
        'hero': 'Dịch vụ mạng chuyên nghiệp cho MMO: proxy sạch, VPS ổn định, dùng cho Facebook, Gmail, seeding và các chiến dịch đa nền tảng.',
        'badge': ['Proxy sạch', 'VPS ổn định', 'Bảo mật cao'],
        'cards': [
            ('ic-gm-blue', 'fas fa-server', 'Proxy Việt Nam', 'Proxy VN riêng, IP sạch, chạy Facebook và Gmail an toàn.', '89k'),
            ('ic-gm-teal', 'fas fa-cloud', 'VPS giá tốt', 'VPS cấu hình ổn định, dùng làm máy chủ chạy tool, quản lý tài khoản.', '299k'),
            ('ic-gm-green', 'fas fa-globe', 'Proxy quốc tế', 'Proxy nước ngoài, phù hợp dịch vụ quốc tế, chạy Ads toàn cầu.', '119k'),
            ('ic-gm-orange', 'fas fa-lock', 'Proxy bảo mật', 'Proxy ẩn IP, bảo mật cao cho tài khoản và hệ thống.', '149k'),
            ('ic-gm-purple', 'fas fa-network-wired', 'Proxy Facebook', 'Proxy chuẩn cho Facebook, giảm rủi ro checkpoint.', '129k'),
            ('ic-gm-red', 'fas fa-desktop', 'VPS Linux', 'VPS Linux chuyên dụng cho chạy tool, auto và server.', '499k'),
        ],
    },
    'seeding.html': {
        'title': 'Dịch vụ Seeding',
        'description': 'Seeding chuyên nghiệp giúp tăng tương tác, uy tín và lan tỏa nội dung tự nhiên trên Facebook, TikTok và nhiều nền tảng.',
        'hero': 'Dịch vụ seeding đa dạng: like, comment, share, group, video. Dành cho shop, fanpage và nội dung cần tăng độ nhận diện nhanh.',
        'badge': ['Like/Comment', 'Share/Group', 'Video viral'],
        'cards': [
            ('ic-gm-red', 'fas fa-thumbs-up', 'Seeding Like', 'Tăng like thật, tạo sự tin cậy cho bài viết.', '149k'),
            ('ic-gm-blue', 'fas fa-comment', 'Seeding Comment', 'Comment thật, nội dung tự nhiên, tăng tương tác.', '129k'),
            ('ic-gm-green', 'fas fa-share', 'Seeding Share', 'Share rộng rãi giúp bài viết lan tỏa nhanh chóng.', '159k'),
            ('ic-gm-orange', 'fas fa-users', 'Seeding Group', 'Seeding trong group, tăng tương tác cộng đồng.', '189k'),
            ('ic-gm-purple', 'fas fa-video', 'Seeding Video', 'Tăng view và tương tác cho video TikTok/FB.', '209k'),
            ('ic-gm-teal', 'fas fa-star', 'Seeding Review', 'Tăng review chất lượng cho sản phẩm và dịch vụ.', '179k'),
        ],
    },
    'unlock.html': {
        'title': 'Unlock Tài khoản',
        'description': 'Dịch vụ mở khóa tài khoản nhanh, hỗ trợ OTP, xác thực, report và 2FA với phương pháp an toàn, hiệu quả.',
        'hero': 'Giải pháp unlock chuyên nghiệp cho Facebook, Gmail, Zalo và tài khoản bị khóa. Hỗ trợ xử lý nhanh với độ chính xác cao.',
        'badge': ['OTP', '2FA', 'Report'],
        'cards': [
            ('ic-gm-blue', 'fas fa-unlock-alt', 'Unlock OTP', 'Mở khóa tài khoản yêu cầu OTP, xử lý nhanh qua email/số.', '399k'),
            ('ic-gm-teal', 'fas fa-phone-alt', 'Unlock điện thoại', 'Mở khóa với xác thực điện thoại, hỗ trợ chuyển nhượng sau unlock.', '459k'),
            ('ic-gm-red', 'fas fa-user-lock', 'Unlock Report', 'Xử lý tài khoản bị report nặng, đảm bảo an toàn.', '679k'),
            ('ic-gm-purple', 'fas fa-user-shield', 'Unlock Full Info', 'Unlock cao cấp dành cho tài khoản có thông tin đầy đủ.', '859k'),
            ('ic-gm-orange', 'fas fa-lock', 'Unlock Fanpage', 'Mở khóa Fanpage và hỗ trợ quản lý chuyển nhượng.', '520k'),
            ('ic-gm-green', 'fas fa-shield-alt', 'Unlock 2FA', 'Mở khóa tài khoản bị khoá 2FA an toàn, chính xác.', '999k'),
        ],
    },
    'buff.html': {
        'title': 'Buff Like / Sub',
        'description': 'Buff like/sub chất lượng cho Facebook, TikTok, Instagram, giúp tài khoản lên xu hướng và tăng uy tín nhanh.',
        'hero': 'Dịch vụ buff tương tác dành cho nội dung cần tăng reach: like, sub, comment, share và story.',
        'badge': ['Like thật', 'Sub thật', 'Tăng reach'],
        'cards': [
            ('ic-gm-red', 'fas fa-thumbs-up', 'Buff Like', 'Tăng like thật cho bài viết, tăng sự tin cậy.', '129k'),
            ('ic-gm-blue', 'fas fa-user-plus', 'Buff Sub', 'Tăng sub cho tài khoản TikTok/IG/FB.', '149k'),
            ('ic-gm-green', 'fas fa-share', 'Buff Share', 'Tăng share tự nhiên, lan tỏa nội dung nhanh.', '169k'),
            ('ic-gm-orange', 'fas fa-smile', 'Buff Reaction', 'Buff reaction đa dạng, phù hợp bài viết quảng cáo.', '119k'),
            ('ic-gm-purple', 'fas fa-comment', 'Buff Comment', 'Comment thật, nội dung tự nhiên và thu hút.', '139k'),
            ('ic-gm-teal', 'fas fa-bell', 'Buff Story', 'Tăng lượt xem story, giữ tương tác liên tục.', '179k'),
        ],
    },
    'clone.html': {
        'title': 'Clone / Via Ngoại',
        'description': 'Clone và via ngoại chất lượng, phục vụ đăng ký tài khoản, chạy quảng cáo, SEO và quản lý đa nền tảng.',
        'hero': 'Các gói clone, via chất lượng cho nhu cầu chạy quảng cáo, verification, tạo tài khoản hoặc chốt đơn.',
        'badge': ['Clone Mỹ', 'Via châu Á', 'An toàn cao'],
        'cards': [
            ('ic-gm-blue', 'fas fa-flag-usa', 'Clone Mỹ', 'Via Mỹ chất lượng, phù hợp quản lý và chạy quảng cáo.', '89k'),
            ('ic-gm-teal', 'fas fa-globe', 'Clone Châu Á', 'Via & clone châu Á ổn định, giá tốt.', '95k'),
            ('ic-gm-purple', 'fas fa-crown', 'Clone VIP Chính chủ', 'Clone VIP chất lượng, chính chủ, phù hợp chạy Ads.', '159k'),
            ('ic-gm-red', 'fas fa-lock', 'Clone Secure', 'Clone an toàn, thông tin rõ ràng, dùng lâu dài.', '169k'),
            ('ic-gm-orange', 'fas fa-sync-alt', 'Clone Auto', 'Clone tự động, tiện lợi cho chuyển đổi tài khoản.', '129k'),
            ('ic-gm-green', 'fas fa-building', 'Clone Thương hiệu', 'Clone dành cho tài khoản thương hiệu và doanh nghiệp.', '189k'),
        ],
    },
    'tiktok.html': {
        'title': 'TikTok / Instagram',
        'description': 'Dịch vụ TikTok/Instagram đầy đủ: buff follow, view, like, comment và viral content, giúp tăng độ nhận diện nhanh.',
        'hero': 'Các gói tương tác TikTok và Instagram chuyên sâu, hỗ trợ tăng view, follow và viral tự nhiên.',
        'badge': ['TikTok viral', 'IG tương tác', 'Story boost'],
        'cards': [
            ('ic-gm-orange', 'fas fa-video', 'Buff Reels TikTok', 'Tăng view và tương tác cho nội dung Reels/TikTok thật.', '159k'),
            ('ic-gm-blue', 'fas fa-user-plus', 'Buff Follow TikTok', 'Tăng follow thật, giúp lên xu hướng nhanh.', '179k'),
            ('ic-gm-green', 'fas fa-bell', 'Buff Thông báo', 'Tăng thông báo cho video mới, giữ tương tác cao.', '149k'),
            ('ic-gm-purple', 'fas fa-fire', 'Buff Viral TikTok', 'Giúp video viral, tăng lượt tiếp cận tự nhiên.', '209k'),
            ('ic-gm-red', 'fas fa-heart', 'Buff Like IG', 'Tăng like thật cho Instagram, tạo uy tín nội dung.', '139k'),
            ('ic-gm-teal', 'fas fa-comments', 'Buff Comment IG', 'Comment tự nhiên giúp bài đăng hấp dẫn hơn.', '169k'),
        ],
    },
}

main_template = '''<main class="container page-service" style="padding: 40px 0;">
  <section class="service-hero">
    <div>
      <div class="section-title-wrap"><div class="section-title">{title}</div></div>
      <p class="section-subtitle">{description}</p>
      <p style="color:var(--text-secondary);margin:18px 0 20px;max-width:720px;line-height:1.75;">{hero}</p>
      <div class="hero-badges">
        {badges}
      </div>
    </div>
    <div class="service-hero-card">
      <div class="hero-callout">
        <div class="hero-callout-title">Ưu điểm nổi bật</div>
        <ul class="hero-list">
          <li><i class="fas fa-check-circle"></i> Giao dịch nhanh chóng, hỗ trợ 24/7.</li>
          <li><i class="fas fa-check-circle"></i> Chất lượng uy tín, an toàn, kiểm định rõ ràng.</li>
          <li><i class="fas fa-check-circle"></i> Linh hoạt nhiều gói, phù hợp mọi nhu cầu MMO.</li>
        </ul>
      </div>
    </div>
  </section>
  <section class="product-section">
    <div class="section-header">
      <div class="section-title-wrap">
        <div class="section-icon"><i class="fas fa-box-open"></i></div>
        <div>
          <h2 class="section-title">Gợi ý gói dịch vụ</h2>
          <p class="section-subtitle">Đã chọn lọc các gói phổ biến nhất, phù hợp với nhu cầu mua nhanh và sử dụng hiệu quả.</p>
        </div>
      </div>
    </div>
    <div class="product-grid">
      {cards}
    </div>
  </section>
</main>'''

card_template = '''<div class="product-card">
  <div class="card-img"><div class="card-icon {icon_class}"><i class="{icon}"></i></div></div>
  <div class="card-body">
    <div class="card-name">{name}</div>
    <div class="card-desc">{desc}</div>
    <div class="card-pricing"><span class="price-new">{price}</span><button class="buy-btn">Mua ngay</button></div>
  </div>
</div>'''

badge_template = '<span class="hero-badge"><i class="fas fa-check"></i>{text}</span>'

for filename, data in pages.items():
    path = Path(filename)
    text = path.read_text(encoding='utf-8')
    badges = ''.join(badge_template.format(text=b) for b in data['badge'])
    cards = ''.join(card_template.format(icon_class=icon, icon=icon_symbol, name=name, desc=desc, price=price) for icon, icon_symbol, name, desc, price in data['cards'])
    new_main = main_template.format(title=data['title'], description=data['description'], hero=data['hero'], badges=badges, cards=cards)
    new_text, count = re.subn(r'<main[\s\S]*?</main>', new_main, text, count=1)
    if count != 1:
        print(f'WARN: did not replace main in {filename}')
    path.write_text(new_text, encoding='utf-8')
    print(f'Updated {filename}')
