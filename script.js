/* ============================================================
   script.js — Cover page (index.html)
   Swipe left or click → navigates to my_love.html
   ============================================================ */

// ── NAVIGATE TO PAGE 2 ──────────────────────────────────────
function goToPage2() {
  window.location.href = 'my_love.html';
}

// ── SWIPE + CLICK ────────────────────────────────────────────
function initCover() {
  const stage = document.getElementById('coverStage');

  // Touch swipe left (mobile)
  let startX = 0;
  stage.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', e => {
    if (startX - e.changedTouches[0].clientX > 55) goToPage2();
  });

  // Mouse drag left (desktop)
  let mouseStart = 0;
  stage.addEventListener('mousedown', e => { mouseStart = e.clientX; });
  stage.addEventListener('mouseup',   e => {
    if (mouseStart - e.clientX > 55) goToPage2();
  });

  // Click / keyboard on hint button
  const btn = document.getElementById('swipeBtn');
  btn.addEventListener('click', goToPage2);
  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') goToPage2();
  });
}

// ── TULIP DECOR ──────────────────────────────────────────────
function renderDecor() {
  // Cover bouquet — gold, pink, coral
  const bouquet = document.getElementById('coverBouquet');
  if (bouquet && window.tulipSVG) {
    [
      { color: '#e7b567', size: 52 },
      { color: '#f3a6c4', size: 72 },
      { color: '#ef6351', size: 52 },
    ].forEach(s => {
      const wrap = document.createElement('div');
      wrap.style.width      = s.size + 'px';
      wrap.style.flexShrink = '0';
      wrap.innerHTML = window.tulipSVG(s.color);
      bouquet.appendChild(wrap);
    });
  }

  // Corner ambient tulips
  const corners = document.querySelectorAll('.tulip-float');
  if (window.tulipSVG) {
    ['#f3a6c4', '#e7b567', '#ef6351', '#d81159'].forEach((c, i) => {
      if (corners[i]) corners[i].innerHTML = window.tulipSVG(c);
    });
  }
}

// ── BOOT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initCover();
  renderDecor();
  if (window.spawnTulipConfetti) window.spawnTulipConfetti('#confettiField', 26);
});
