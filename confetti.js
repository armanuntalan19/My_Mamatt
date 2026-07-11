/* ============================================================
   confetti.js — shared tulip-petal confetti
   Used identically by index.html and happy_monthsary.html so
   both pages show the exact same falling-tulip effect.
   ============================================================ */

// Same five tones on both pages — this is what keeps the effect identical
// regardless of a light or dark background.
const TULIP_PALETTE = ['#d81159', '#ef6351', '#dfa13a', '#f3a6c4', '#7a2a54'];
// Monthsary reveal page uses real, saturated tulip colors — yellow,
// orange, purple, and red, the way tulips actually grow — instead of
// the index page's pink/crimson-only bouquet.
const MONTHSARY_PALETTE = ['#f7ca18', '#f39c12', '#8e44ad', '#c0392b', '#6c3483'];
const LEAF_TONE = '#3a6b4c';

// A single flat tulip icon — same silhouette used everywhere a tulip
// appears (bouquets, corner accents, falling confetti), so the artwork
// is uniform across every page. Only the bloom color changes; stem and
// leaves stay the same green.
function tulipSVG(bloomColor, leafColor) {
  leafColor = leafColor || LEAF_TONE;
  return (
    '<svg width="100%" height="100%" viewBox="0 0 40 90" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M20,82 L20,38" fill="none" stroke="' + leafColor + '" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M20,78 C10,77 3,70 2,56 C7,64 14,70 20,74 Z" fill="' + leafColor + '"/>' +
      '<path d="M20,78 C30,77 37,70 38,56 C33,64 26,70 20,74 Z" fill="' + leafColor + '"/>' +
      '<g transform="translate(20,32)">' +
        '<path d="M-10.0,-21.4 C-8,-17 -6,-13 -5,-9 C-3,-14 -2,-19 0,-23.3 C2,-19 3,-14 5,-9 C6,-13 8,-17 10.0,-21.4 C14.6,-7.8 14.6,3.9 9.0,9.8 C4.5,12.7 -4.5,12.7 -9.0,9.8 C-14.6,3.9 -14.6,-7.8 -10.0,-21.4 Z" fill="' + bloomColor + '"/>' +
      '</g>' +
    '</svg>'
  );
}

// Spawns a field of gently falling tulip petals inside `containerSelector`.
// Same falling motion/markup on both pages by design — only the
// `palette` of bloom colors differs, so pass MONTHSARY_PALETTE from
// page3-script.js to give that page its own look.
function spawnTulipConfetti(containerSelector, count, palette) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  count = count || 26;
  palette = palette || TULIP_PALETTE;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'tulip-petal';
    const color = palette[Math.floor(Math.random() * palette.length)];
    piece.innerHTML = tulipSVG(color);

    const size = 14 + Math.random() * 16;
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.width = size + 'px';
    piece.style.setProperty('--rot', (Math.random() * 360 - 180) + 'deg');
    piece.style.setProperty('--drift', (Math.random() * 90 - 45) + 'px');
    piece.style.animationDuration = (8 + Math.random() * 9) + 's';
    piece.style.animationDelay = (Math.random() * 10) + 's';
    container.appendChild(piece);
  }
}

window.spawnTulipConfetti = spawnTulipConfetti;
window.tulipSVG = tulipSVG;
window.TULIP_PALETTE = TULIP_PALETTE;
window.MONTHSARY_PALETTE = MONTHSARY_PALETTE;
