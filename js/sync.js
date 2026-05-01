/**
 * QuocHuy MMO - Cloud Synchronization Utility
 */

(function() {
  const firebaseConfig = window.MMO_FIREBASE_CONFIG || {};
  let db = null;

  if (firebaseConfig.apiKey && window.firebase) {
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
  }

  const TELEGRAM_CONFIG = {
    token: '8765090283:AAFi53C_TSTBFbORDJvcue_TanaPVJ7sO60', 
    chatId: '6428977154' 
  };

  window.mmoSendTelegram = async function(message) {
    if (!TELEGRAM_CONFIG.token) return;
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CONFIG.chatId,
          text: `🔔 [QUOCHUY MMO]\n\n${message}`,
          parse_mode: 'HTML'
        })
      });
    } catch (e) { console.error("Telegram error:", e); }
  };

  window.mmoUpsertUser = async function(user) {
    if (!db || !user || !user.email) return;
    try {
      const docId = user.uid || user.email.toLowerCase().trim();
      await db.collection('users').doc(docId).set(user, { merge: true });
    } catch (e) { console.error("Sync error:", e); }
  };

  // Real-time sync
  window.mmoStartSync = function() {
    if (!db) return;
    const user = JSON.parse(localStorage.getItem('mmo_currentUser') || 'null');
    if (!user) return;

    const email = user.email ? user.email.toLowerCase().trim() : '';
    const uid = user.uid;

    const handler = (doc) => {
      if (doc.exists) {
        const data = doc.data();
        const merged = { ...user, ...data };
        localStorage.setItem('mmo_currentUser', JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('mmo_user_synced', { detail: merged }));
        
        // Update balance display
        const fmt = (n) => Number(n || 0).toLocaleString('vi-VN') + ' đ';
        document.querySelectorAll('#user-balance, #wallet-amount, #wallet-value').forEach(el => {
          el.textContent = fmt(merged.balance);
        });
      }
    };

    if (uid) db.collection('users').doc(uid).onSnapshot(handler);
    else if (email) db.collection('users').doc(email).onSnapshot(handler);
  };

  window.mmoStartSync();
})();
