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

  async function syncUser() {
    if (!db) return;
    const currentUser = getLocalUser();
    if (!currentUser) return;

    try {
      const email = (currentUser.email || '').toLowerCase().trim();
      const uid = currentUser.uid;
      
      console.log("[Sync] Attempting sync for:", email || currentUser.user, "UID:", uid);

      let doc = null;
      let docRef = null;

      // 1. Try UID first (most accurate)
      if (uid) {
        docRef = db.collection('users').doc(uid);
        doc = await docRef.get();
      }

      // 2. Try Email as fallback
      if ((!doc || !doc.exists) && email) {
        docRef = db.collection('users').doc(email);
        doc = await docRef.get();
      }

      // 3. Try Username as last resort
      if ((!doc || !doc.exists) && currentUser.user) {
        docRef = db.collection('users').doc(currentUser.user.toLowerCase().trim());
        doc = await docRef.get();
      }

      if (doc && doc.exists) {
        const cloudData = doc.data();
        console.log("[Sync] Cloud data found:", cloudData);
        
        const merged = { ...currentUser, ...cloudData };
        localStorage.setItem('mmo_currentUser', JSON.stringify(merged));
        
        // Update local users cache
        const users = JSON.parse(localStorage.getItem('mmo_users') || '[]');
        const idx = users.findIndex(u => (uid && u.uid === uid) || (email && u.email === email) || (u.user && u.user === currentUser.user));
        if (idx !== -1) {
          users[idx] = merged;
          localStorage.setItem('mmo_users', JSON.stringify(users));
        }

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('mmo_user_synced', { detail: merged }));
        
        // Auto-update common UI elements
        updateCommonUI(merged);
        console.log("[Sync] Sync successful. New balance:", merged.balance);
      } else {
        console.warn("[Sync] No cloud document found for this user.");
      }
    } catch (e) {
      console.error("[Sync] Cloud sync failed:", e);
    }
  }

  function updateCommonUI(user) {
    const format = (n) => (n || 0).toLocaleString('vi-VN') + ' đ';
    
    // Balance elements
    document.querySelectorAll('#user-balance, #wallet-amount').forEach(el => {
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

  // Initial sync
  syncUser();

  // Expose for manual trigger
  window.mmoSyncUser = syncUser;
})();
