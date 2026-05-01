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

  // --- FEATURE 5: TELEGRAM CONFIGURATION ---
  const TELEGRAM_CONFIG = {
    token: '8765090283:AAFi53C_TSTBFbORDJvcue_TanaPVJ7sO60', 
    chatId: '6428977154' 
  };

  function getLocalUser() {
    try { return JSON.parse(localStorage.getItem('mmo_currentUser')) || null; } catch(e) { return null; }
  }

  async function startRealtimeSync() {
    if (!db) return;
    const currentUser = getLocalUser();
    if (!currentUser) return;

    const email = (currentUser && currentUser.email) ? String(currentUser.email).toLowerCase().trim() : '';
    const uid = currentUser ? currentUser.uid : null;
    
    const handleData = (doc) => {
      if (doc.exists) {
        const cloudData = doc.data();
        const merged = { ...currentUser, ...cloudData };
        localStorage.setItem('mmo_currentUser', JSON.stringify(merged));
        
        const users = JSON.parse(localStorage.getItem('mmo_users') || '[]');
        const idx = users.findIndex(u => (uid && u.uid === uid) || (email && u.email === email) || (u.user && u.user === currentUser.user));
        if (idx !== -1) {
          users[idx] = merged;
          localStorage.setItem('mmo_users', JSON.stringify(users));
        }

        updateCommonUI(merged);
        window.dispatchEvent(new CustomEvent('mmo_user_synced', { detail: merged }));
      }
    };

    if (uid) db.collection('users').doc(uid).onSnapshot(handleData, err => console.warn("[Sync] UID error:", err));
    if (email) db.collection('users').doc(email).onSnapshot(handleData, err => console.warn("[Sync] Email error:", err));
  }

  function updateCommonUI(user) {
    const format = (n) => Number(n || 0).toLocaleString('vi-VN') + ' đ';
    document.querySelectorAll('#user-balance, #wallet-amount, #wallet-value').forEach(el => {
      el.textContent = format(user.balance);
    });
    const badge = document.getElementById('notif-badge');
    if (badge) {
      const unread = (user.notifications || []).filter(n => !n.read).length;
      badge.style.display = unread > 0 ? 'flex' : 'none';
      badge.textContent = unread > 9 ? '9+' : unread;
    }
  }

  window.mmoUpsertUser = async function(user) {
    if (!db || !user || !user.email) return Promise.reject("Missing DB or User info");
    try {
      const email = user.email.toLowerCase().trim();
      const docId = user.uid || email;
      await db.collection('users').doc(docId).set(user, { merge: true });
      return true;
    } catch (e) {
      console.error("[Sync] Push failed:", e);
      throw e;
    }
  };

  window.mmoSendTelegram = async function(message) {
    if (!TELEGRAM_CONFIG.token || TELEGRAM_CONFIG.token.includes('AAFi53C_TSTBFbORDJvcue_TanaPVJ7sO60') === false) {
      return; // Token not set correctly
    }
    const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.token}/sendMessage`;
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CONFIG.chatId,
          text: `🔔 [QUOCHUY MMO]\n\n${message}`,
          parse_mode: 'HTML'
        })
      });
    } catch (e) { console.error("[Telegram] Error:", e); }
  };

  startRealtimeSync();

  if (db) {
    db.collection('global_notifications').onSnapshot(snap => {
      const notifs = snap.docs.map(doc => doc.data()).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
      localStorage.setItem('mmo_global_notifications', JSON.stringify(notifs));
      const marquee = document.querySelector('.marquee-text');
      if (marquee && notifs.length > 0) {
        marquee.innerHTML = notifs.map(n => `<span><i class="fas fa-bullhorn"></i>&nbsp;${n.title}: ${n.message} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>`).join('');
      }
      window.dispatchEvent(new CustomEvent('mmo_global_notifs_synced', { detail: notifs }));
    }, err => console.warn("[Sync] Global error:", err));
  }

  window.mmoSyncUser = startRealtimeSync;
})();
