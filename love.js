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
      audio.play().then(markPlaying).catch(() => startMutedFallback());
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
  // swipe/click that first navigates here from the cover page). Trying
  // unmuted first made refresh unreliable, because that path depended on
  // the fallback firing correctly. So we now always start muted first
  // (guaranteed to succeed) and immediately try to escalate to sound —
  // if that escalation is blocked, we keep the muted playback running
  // (disc still spins, progress still ticks) and unmute the instant the
  // visitor makes any gesture anywhere on the page — no restart, it just
  // gains sound.
  let started = false;
  let unmuteArmed = false;

  function armUnmuteOnGesture() {
    if (unmuteArmed) return;
    unmuteArmed = true;
    const events = ['pointerdown', 'touchend', 'click', 'keydown', 'scroll', 'wheel'];
    const unmute = () => {
      if (!userPaused) {
        audio.muted = false;
        if (audio.paused) audio.play().then(markPlaying).catch(() => {});
      }
      events.forEach(evt => document.removeEventListener(evt, unmute));
    };
    events.forEach(evt => document.addEventListener(evt, unmute, { passive: true }));
  }

  function escalateToSound() {
    if (userPaused) return;
    audio.muted = false;
    const p = audio.play();
    if (p && p.then) {
      p.catch(() => {
        // Sound still blocked (no user gesture yet) — stay muted and
        // silently running; wait for the visitor's first interaction.
        audio.muted = true;
        armUnmuteOnGesture();
      });
    }
  }

  function startMutedFallback() {
    if (started || userPaused) return;
    audio.muted = true;
    const p = audio.play();
    const onStarted = () => { started = true; markPlaying(); escalateToSound(); };
    if (p && p.then) {
      p.then(onStarted).catch(() => {
        // Even muted autoplay was blocked (very rare) — retry on the
        // visitor's first interaction instead of giving up silently.
        document.addEventListener('pointerdown', () => startMutedFallback(), { once: true, passive: true });
        document.addEventListener('touchend',   () => startMutedFallback(), { once: true, passive: true });
      });
    } else {
      onStarted();
    }
  }

  function attemptAutoplay() {
    if (started || userPaused) return; // never override an explicit pause or double-start
    startMutedFallback();
  }

  // Watch the song section and try to start playback any time it scrolls
  // into view. attemptAutoplay() is a no-op once the song has started or
  // the visitor has paused, so this can never restart the track or
  // silently override an explicit pause. We keep observing (rather than
  // disconnecting after the first hit) purely as a safety net in case the
  // very first attempt is retried above.
  const songSection = document.getElementById('sec3');
  if (songSection) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) attemptAutoplay();
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
