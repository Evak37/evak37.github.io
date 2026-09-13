# Eva K. — Visual Geography site

Static HTML/CSS site for GitHub Pages. No build step is required.

## Current pages

- `index.html` — minimal homepage
- `visual-geography.html` — Places view; Berkeley is currently populated
- `final-sequence.html` — horizontal Final Sequence viewer; it automatically hides missing sequence files

## Current Berkeley images

`images/berkeley/01.jpg` through `10.jpg` are web-optimized JPEGs. The CSS preserves each image's intrinsic aspect ratio and limits its displayed height so photographs should fit comfortably on laptop screens without browser zooming.

## Adding the remaining Places

Recommended folders:

```
images/
  berkeley/
  oakland/
  hayward/
  niles/
  richmond/
```

Keep the original/master TIFF or huge PNG files outside this repository. Export web copies as sRGB JPEG or WebP, roughly 2000–2400 px on the long edge. A few hundred KB to about 1 MB per photograph is a useful target.

It is fine to upload the previously curated selections first as a working set. Curation, reordering, and replacement can happen after all Places are visible together.

## Final Sequence

Place the authored sequence in:

```
images/sequence/01.jpg
images/sequence/02.jpg
...
```

The existing page checks 01–22 and automatically removes missing images. Keep the authored order in the filenames.

## Design status

Version 1 is intentionally sparse:

- Public Sans
- white background
- no Projects or About filler copy
- no visible image numbering
- no fixed aspect-ratio boxes
- no cards or decorative image frames

The next design pass should happen after the remaining real photographs are loaded.
