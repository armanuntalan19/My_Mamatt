# 💕 Happy 4th Anniversary — Mamatt Theme

A 2-page anniversary surprise themed to match the love-question project.

## 📄 File Structure

```
index.html       ← Page 1: Cover (swipe/click → page2.html)
page2.html       ← Page 2: The full anniversary surprise (8 sections)
style.css        ← All styles — Mamatt theme, zero padding between sections
script.js        ← Cover page: swipe/click + tulip decor + confetti
page2-script.js  ← Surprise page: tulip decor + confetti
confetti.js      ← Shared falling-tulip system
confetti.css     ← Confetti animation styles
icon.png         ← Favicon
```

## 🚀 Publish to GitHub Pages

1. Create a new repo (e.g. `anniversary`)
2. Upload **all files** in this folder
3. **Settings → Pages → Deploy from branch → main → / (root)**
4. Live at: `https://yourusername.github.io/anniversary`
   - Cover: `index.html`
   - Surprise: `page2.html` (auto-navigates from cover via swipe)

## 🎨 Customise

**Photos** — in `page2.html`, replace each `<div class="photo-placeholder">` with:
```html
<img src="photo1.jpg" alt="us" style="width:100%;height:100%;object-fit:cover;display:block;" />
```

**Song** — drop your `.mp3` in the folder, update `page2.html`:
```html
<source src="those-eyes.mp3" type="audio/mpeg" />
```

**Video** — drop your `.mp4` in the folder, update `page2.html`:
```html
<source src="ourvideo.mp4" type="video/mp4" />
```

**Story & Message** — edit the `<p>` tags inside `page2.html`.

Made with love 🌷
