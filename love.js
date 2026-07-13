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

  /* ── Persisted music state ────────────────────────────────
     Survives page refreshes and stays in sync across every page/tab
     that shares this origin — the source of truth lives in
     localStorage instead of only in memory, so a reload can never
     "forget" that the visitor paused the song. */
  const STORAGE_KEY = 'mamattMusicState';

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; } // localStorage unavailable (private mode, etc.) — degrade gracefully
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        state,                    // 'playing' | 'paused'
        time: audio.currentTime,  // resume near where it left off
        savedAt: Date.now()
      }));
    } catch (e) { /* ignore — playback still works, it just won't persist */ }
  }

  function restoreTime(t) {
    if (typeof t !== 'number' || !isFinite(t) || t <= 0) return;
    const apply = () => { try { audio.currentTime = t; } catch (e) {} };
    if (audio.readyState >= 1) apply(); // HAVE_METADATA already available
    else audio.addEventListener('loadedmetadata', apply, { once: true });
  }

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
    saveState(state ? 'playing' : 'paused');
  }

  playBtn.addEventListener('click', () => setPlay(audio.paused));

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    fill.style.width = (audio.currentTime / audio.duration * 100) + '%';
    timeEl.textContent = fmt(audio.currentTime) + ' / ' + fmt(audio.duration);
  });

  // Keep the saved position fresh while playing (throttled) so a refresh
  // resumes close to where the visitor actually left off.
  let lastSave = 0;
  audio.addEventListener('timeupdate', () => {
    const now = Date.now();
    if (now - lastSave > 3000) {
      lastSave = now;
      saveState(audio.paused ? 'paused' : 'playing');
    }
  });

  // Belt-and-suspenders: also snapshot state right before the tab/page
  // goes away, so a refresh or close never leaves stale/half-written state.
  const snapshot = () => saveState(audio.paused ? 'paused' : 'playing');
  window.addEventListener('pagehide', snapshot);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') snapshot();
  });

  // Keep multiple tabs/pages of the site in sync: if the song is
  // paused/played in one tab, mirror it here instantly.
  window.addEventListener('storage', e => {
    if (e.key !== STORAGE_KEY || !e.newValue) return;
    let s;
    try { s = JSON.parse(e.newValue); } catch (err) { return; }
    if (s.state === 'paused' && !audio.paused) {
      audio.pause();
      disc.classList.remove('playing');
      playIcon.textContent = '▶';
    } else if (s.state === 'playing' && audio.paused) {
      audio.muted = false;
      audio.play().then(() => {
        disc.classList.add('playing');
        playIcon.textContent = '⏸';
      }).catch(()=>{});
    }
  });

  bar.addEventListener('click', e => {
    if (!audio.duration) return;
    const r = bar.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  });

  // Autoplay when the song section scrolls into view (first-ever visit only).
  // After that, playback is controlled ONLY by the Pause button and the
  // persisted state above — scrolling away, switching tabs, or refreshing
  // must never silently override a choice the visitor already made.
  //
  // Browsers reliably allow MUTED autoplay but usually block unmuted
  // autoplay without a user gesture. To avoid the song silently failing
  // to start, we try unmuted first; if that's blocked we immediately
  // fall back to starting it muted (so the disc + timeline are already
  // running) and unmute the instant the visitor makes any gesture
  // anywhere on the page — no restart, it just gains sound.
  let unmuteArmed = false;

  function markPlaying() {
    disc.classList.add('playing');
    playIcon.textContent = '⏸';
    saveState('playing');
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

  const saved = loadState();

  if (saved && saved.state === 'paused') {
    // The visitor explicitly paused before this refresh — respect that.
    // Restore the position they were at, but do NOT auto-resume, and
    // don't even attach the scroll-triggered autoplay watcher: the
    // visitor already made their choice, so autoplay must stay silent.
    restoreTime(saved.time);
    disc.classList.remove('playing');
    playIcon.textContent = '▶';
  } else if (saved && saved.state === 'playing') {
    // It was playing before this refresh — resume right away instead of
    // waiting for the visitor to scroll back down to the song section.
    restoreTime(saved.time);
    attemptAutoplay();
  } else {
    // First-ever visit on this device — autoplay the moment the song
    // section scrolls into view, exactly as before.
    const songSection = document.getElementById('sec3');
    if (songSection) {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            attemptAutoplay();
            obs.unobserve(songSection); // only ever auto-triggers once — from here on, only the button/persisted state controls playback
          }
        });
      }, { threshold: 0.45 });
      obs.observe(songSection);
    }
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
