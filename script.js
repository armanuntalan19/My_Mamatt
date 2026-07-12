/* script.js — Cover page only */
function goToPage2() {
  window.location.href = 'my_love.html';
}
document.addEventListener('DOMContentLoaded', () => {
  const stage = document.getElementById('coverStage');
  let startX = 0;
  stage.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend',   e => { if (startX - e.changedTouches[0].clientX > 55) goToPage2(); });
  let mx = 0;
  stage.addEventListener('mousedown', e => { mx = e.clientX; });
  stage.addEventListener('mouseup',   e => { if (mx - e.clientX > 55) goToPage2(); });
});
