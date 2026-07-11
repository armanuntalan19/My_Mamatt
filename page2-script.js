/* ============================================================
   page2-script.js — Anniversary surprise page (page2.html)
   - Tulip decor + confetti
   - Vinyl disc: autoplay when section scrolls into view,
     pause when it scrolls out, custom play/pause + progress
   ============================================================ */

// ── TULIP DECOR ──────────────────────────────────────────────
function renderDecor() {
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

  const corners = document.querySelectorAll('.tulip-float');
  if (window.tulipSVG) {
    ['#f3a6c4', '#e7b567', '#ef6351', '#d81159'].forEach((c, i) => {
      if (corners[i]) corners[i].innerHTML = window.tulipSVG(c);
    });
  }
}

// ── VINYL PLAYER ─────────────────────────────────────────────
function initVinyl() {
  const audio       = document.getElementById('songAudio');
  const disc        = document.getElementById('vinylDisc');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playIcon    = document.getElementById('playIcon');
  const progressFill = document.getElementById('progressFill');
  const progressBar = document.getElementById('progressBar');
  const songTime    = document.getElementById('songTime');
  const songSection = document.getElementById('songSection');

  if (!audio || !disc) return;

  // ── Helpers ──
  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function setPlaying(state) {
    if (state) {
      audio.play().catch(() => {}); // catch autoplay block gracefully
      disc.classList.add('playing');
      playIcon.textContent = '⏸';
    } else {
      audio.pause();
      disc.classList.remove('playing');
      playIcon.textContent = '▶';
    }
  }

  // ── Play / Pause button ──
  playPauseBtn.addEventListener('click', () => {
    setPlaying(audio.paused);
  });

  // ── Progress bar — update fill and time ──
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = pct + '%';
    songTime.textContent =
      formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);
  });

  // ── Click on progress bar to seek ──
  progressBar.addEventListener('click', e => {
    if (!audio.duration) return;
    const rect = progressBar.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  });

  // ── Autoplay when section is in view (IntersectionObserver) ──
  // Triggers play when ≥40% of the song card is visible,
  // pauses when it leaves view.
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setPlaying(true);
        } else {
          setPlaying(false);
        }
      });
    },
    { threshold: 0.4 }  // 40% visible → autoplay
  );

  observer.observe(songSection);
}

// ── BOOT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderDecor();
  if (window.spawnTulipConfetti) window.spawnTulipConfetti('#confettiField', 26);
  initVinyl();
});
