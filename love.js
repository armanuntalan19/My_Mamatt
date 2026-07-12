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
      audio.muted = false;
      audio.play().catch(()=>{});
      disc.classList.add('playing');   // starts vinylSpin — the cover spins with it, no separate animation needed
      playIcon.textContent = '⏸';
    } else {
      audio.pause();
      disc.classList.remove('playing'); // pauses the spin immediately
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

  // Autoplay when the song section scrolls into view.
  // After that, playback is controlled only by the Pause button —
  // scrolling away must not stop the rotation or the audio.
  //
  // Browsers reliably allow MUTED autoplay but usually block unmuted
  // autoplay without a user gesture. To avoid the song silently failing
  // to start, we try unmuted first; if that's blocked we immediately
  // fall back to starting it muted (so the disc + timeline are already
  // running) and unmute the instant the visitor makes any gesture
  // anywhere on the page — no restart, it just gains sound.
  let songInView = false;
  let unmuteArmed = false;

  function markPlaying() {
    disc.classList.add('playing');
    playIcon.textContent = '⏸';
  }

  function armUnmuteOnGesture() {
    if (unmuteArmed) return;
    unmuteArmed = true;
    const unmute = () => {
      audio.muted = false;
      if (audio.paused) audio.play().catch(()=>{});
      ['pointerdown', 'touchend', 'click', 'keydown', 'scroll', 'wheel'].forEach(evt =>
        document.removeEventListener(evt, unmute)
      );
    };
    ['pointerdown', 'touchend', 'click', 'keydown', 'scroll', 'wheel'].forEach(evt =>
      document.addEventListener(evt, unmute, { passive: true })
    );
  }

  function startMutedFallback() {
    if (!audio.paused) return;
    audio.muted = true;
    const p = audio.play();
    if (p && p.then) {
      p.then(() => { markPlaying(); armUnmuteOnGesture(); }).catch(() => {});
    }
  }

  function attemptAutoplay() {
    if (!audio.paused) return;
    audio.muted = false;
    const p = audio.play();
    if (p && p.then) {
      p.then(markPlaying).catch(startMutedFallback);
    } else {
      // Older browsers without a promise-based play(): assume it worked.
      markPlaying();
    }
  }

  const songSection = document.getElementById('sec3');
  if (songSection) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !songInView) {
          songInView = true;
          attemptAutoplay();
          obs.unobserve(songSection);
        }
      });
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
