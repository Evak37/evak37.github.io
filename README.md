# Site skeleton — Version 1 (in progress)

Plain HTML/CSS, no build step, so it deploys directly on GitHub Pages.

## What's built so far
- `index.html` — homepage (nav, intro line, Visual Geography preview, Projects placeholder, About, footer)
- `visual-geography.html` — page top + the Berkeley section only
- `final-sequence.html` — page top + the first 4 images (placeholder order)
- `css/style.css` — shared tokens, typography, nav/footer, and the image-width vocabulary
- Not yet built: Oakland / Hayward / Niles / SF Richmond sections, and the rest of the Final Sequence — these come next once Berkeley is confirmed.

## Adding real photographs
Images are referenced by path but no files exist yet, so browsers will show broken-image icons and alt text until you add them. To add real photos:

1. Export web-optimized copies from your TIFF/PNG masters (JPEG or WebP, not the originals).
2. Drop them into the matching folder using the naming pattern already referenced in the HTML:
   - `images/home/01.jpg`, `02.jpg`, `03.jpg` — homepage preview
   - `images/berkeley/01.jpg` through `07.jpg` — Berkeley section (rename/add more as needed)
   - `images/sequence/01.jpg` through `04.jpg` — Final Sequence (rename/add more as needed)
3. Each `<img>` currently has a `ratio-landscape`, `ratio-portrait`, or `ratio-wide` class as a layout-stability default. Once a real photo is in place, feel free to remove that class (or pick the closer one) so the box matches the photo's actual aspect ratio rather than forcing it — the CSS doesn't require a match, it's just a placeholder-stage default.
4. Update each `alt` attribute with a real short description once you're placing real content.

## Deploying to GitHub Pages
1. Push this folder to a GitHub repository (root of the repo, or a `/docs` folder).
2. In the repo, go to Settings → Pages, and set the source to the branch/folder where this lives.
3. No build step is required — GitHub Pages serves the HTML/CSS/images directly.
