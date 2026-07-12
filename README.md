# 💕 Happy 4th Anniversary — Mamatt Theme

A 2-page anniversary surprise with a romantic, portfolio-quality pink design.

## 📄 File Structure

```
index.html    ← Page 1: Cover (swipe/click → my_love.html)
cover.css     ← Cover page styles
script.js     ← Cover page: swipe/click navigation

my_love.html  ← Page 2: The full anniversary surprise (8 sections)
love.css      ← My Love page styles — per-section color palette, cursive type, frames
love.js       ← Fade-in on scroll, vinyl player, lightbox, envelope reveal

lace-heart.svg  ← Decorative hearts (cover page + first section of My Love only)
ribbon.png      ← Decorative ribbon (cover page + first section of My Love only)
gem-chain.svg   ← Decorative chain, used throughout every My Love section
tulip1.png      ← Decorative tulip, used throughout every My Love section
tulip3.png      ← Decorative tulip, used throughout every My Love section
disc.png        ← Decorative music disc, used only in "The Song That Reminds Me of You"
cover.jpg       ← Vinyl label / album cover art
those-eyes.mp3  ← Song for the vinyl player
icon.png        ← Favicon (add your own — not included)
```

Note: `tulip2.png` is referenced in the markup but intentionally not supplied — leave
those `<img>` tags as-is if you don't have a second tulip asset.

## 🎊 Confetti (not currently wired up)

`confetti.js`, `confetti.css`, `page2-script.js`, and `style.css` are kept in the
folder on purpose — they hold the falling-petal confetti system, ready for you to
swap in a custom picture later. They aren't linked from `index.html` or
`my_love.html` right now, so nothing fires until you wire them back in. When you're
ready:

1. Open `confetti.js` and swap the tulip SVG in `tulipSVG()` for your image (or an
   `<img>` piece instead of inline SVG).
2. Add `<link rel="stylesheet" href="confetti.css"/>` and
   `<script src="confetti.js"></script>` to whichever page should show it.
3. Call `spawnConfetti('yourContainerSelector')` (see `confetti.js`) to start it.

## 🚀 Publish to GitHub Pages

1. Create a new repo (e.g. `anniversary`)
2. Upload **all files** in this folder
3. **Settings → Pages → Deploy from branch → main → / (root)**
4. Live at: `https://yourusername.github.io/anniversary`
   - Cover: `index.html`
   - Surprise: `my_love.html` (auto-navigates from cover via swipe or click)

## 🎨 Customise

**Photos** — in `my_love.html`, replace each `<div class="pf-inner photo-placeholder">` with:
```html
<img src="photo1.jpg" alt="us" style="width:100%;height:100%;object-fit:cover;display:block;" />
```
The lightbox (click-to-enlarge) picks up any `<img>` inside a `.photo-frame-wrap` or
`.love-img-wrap` automatically — no JS changes needed.

**Song** — drop your `.mp3` in the folder, update `my_love.html`:
```html
<source src="those-eyes.mp3" type="audio/mpeg" />
```

**Video** — drop your `.mp4` in the folder, update `my_love.html`:
```html
<source src="your-video.mp4" type="video/mp4" />
```

**Story & Message** — edit the `<p>` tags inside `my_love.html`.

Made with love 🌷
