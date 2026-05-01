/**
 * QuocHuy MMO - Cloud Synchronization Utility
 * Ensures LocalStorage is synced with Firestore data.
 */

(function() {
  const firebaseConfig = window.MMO_FIREBASE_CONFIG || {};
  const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
  let db = null;

  if (isFirebaseConfigured && window.firebase) {
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
  }

  function getLocalUser() {
    try { return JSON.parse(localStorage.getItem('mmo_currentUser')) || null; } catch(e) { return null; }
  }

  async function startRealtimeSync() {
    if (!db) return;
    const currentUser = getLocalUser();
    if (!currentUser) return;

    const email = (currentUser && currentUser.email) ? String(currentUser.email).toLowerCase().trim() : '';
    const uid = currentUser ? currentUser.uid : null;
    
    console.log("[Sync] Starting real-time sync for:", email || currentUser.user);

    const handleData = (doc) => {
      if (doc.exists) {
        const cloudData = doc.data();
        const merged = { ...currentUser, ...cloudData };
        localStorage.setItem('mmo_currentUser', JSON.stringify(merged));
        
        // Update local users cache
        const users = JSON.parse(localStorage.getItem('mmo_users') || '[]');
        const idx = users.findIndex(u => (uid && u.uid === uid) || (email && u.email === email) || (u.user && u.user === currentUser.user));
        if (idx !== -1) {
          users[idx] = merged;
          localStorage.setItem('mmo_users', JSON.stringify(users));
        }

        // Auto-update common UI elements
        updateCommonUI(merged);
        console.log("[Sync] Real-time update received. Balance:", merged.balance);
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('mmo_user_synced', { detail: merged }));
      }
    };

    // Listen by UID first
    if (uid) {
      db.collection('users').doc(uid).onSnapshot(handleData, err => console.warn("[Sync] UID listener error:", err));
    } else if (email) {
      // Fallback to Email if UID is missing
      db.collection('users').doc(email).onSnapshot(handleData, err => console.warn("[Sync] Email listener error:", err));
    }
  }

  function updateCommonUI(user) {
    const format = (n) => Number(n || 0).toLocaleString('vi-VN') + ' đ';
    
    // Balance elements
    document.querySelectorAll('#user-balance, #wallet-amount, #wallet-value').forEach(el => {
      el.textContent = format(user.balance);
    });

    // Notification badge
    const badge = document.getElementById('notif-badge');
    if (badge) {
      const notifs = user.notifications || [];
      const unread = notifs.filter(n => !n.read).length;
      badge.style.display = unread > 0 ? 'flex' : 'none';
      badge.textContent = unread > 9 ? '9+' : unread;
    }
  }

  // Start syncing
  startRealtimeSync();

  // Expose for manual trigger
  window.mmoSyncUser = startRealtimeSync;
})();
