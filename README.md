# Eva K. — site v1.1

Plain HTML/CSS/JS with no build step. It can be deployed directly on GitHub Pages.

## What changed in this revision

- Removed all placeholder aspect-ratio boxes and gray image backgrounds.
- Berkeley now uses all 10 real photographs and preserves each file's intrinsic aspect ratio.
- Berkeley layout is calmer and uses a small set of placements rather than arbitrary large/small alternation.
- Background is plain white and typography is Public Sans.
- Homepage preview reuses real Berkeley assets instead of duplicating images into a separate `home` folder.
- Final Sequence is prepared as a page-level horizontal viewing space, not a carousel component.
- Missing Final Sequence files hide automatically, so the page does not show broken-image icons.

## Image folders

Current:

```
images/
  berkeley/
    01.jpg ... 10.jpg
  sequence/
    (add ordered final images here)
```

The Berkeley files in this package are web-optimized copies: long edge 2400 px, JPEG quality 84, and metadata removed. Keep your original large exports separately as masters.

## Adding the Final Sequence

Place the authored sequence in `images/sequence/` using the real order:

```
01.jpg
02.jpg
03.jpg
...
```

`final-sequence.html` is already wired for 01–22. Missing numbers are ignored automatically. If your final count differs, edit the figure list later; no visible numbers appear on the page.

## Deploy to GitHub Pages

Upload the contents of this `site` folder to the root of your `EvaK37.github.io` repository, preserving the folder structure exactly:

```
index.html
visual-geography.html
final-sequence.html
css/style.css
js/sequence.js
images/...
```

GitHub paths are case-sensitive, so keep the lowercase names exactly as shown.
