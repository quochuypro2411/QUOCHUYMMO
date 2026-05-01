/**
 * QuocHuy MMO - Common Utilities
 */
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
    let t = document.getElementById('toast') || document.getElementById('mmo-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'mmo-toast';
      t.className = 'toast-box';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.background = isError ? '#ef4444' : '#0f172a';
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }
};

// Check Admin Redirect
(function() {
  const user = window.MMO.getUser();
  const isAdmin = user && (user.role === 'admin' || user.isAdmin);
  const page = window.location.pathname.split('/').pop();
  
  if (isAdmin && page !== 'admin.html' && page !== 'auth.html' && page !== '') {
    // window.location.href = 'admin.html'; // Tạm thời tắt để bạn test homepage dễ hơn
  }
})();
