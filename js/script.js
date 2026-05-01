/**
 * QuocHuy MMO - Frontend Logic (Main)
 */

// ─── PARTICLES ─────────────────────────────────────────────────────────────
const canvas = document.getElementById('particles-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize);
  const pts = Array.from({length: 55}, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.8 + 0.4,
    vx: (Math.random() - 0.5) * 0.45,
    vy: (Math.random() - 0.5) * 0.45,
    o: Math.random() * 0.45 + 0.08
  }));
  (function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(24,119,242,${p.o})`;
      ctx.fill();
    });
    requestAnimationFrame(tick);
  })();
}

// ─── HELPER FUNCTIONS ──────────────────────────────────────────────────────
const getCurrentUser = () => window.MMO.getUser();

// ─── HERO SLIDER ───────────────────────────────────────────────────────────
const slides = [...document.querySelectorAll('.slide')];
const dots = [...document.querySelectorAll('.dot')];
const prevBtn = document.getElementById('slider-prev');
const nextBtn = document.getElementById('slider-next');
const progFill = document.getElementById('progress-fill');
const DURATION = 6000;
let cur = 0, timer;

function goTo(idx) {
  if (slides.length === 0) return;
  slides[cur].classList.remove('active');
  dots[cur]?.classList.remove('active');
  cur = (idx + slides.length) % slides.length;
  slides[cur].classList.add('active');
  dots[cur]?.classList.add('active');
  resetProgress();
}

function resetProgress() {
  clearTimeout(timer);
  if (progFill) {
    progFill.style.transition = 'none';
    progFill.style.width = '0%';
    requestAnimationFrame(() => {
      progFill.style.transition = `width ${DURATION}ms linear`;
      progFill.style.width = '100%';
    });
  }
  timer = setTimeout(() => goTo(cur + 1), DURATION);
}

if (slides.length > 0) {
  prevBtn?.addEventListener('click', () => goTo(cur - 1));
  nextBtn?.addEventListener('click', () => goTo(cur + 1));
  dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.index)));
  resetProgress();
}

// ─── CART UI ────────────────────────────────────────────────────────────────
function refreshCartUI() {
  const cart = JSON.parse(localStorage.getItem('mmo_cart') || '[]');
  const badge = document.getElementById('cart-badge');
  const amount = document.getElementById('cart-amount');
  const total = cart.reduce((s, i) => s + (i.price * i.qty), 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  if (badge) badge.textContent = count;
  if (amount) amount.textContent = window.MMO.fmt(total);
}
refreshCartUI();

// ─── BINDING EVENTS ─────────────────────────────────────────────────────────
document.addEventListener('click', function(e) {
  // Buy Button Logic
  if (e.target.closest('.buy-btn')) {
    const btn = e.target.closest('.buy-btn');
    const card = btn.closest('.product-card');
    const name = card.querySelector('.card-name')?.textContent || 'Sản phẩm';
    const priceText = card.querySelector('.price-new')?.textContent || '0';
    const price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
    const id = card.id;

    let cart = JSON.parse(localStorage.getItem('mmo_cart') || '[]');
    const existing = cart.find(i => i.id === id);
    if (existing) { existing.qty++; } else {
      cart.push({ 
        id, name, price, qty: 1, 
        icon: card.querySelector('.card-icon i')?.className || 'fas fa-box',
        color: 'var(--primary), var(--primary-dark)'
      });
    }
    localStorage.setItem('mmo_cart', JSON.stringify(cart));
    refreshCartUI();
    window.MMO.notify(`Đã thêm ${name} vào giỏ!`);

    // Animation effect
    btn.classList.add('pulse');
    setTimeout(() => btn.classList.remove('pulse'), 500);
  }

  // Wishlist Logic
  if (e.target.closest('.card-wish')) {
    const btn = e.target.closest('.card-wish');
    btn.classList.toggle('active');
    const isAct = btn.classList.contains('active');
    btn.querySelector('i').className = isAct ? 'fas fa-heart' : 'far fa-heart';
    window.MMO.notify(isAct ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích');
  }
});

// ─── AUTH STATUS ────────────────────────────────────────────────────────────
function updateAuthUI() {
  const user = window.MMO.getUser();
  const authTexts = document.querySelector('.auth-texts');
  const walletBtn = document.getElementById('wallet-btn');
  if (user) {
    if (walletBtn) {
      walletBtn.style.display = 'flex';
      document.getElementById('wallet-amount').textContent = window.MMO.fmt(user.balance);
    }
    if (authTexts) {
      authTexts.innerHTML = `
        <span style="font-size:11px; font-weight:700;">${user.name}</span>
        <a href="#" id="link-logout" style="font-size:10px; color:red;">ĐĂNG XUẤT</a>
      `;
      document.getElementById('link-logout').onclick = () => {
        localStorage.removeItem('mmo_currentUser');
        location.reload();
      };
    }
  }
}
updateAuthUI();

console.log('🚀 QuocHuy.MMO Script Ready');
