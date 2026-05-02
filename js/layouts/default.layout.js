/**
 * DefaultLayout – QuocHuy MMO
 * ============================================================
 * Standard layout cho user thường.
 * Blue theme, không có premium features.
 * ============================================================
 */

'use strict';

const DefaultLayout = {
  id: 'default',

  // CSS variables cho theme
  cssVars: {
    '--bg-body':      '#f0f4f8',
    '--card-bg':      '#ffffff',
    '--border':       '#e2e8f0',
    '--text':         '#1e293b',
    '--text-muted':   '#64748b',
    '--primary':      '#1877f2',
    '--primary-dark': '#1251a3',
    '--accent':       '#1877f2',
    '--header-bg':    '#0c1445',
    '--nav-bg':       '#ffffff',
  },

  // Apply layout lên document
  apply() {
    document.body.setAttribute('data-layout', 'default');

    // Remove premium class nếu có
    document.body.classList.remove('layout-premium');
    document.body.classList.add('layout-default');

    // Ẩn premium-only elements
    document.querySelectorAll('[data-premium-only]').forEach(el => {
      el.style.display = 'none';
    });

    // Hiện default-only elements
    document.querySelectorAll('[data-default-only]').forEach(el => {
      el.style.display = '';
    });

    // Remove premium badge trong header nếu có
    const badge = document.getElementById('premium-member-badge');
    if (badge) badge.remove();

    // Ẩn flash sale chỉ premium
    const flashSale = document.getElementById('premium-flash-sale');
    if (flashSale) flashSale.style.display = 'none';
  },

  // Render header badge (không có gì cho default)
  renderBadge() {
    return '';
  },
};

window.DefaultLayout = DefaultLayout;
console.log('✅ DefaultLayout loaded');
