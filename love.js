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

  // Keeps the ▶/⏸ glyph visually centered inside the round button —
  // the play triangle needs a tiny optical nudge that pause doesn't.
  function setIcon(isPlaying) {
    playIcon.textContent = isPlaying ? '⏸' : '▶';
    playIcon.classList.toggle('icon-play', !isPlaying);
  }

  // No persistence on purpose: every fresh open/refresh of the site
  // should start the song from 0:00, never resume a previous position.
  audio.currentTime = 0;

  // True only when the visitor themselves hits the pause button — this is
  // the ONLY thing that's allowed to keep the song silent. Scrolling away
  // from the section, switching tabs, etc. never sets this, so playback
  // (once started) keeps going until the visitor chooses to pause it.
  let userPaused = false;

  function markPlaying() {
    disc.classList.add('playing');
    setIcon(true);
  }

  function markPaused() {
    disc.classList.remove('playing');
    setIcon(false);
  }

  function setPlay(state) {
    if (state) {
      userPaused = false;
      audio.muted = false;
      audio.play().then(() => {
        markPlaying();
        started = true;
        unlocked = true;
        deactivateUnlockListeners();
      }).catch(() => startMutedFallback());
    } else {
      userPaused = true;
      audio.pause();
      markPaused();
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

  // Autoplay the FIRST time the song section scrolls into view. The only
  // thing that can keep the music silent afterwards is the visitor
  // explicitly hitting the pause button (userPaused === true) — scrolling
  // away and back, tab switches, page refreshes, etc. never stop it once
  // it has started.
  //
  // IMPORTANT: Chrome ALWAYS allows a MUTED play() to start, with or
  // without a prior user gesture. It only blocks UNMUTED autoplay when
  // there's no recent user activation — which is exactly what happens on
  // a hard refresh (a reload carries no "gesture" with it, unlike the
  // swipe/click that first navigates here from the cover page). So we
  // always start muted first (guaranteed to succeed) and immediately try
  // to escalate to sound. If that escalation is blocked, we keep the
  // muted playback running (disc still spins, progress still ticks) and
  // unmute on the visitor's next gesture — but ONLY a gesture that
  // happens on the song section itself, while it's actually on screen.
  // Interacting with some other part of the site, far from this
  // section, should never be what turns the sound on.
  const songSection = document.getElementById('sec3');
  let started = false;
  let unlocked = false;
  let listenersActive = false;
  const unlockEvents = ['pointerdown', 'touchend', 'click', 'keydown', 'wheel'];

  function tryUnlock() {
    if (unlocked || userPaused) return;
    audio.muted = false;
    const p = audio.play();
    const done = () => { unlocked = true; markPlaying(); deactivateUnlockListeners(); };
    if (p && p.then) p.then(done).catch(() => { audio.muted = true; });
    else done();
  }

  function activateUnlockListeners() {
    if (listenersActive || unlocked || !songSection) return;
    listenersActive = true;
    unlockEvents.forEach(evt => songSection.addEventListener(evt, tryUnlock, { passive: true }));
  }

  function deactivateUnlockListeners() {
    if (!listenersActive || !songSection) return;
    listenersActive = false;
    unlockEvents.forEach(evt => songSection.removeEventListener(evt, tryUnlock));
  }

  function startMutedFallback() {
    if (started || userPaused) return;
    audio.muted = true;
    const p = audio.play();
    const onStarted = () => {
      started = true;
      markPlaying();
      tryUnlock();               // try immediately — we're on the section right now
      if (!unlocked) activateUnlockListeners(); // else wait for a gesture, but only on this section
    };
    if (p && p.then) {
      p.then(onStarted).catch(() => {
        // Even muted autoplay was blocked (very rare) — retry the next
        // time the visitor interacts with the song section.
        if (songSection) {
          const retry = () => { songSection.removeEventListener('pointerdown', retry); songSection.removeEventListener('touchend', retry); startMutedFallback(); };
          songSection.addEventListener('pointerdown', retry, { once: true, passive: true });
          songSection.addEventListener('touchend', retry, { once: true, passive: true });
        }
      });
    } else {
      onStarted();
    }
  }

  function attemptAutoplay() {
    if (started || userPaused) return; // never override an explicit pause or double-start
    startMutedFallback();
  }

  // Watch the song section: start playback (and arm the sound-unlock
  // listeners) whenever it's on screen; disarm those listeners the
  // moment it scrolls out of view, so a gesture elsewhere on the site
  // can never be what turns the sound on.
  if (songSection) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          attemptAutoplay();
          if (started && !unlocked) activateUnlockListeners();
        } else {
          deactivateUnlockListeners();
        }
      });
    }, { threshold: 0.4 });
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
