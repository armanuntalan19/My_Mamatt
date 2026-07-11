/* ============================================================
   page2-script.js — Anniversary surprise page (page2.html)
   Handles tulip decor and falling confetti only.
   No page-switching logic needed — navigation is done via
   window.location.href from index.html's script.js.
   ============================================================ */

// ── TULIP DECOR ──────────────────────────────────────────────
function renderDecor() {
  // Hero section bouquet — crimson, gold, crimson
  const heroTulips = document.getElementById('heroTulips');
  if (heroTulips && window.tulipSVG) {
    [
      { color: '#d81159', size: 40 },
      { color: '#c9922e', size: 56 },
      { color: '#d81159', size: 40 },
    ].forEach(s => {
      const wrap = document.createElement('div');
      wrap.style.width      = s.size + 'px';
      wrap.style.flexShrink = '0';
      wrap.innerHTML = window.tulipSVG(s.color);
      heroTulips.appendChild(wrap);
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
  renderDecor();
  if (window.spawnTulipConfetti) window.spawnTulipConfetti('#confettiField', 26);
});
