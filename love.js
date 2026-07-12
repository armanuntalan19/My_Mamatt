/* ============================================================
   love.js — Happy Anniversary · My Love Page
   Handles: fade-in on scroll, vinyl player, lightbox, envelope
   ============================================================ */

/* ── FADE IN ON SCROLL ─────────────────────────────────────── */
function initFadeIn() {
  const els = document.querySelectorAll('.fade-in');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.15 });
  els.forEach(el => obs.observe(el));
}

/* ── VINYL PLAYER ──────────────────────────────────────────── */
function initVinyl() {
  const audio    = document.getElementById('songAudio');
  const disc     = document.getElementById('vinylDisc');
  const playBtn  = document.getElementById('playPauseBtn');
  const playIcon = document.getElementById('playIcon');
  const fill     = document.getElementById('progressFill');
  const bar      = document.getElementById('progressBar');
  const timeEl   = document.getElementById('songTime');
  if (!audio || !disc) return;

  function fmt(s) { const m=Math.floor(s/60); const sec=Math.floor(s%60); return m+':'+(sec<10?'0':'')+sec; }

  function setPlay(state) {
    if (state) {
      audio.play().catch(()=>{});
      disc.classList.add('playing');   // starts both vinylSpin + vinylCounterSpin
      playIcon.textContent = '⏸';
    } else {
      audio.pause();
      disc.classList.remove('playing'); // pauses both animations immediately
      playIcon.textContent = '▶';
    }
  }

  playBtn.addEventListener('click', () => setPlay(audio.paused));

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    fill.style.width = (audio.currentTime / audio.duration * 100) + '%';
    timeEl.textContent = fmt(audio.currentTime) + ' / ' + fmt(audio.duration);
  });

  bar.addEventListener('click', e => {
    if (!audio.duration) return;
    const r = bar.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  });

  // Autoplay when section enters view
  const songSection = document.getElementById('sec3');
  if (songSection) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { setPlay(e.isIntersecting); });
    }, { threshold: 0.45 });
    obs.observe(songSection);
  }
}

/* ── LIGHTBOX ──────────────────────────────────────────────── */
function openLightbox(el) {
  const img    = el.querySelector('img');
  const lb     = document.getElementById('lightbox');
  const lbImg  = document.getElementById('lbImg');
  if (!lb) return;
  if (img) {
    lbImg.src = img.src;
    lbImg.alt = img.alt;
  } else {
    // placeholder — no real image yet
    return;
  }
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.classList.remove('open');
  document.body.style.overflow = '';
}

function initLightbox() {
  const lb    = document.getElementById('lightbox');
  const close = document.getElementById('lbClose');
  if (!lb) return;
  close.addEventListener('click', closeLightbox);
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}

/* ── ENVELOPE ──────────────────────────────────────────────── */
function openEnvelope() {
  const env    = document.getElementById('envelope');
  const letter = document.getElementById('letter');
  if (!env || env.classList.contains('opened')) return;
  env.classList.add('opened');
  // Slide letter up after flap starts opening
  setTimeout(() => { letter.classList.add('revealed'); }, 420);
}

/* ── BOOT ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initFadeIn();
  initVinyl();
  initLightbox();
  // envelope click is inline onclick in HTML
});
