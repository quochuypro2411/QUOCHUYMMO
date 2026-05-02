import os
import re

html_files = ['best-seller.html', 'buff.html', 'clone.html', 'facebook.html', 'gmail.html', 'guide.html', 'news.html', 'proxy.html', 'seeding.html', 'tiktok.html', 'tool.html', 'unlock.html']

script_block = '''
  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
  <script src="js/firebase-config.js?v=2.5" defer></script>
  <script src="js/common.js?v=2.5" defer></script>
  <script src="js/middlewares/rate.limiter.js?v=1.0" defer></script>
  <script src="js/services/pricing.service.js?v=1.0" defer></script>
  <script src="js/services/auth.service.js?v=1.0" defer></script>
  <script src="js/services/order.service.js?v=1.0" defer></script>
  <script src="js/services/admin.service.js?v=1.0" defer></script>
  <script src="js/middlewares/role.guard.js?v=1.1" defer></script>
  <script src="js/layouts/default.layout.js?v=1.0" defer></script>
  <script src="js/layouts/premium.layout.js?v=1.0" defer></script>
  <script src="js/layout.manager.js?v=1.2" defer></script>
  <script src="js/auth.js?v=3.1" defer></script>
  <script src="js/sync.js?v=2.5" defer></script>
  <script src="js/script.js?v=2.5" defer></script>
  <script defer>
    document.addEventListener('DOMContentLoaded', () => {
      if (window.Auth) Auth.init();
      setTimeout(() => {
        if (window.LayoutManager) {
          LayoutManager.apply();
          LayoutManager.startWatching();
        }
      }, 50);
      setTimeout(() => {
        if (window.LayoutManager) LayoutManager.apply();
      }, 500);
    });
  </script>
'''

for file in html_files:
    if not os.path.exists(file): continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace <script src="js/script.js"></script> with script_block
    new_content = re.sub(r'<script src="js/script.js"></script>', script_block.strip(), content)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {file}')

