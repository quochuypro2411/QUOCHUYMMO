(() => {
  'use strict';

  // ─── PARTICLES ─────────────────────────────────────────────────────────────
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
    resize();
    addEventListener('resize', resize);
    const pts = Array.from({length: 55}, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
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

  function getCurrentUser() { return window.MMO.getUser(); }
  function isAdminUser() {
    const user = getCurrentUser();
    return user && (user.role === 'admin' || user.isAdmin);
  }
  if (isAdminUser()) {
    const page = location.pathname.split('/').pop();
    if (page !== 'admin.html' && page !== 'auth.html') {
      window.location.href = 'admin.html';
      return;
    }
  }

  // ─── HERO SLIDER ───────────────────────────────────────────────────────────
  const slides   = [...document.querySelectorAll('.slide')];
  const dots     = [...document.querySelectorAll('.dot')];
  const prevBtn  = document.getElementById('slider-prev');
  const nextBtn  = document.getElementById('slider-next');
  const progFill = document.getElementById('progress-fill');
  const DURATION = 6000;
  let cur = 0, timer, statsAnimated = new Set();

  function animateSlide(slide) {
    if (statsAnimated.has(slide)) return;
    statsAnimated.add(slide);
    slide.querySelectorAll('.stat-num').forEach(el => {
      const target = +el.dataset.count;
      const dur = 1200;
      const step = 16;
      const inc = target / (dur / step);
      let val = 0;
      const t = setInterval(() => {
        val = Math.min(val + inc, target);
        el.textContent = Math.round(val).toLocaleString('vi-VN');
        if (val >= target) clearInterval(t);
      }, step);
    });
  }

  function goTo(idx) {
    slides[cur].classList.remove('active');
    dots[cur].classList.remove('active');
    cur = (idx + slides.length) % slides.length;
    slides[cur].classList.add('active');
    dots[cur].classList.add('active');
    animateSlide(slides[cur]);
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

  if (slides.length) {
    prevBtn?.addEventListener('click', () => goTo(cur - 1));
    nextBtn?.addEventListener('click', () => goTo(cur + 1));
    dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.index)));
    // Touch swipe
    let touchX = 0;
    const hero = document.getElementById('hero-slider');
    hero?.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, {passive: true});
    hero?.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) goTo(dx < 0 ? cur + 1 : cur - 1);
    }, {passive: true});
    animateSlide(slides[0]);
    resetProgress();
  }

  // ─── PRODUCT SLIDERS (drag scroll) ─────────────────────────────────────────
  document.querySelectorAll('.product-grid').forEach(grid => {
    grid.style.overflowX = 'auto';
    grid.style.scrollbarWidth = 'none';
    let startX, scrollLeft, dragging = false;
    grid.addEventListener('mousedown', e => {
      dragging = true; startX = e.pageX - grid.offsetLeft; scrollLeft = grid.scrollLeft;
      grid.style.cursor = 'grabbing'; e.preventDefault();
    });
    document.addEventListener('mouseup', () => { dragging = false; grid.style.cursor = 'grab'; });
    grid.addEventListener('mousemove', e => {
      if (!dragging) return;
      const x = e.pageX - grid.offsetLeft;
      grid.scrollLeft = scrollLeft - (x - startX) * 1.5;
    });
    grid.style.cursor = 'grab';
  });

  // Prev / Next buttons for product sliders
  document.querySelectorAll('.prev-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const g = document.getElementById(btn.dataset.target);
      g?.scrollBy({left: -240, behavior: 'smooth'});
    });
  });
  document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const g = document.getElementById(btn.dataset.target);
      g?.scrollBy({left: 240, behavior: 'smooth'});
    });
  });

  // ─── CART SYSTEM (localStorage) ─────────────────────────────────────────────
  function getCart() {
    try { return JSON.parse(localStorage.getItem('mmo_cart')) || []; } catch(e) { return []; }
  }
  function saveCart(cart) { localStorage.setItem('mmo_cart', JSON.stringify(cart)); }
  function refreshCartUI() {
    const cart = getCart();
    const badge = document.getElementById('cart-badge');
    const amount = document.getElementById('cart-amount');
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const count = cart.reduce((s, i) => s + i.qty, 0);
    if (badge) badge.textContent = count;
    if (amount) amount.textContent = total ? window.MMO.fmt(total) : '0 đ';
  }
  refreshCartUI();

  document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const card = this.closest('.product-card');
      const name = card?.querySelector('.card-name')?.textContent?.trim() || 'Sản phẩm';
      const priceText = card?.querySelector('.price-new')?.textContent?.trim() || '';
      const oldText = card?.querySelector('.price-old')?.textContent?.trim() || '';
      const priceNum = parseInt(priceText.replace(/[^\d]/g, '')) || 45000;
      const oldNum = parseInt(oldText.replace(/[^\d]/g, '')) || priceNum;
      const desc = card?.querySelector('.card-desc')?.textContent?.trim() || '';
      const id = card?.id || 'item-' + Date.now();
      // Detect icon type
      const hasFb = !!card?.querySelector('.fab.fa-facebook-f');
      const icon = hasFb ? 'fab fa-facebook-f' : 'fas fa-envelope';
      const color = hasFb ? '#1877F2,#0c5dc7' : '#EA4335,#d33426';

      // Add to cart
      const cart = getCart();
      const existing = cart.find(i => i.id === id);
      if (existing) { existing.qty++; } else {
        cart.push({ id, name, price: priceNum, oldPrice: oldNum, desc, qty: 1, icon, color });
      }
      saveCart(cart);
      refreshCartUI();

      // Animate button
      const orig = this.innerHTML;
      this.innerHTML = '<i class="fas fa-check"></i> Đã thêm!';
      this.style.background = 'linear-gradient(135deg,#25D366,#1ab953)';
      setTimeout(() => { this.innerHTML = orig; this.style.background = ''; }, 1600);

      const badge = document.getElementById('cart-badge');
      badge?.animate([{transform:'scale(1.6)'},{transform:'scale(1)'}], {duration:250,easing:'ease'});
      window.MMO.notify(`Đã thêm "${name.substring(0,30)}..." vào giỏ!`, false);
    });
  });

  // ─── WISHLIST ───────────────────────────────────────────────────────────────
  document.querySelectorAll('.card-wish').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      this.classList.toggle('active');
      const i = this.querySelector('i');
      if (this.classList.contains('active')) {
        i.classList.replace('far','fas');
        notify('Đã thêm vào yêu thích!', 'success');
      } else {
        i.classList.replace('fas','far');
      }
    });
  });

  // ─── QUICK VIEW MODAL ──────────────────────────────────────────────────────
  const overlay   = document.getElementById('modal-overlay');
  const mClose    = document.getElementById('modal-close');
  const mTitle    = document.getElementById('modal-title');
  const mDesc     = document.getElementById('modal-desc');
  const mPrice    = document.getElementById('modal-price');
  const mOldPrice = document.getElementById('modal-old-price');

  document.querySelectorAll('.qview-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const card = this.closest('.product-card');
      if (!card || !overlay) return;
      if (mTitle)    mTitle.textContent    = card.querySelector('.card-name')?.textContent || '';
      if (mDesc)     mDesc.textContent     = card.querySelector('.card-desc')?.textContent || '';
      if (mPrice)    mPrice.textContent    = card.querySelector('.price-new')?.textContent || '';
      if (mOldPrice) mOldPrice.textContent = card.querySelector('.price-old')?.textContent || '';
      overlay.classList.add('active');
    });
  });
  mClose?.addEventListener('click', () => overlay.classList.remove('active'));
  overlay?.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('active'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay?.classList.remove('active'); });

  // ─── STATS COUNTER ─────────────────────────────────────────────────────────
  const statsSection = document.getElementById('stats-section');
  let statsTriggered = false;
  const statsObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !statsTriggered) {
      statsTriggered = true;
      statsSection.querySelectorAll('.stat-card-num').forEach(el => {
        const target = +el.dataset.count;
        const isPercent = target <= 100;
        const dur = 1800;
        const step = 20;
        const inc = target / (dur / step);
        let val = 0;
        const t = setInterval(() => {
          val = Math.min(val + inc, target);
          const rounded = Math.round(val);
          el.textContent = rounded.toLocaleString('vi-VN') + (isPercent && target === 99 ? '%' : '+');
          if (val >= target) clearInterval(t);
        }, step);
      });
    }
  }, {threshold: 0.25});
  if (statsSection) statsObs.observe(statsSection);

  // ─── SCROLL ANIMATIONS ─────────────────────────────────────────────────────
  const animObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); animObs.unobserve(e.target); }
    });
  }, {threshold: 0.08, rootMargin: '0px 0px -20px 0px'});
  document.querySelectorAll('.anim-up').forEach(el => animObs.observe(el));

  // ─── BACK TO TOP ───────────────────────────────────────────────────────────
  const backTop = document.getElementById('back-top');
  addEventListener('scroll', () => backTop?.classList.toggle('show', scrollY > 350), {passive:true});
  backTop?.addEventListener('click', () => scrollTo({top:0,behavior:'smooth'}));

  // ─── NAV ACTIVE ────────────────────────────────────────────────────────────
  document.querySelectorAll('.nav-item').forEach(li => {
    li.querySelector('a')?.addEventListener('click', function() {
      document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
      li.classList.add('active');
    });
  });

  // ─── STICKY NAV HIGHLIGHT ──────────────────────────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  addEventListener('scroll', () => {
    let cur = '';
    sections.forEach(s => { if (scrollY >= s.offsetTop - 140) cur = s.id; });
    document.querySelectorAll('.nav-item a').forEach(a => {
      a.parentElement.classList.toggle('active', a.getAttribute('href') === `#${cur}`);
    });
  }, {passive:true});

  // ─── NOTIFICATION ──────────────────────────────────────────────────────────
  function notify(msg, type = 'info') {
    document.querySelectorAll('.notif').forEach(n => n.remove());
    const el = document.createElement('div');
    el.className = 'notif';
    el.style.cssText = 'animation:notifIn .4s ease';
    const icons = {success:'check-circle', error:'times-circle', info:'info-circle'};
    el.innerHTML = `
      <div class="notif-inner">
        <div class="notif-ico ${type}"><i class="fas fa-${icons[type]||icons.info}"></i></div>
        <span class="notif-msg">${msg}</span>
        <button class="notif-close" onclick="this.closest('.notif').remove()"><i class="fas fa-times"></i></button>
      </div>
      <div class="notif-bar ${type}"></div>`;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.animation = 'notifOut .4s ease forwards';
      setTimeout(() => el.remove(), 400);
    }, 3200);
  }

  // ─── CHAT BUTTON ───────────────────────────────────────────────────────────
  document.getElementById('chat-btn')?.addEventListener('click', () => {
    window.open('https://m.me/', '_blank');
  });

  // ─── HEADER SHRINK ON SCROLL ───────────────────────────────────────────────
  const header = document.getElementById('header');
  addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', scrollY > 60);
  }, {passive:true});

  // ─── AUTHENTICATION SYSTEM ──────────────────────────────────────────────────
  function checkAuthStatus() {
    try {
      let currentUser = JSON.parse(localStorage.getItem('mmo_currentUser'));
      const authTexts = document.querySelector('.auth-texts');
      const walletBtn = document.getElementById('wallet-btn');
      const walletAmount = document.getElementById('wallet-amount');
      
      if (currentUser) {
        const users = JSON.parse(localStorage.getItem('mmo_users')) || [];
        const latestUser = users.find(u => u.email === currentUser.email);
        if (latestUser) {
          currentUser = latestUser;
          localStorage.setItem('mmo_currentUser', JSON.stringify(currentUser));
        }

        if (walletBtn) walletBtn.style.display = 'flex';
        if (walletAmount) walletAmount.textContent = (currentUser.balance || 0).toLocaleString('vi-VN') + ' đ';

        if (authTexts) {
          authTexts.innerHTML = `
            <span style="font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:1px;display:block;">Xin chào,</span>
            <span style="font-size:13px;font-weight:800;color:var(--text-primary);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100px;display:block;">${currentUser.name}</span>
            <a href="#" id="link-logout" style="color:var(--accent-red);font-size:10px;font-weight:700;margin-top:2px;">ĐĂNG XUẤT</a>
          `;
          document.getElementById('link-logout')?.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('mmo_currentUser');
            window.location.reload();
          });
        }
      } else {
        if (walletBtn) walletBtn.style.display = 'none';
      }
    } catch(e) {}
  }
  checkAuthStatus();

  // ─── NOTIFICATION LOGIC ──────────────────────────────────────────────────────
  function renderNotifications(currentUser) {
    const notifBtn = document.getElementById('notif-btn');
    if (!notifBtn) return;
    if (!currentUser) {
      notifBtn.style.display = 'none';
      return;
    }
    
    notifBtn.style.display = 'flex';
    let globalNotifs = [];
    try { globalNotifs = JSON.parse(localStorage.getItem('mmo_global_notifications')) || []; } catch(e) {}
    
    let personalNotifs = currentUser.notifications || [];
    let allNotifs = [...globalNotifs, ...personalNotifs];
    allNotifs.sort((a,b) => new Date(b.date) - new Date(a.date));
    
    const readIds = currentUser.readNotifs || [];
    const unreadCount = allNotifs.filter(n => !n.read && !readIds.includes(n.id)).length;
    
    const badge = document.getElementById('notif-badge');
    if (badge) {
      badge.style.display = unreadCount > 0 ? 'flex' : 'none';
      badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
    }
    
    const list = document.getElementById('notif-list');
    if (list) {
      if (allNotifs.length === 0) {
        list.innerHTML = '<div class="notif-empty">Bạn chưa có thông báo nào.</div>';
      } else {
        list.innerHTML = allNotifs.map(n => {
          const isRead = n.read || readIds.includes(n.id);
          const typeClass = n.type || 'info';
          return `
            <div class="notif-item ${isRead ? '' : 'unread'} ${typeClass}">
              <div class="notif-title">${n.title}</div>
              <div class="notif-msg">${n.message}</div>
              <div class="notif-date">${new Date(n.date).toLocaleString('vi-VN')}</div>
            </div>
          `;
        }).join('');
      }
    }
  }

  window.markAllNotifRead = function(e) {
    if(e) e.stopPropagation();
    let currentUser = JSON.parse(localStorage.getItem('mmo_currentUser'));
    if (!currentUser) return;
    
    let globalNotifs = [];
    try { globalNotifs = JSON.parse(localStorage.getItem('mmo_global_notifications')) || []; } catch(e) {}
    
    if (currentUser.notifications) {
      currentUser.notifications.forEach(n => n.read = true);
    }
    currentUser.readNotifs = globalNotifs.map(n => n.id);
    
    const users = JSON.parse(localStorage.getItem('mmo_users')) || [];
    const idx = users.findIndex(u => u.email === currentUser.email);
    if (idx !== -1) {
      users[idx] = currentUser;
      localStorage.setItem('mmo_users', JSON.stringify(users));
    }
    localStorage.setItem('mmo_currentUser', JSON.stringify(currentUser));
    
    renderNotifications(currentUser);
  };
  
  const notifBtn = document.getElementById('notif-btn');
  if (notifBtn) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifBtn.classList.toggle('show');
    });
    document.getElementById('notif-dropdown')?.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    document.addEventListener('click', (e) => {
      if (!notifBtn.contains(e.target)) {
        notifBtn.classList.remove('show');
      }
    });
    
    const currentUser = JSON.parse(localStorage.getItem('mmo_currentUser'));
    renderNotifications(currentUser);
  }

  // Listen for global notifications sync from Cloud
  window.addEventListener('mmo_global_notifs_synced', (e) => {
    console.log("[Script] Global notifs synced, updating UI...");
    const notifs = e.detail || [];
    const marquee = document.querySelector('.marquee-text');
    if (marquee && notifs.length > 0) {
      marquee.innerHTML = notifs.map(n => `<span><i class="fas fa-bullhorn"></i>&nbsp;${n.title}: ${n.message} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>`).join('');
    }
  });

  console.log('🚀 QuocHuy.MMO loaded – Premium Edition');
})();
