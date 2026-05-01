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

    // Listen to BOTH potential document locations for maximum compatibility
    if (uid) {
      console.log("[Sync] Listening to UID doc:", uid);
      db.collection('users').doc(uid).onSnapshot(handleData, err => console.warn("[Sync] UID listener error:", err));
    }
    
    if (email) {
      console.log("[Sync] Listening to Email doc:", email);
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

  // Global function to push data to cloud
  window.mmoUpsertUser = async function(user) {
    if (!db || !user || !user.email) return;
    try {
      const email = user.email.toLowerCase().trim();
      const docId = user.uid || email;
      await db.collection('users').doc(docId).set(user, { merge: true });
      console.log("[Sync] Data pushed to cloud for:", email);
    } catch (e) {
      console.error("[Sync] Push failed:", e);
    }
  };

  // Start syncing
  startRealtimeSync();

  // Sync Global Notifications
  if (db) {
    db.collection('global_notifications').orderBy('date', 'desc').limit(10)
      .onSnapshot(snap => {
        const notifs = snap.docs.map(doc => doc.data());
        localStorage.setItem('mmo_global_notifications', JSON.stringify(notifs));
        console.log("[Sync] Global notifications updated:", notifs.length);
        // Trigger a refresh of the marquee or news if they exist
        window.dispatchEvent(new CustomEvent('mmo_global_notifs_synced', { detail: notifs }));
      }, err => console.warn("[Sync] Global notifs error:", err));
  }

  // Expose for manual trigger
  window.mmoSyncUser = startRealtimeSync;
})();
