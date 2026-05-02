/**
 * QuocHuy MMO - Common Utilities
 */
console.log('📦 Common Utilities loading...');
window.MMO = {
  // Get current user from local storage
  getUser: function() {
    try { return JSON.parse(localStorage.getItem('mmo_currentUser')) || null; } catch(e) { return null; }
  },
  
  // Get all users from local storage
  getAllUsers: function() {
    try { return JSON.parse(localStorage.getItem('mmo_users')) || []; } catch(e) { return []; }
  },

  // Save current user
  saveUser: function(user) {
    localStorage.setItem('mmo_currentUser', JSON.stringify(user));
    // Also update in users list
    const users = this.getAllUsers();
    const idx = users.findIndex(u => u.email === user.email || u.uid === user.uid);
    if (idx !== -1) {
      users[idx] = user;
      localStorage.setItem('mmo_users', JSON.stringify(users));
    }
  },

  // Format money
  fmt: function(n) {
    return Number(n || 0).toLocaleString('vi-VN') + ' đ';
  },

  // Show Toast/Notify
  notify: function(msg, isError = false) {
    console.log(`[MMO-Notify] ${isError ? 'Error' : 'Success'}: ${msg}`);
    let t = document.getElementById('mmo-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'mmo-toast';
      t.className = 'toast-box';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.backgroundColor = isError ? '#ef4444' : '#0f172a';
    t.style.display = 'block'; // Đảm bảo luôn hiển thị
    setTimeout(() => {
      t.classList.add('show');
    }, 10);
    
    clearTimeout(window.mmoToastTimer);
    window.mmoToastTimer = setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => { if(!t.classList.contains('show')) t.style.display = 'none'; }, 300);
    }, 3000);
  }
};

console.log("✅ QuocHuy MMO Common Utilities Loaded");

// Check Admin Redirect
(function() {
  const user = window.MMO.getUser();
  const isAdmin = user && (user.role === 'admin' || user.isAdmin);
  const page = window.location.pathname.split('/').pop();
  
  if (isAdmin && page !== 'admin.html' && page !== 'auth.html' && page !== '') {
    // window.location.href = 'admin.html'; // Tạm thời tắt để bạn test homepage dễ hơn
  }
})();

// Auto-inject Premium Layout for all pages
(function() {
  function applyPremium() {
    const user = window.MMO.getUser();
    if (user && (user.role === 'premium' || user.role === 'admin' || user.isAdmin)) {
      document.body.setAttribute('data-layout', 'premium');
      if (!document.querySelector('link[href*="premium.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/premium.css?v=' + Date.now(); // Cache busting
        document.head.appendChild(link);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyPremium);
  } else {
    applyPremium();
  }
})();
