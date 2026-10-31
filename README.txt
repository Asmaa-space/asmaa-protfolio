ASMAA — ARCANA / Fantasy Portfolio
==================================

Run locally
-----------
Open index.html in a modern browser, or run a local static server from this folder:
  python3 -m http.server 8000
Then visit http://localhost:8000

Publish on GitHub Pages
----------------------
1. Upload the CONTENTS of this folder to the root of your repository.
2. Keep index.html, project.html, styles.css, app.js, and the assets folder together.
3. In GitHub: Settings > Pages > Deploy from a branch > main > /(root).

Features
--------
- Mobile-first responsive Arabic RTL portfolio.
- Illustrated fantasy environment and original SVG scene asset.
- Shared project detail page for the five existing portfolio projects.
- Magical cursor trail and C-major pentatonic music-box notes using Web Audio API.
- Audio is armed after the first deliberate mouse/keyboard interaction because browsers block autoplay.
- Touch devices receive visual sparkles only; touch scrolling never triggers musical notes.
- Sound toggle, light/dark theme toggle, mobile navigation, scroll progress, reveal transitions,
  double-tap witch spell, XP toasts, and keyboard easter word (MAGIC).
- Reduced-motion preference is respected; particle count and animation are reduced.

No build step or external JavaScript dependencies are required. Google Fonts are optional;
the page falls back to system fonts if the network is unavailable.
