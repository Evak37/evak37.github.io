(() => {
  const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG', 'WEBP'];
  const data = window.VG_DATA;
  if (!data) return;

  const pad = (n) => String(n).padStart(2, '0');
  const baseFor = (place, number) => `images/${place}/${pad(number)}`;

  function resolvePhoto(img, base, onMissing) {
    let i = 0;
    const tryNext = () => {
      if (i >= EXTENSIONS.length) {
        img.removeEventListener('error', tryNext);
        img.classList.add('is-missing-photo');
        if (onMissing) onMissing();
        return;
      }
      img.src = `${base}.${EXTENSIONS[i++]}`;
    };
    img.addEventListener('error', tryNext);
    img.addEventListener('load', () => img.removeEventListener('error', tryNext), { once: true });
    tryNext();
  }

  function makeImage(place, number, opts = {}) {
    const img = document.createElement('img');
    img.alt = opts.alt || `${data.places[place].label} photograph`;
    img.loading = opts.eager ? 'eager' : 'lazy';
    img.decoding = 'async';
    resolvePhoto(img, baseFor(place, number), opts.onMissing);
    return img;
  }

  function renderHome() {
    const preview = document.querySelector('[data-home-preview]');
    if (!preview) return;
    const picks = [['berkeley', 2], ['oakland', 9], ['richmond', 12]];
    picks.forEach(([place, number], index) => {
      const figure = document.createElement('figure');
      figure.className = `home-shot home-shot-${index + 1}`;
      figure.append(makeImage(place, number, { eager: index === 0, onMissing: () => figure.remove() }));
      preview.append(figure);
    });
  }

  function renderPlaceIndex() {
    const root = document.querySelector('[data-place-index]');
    if (!root) return;

    Object.entries(data.places).forEach(([key, place]) => {
      const link = document.createElement('a');
      link.className = 'chapter-row';
      link.href = `place.html?place=${key}`;

      const meta = document.createElement('div');
      meta.className = 'chapter-meta';
      meta.innerHTML = `<span class="chapter-kicker">${place.count} photographs</span><h2>${place.label}</h2><span>${place.date}</span>`;

      const strip = document.createElement('div');
      strip.className = 'chapter-strip';
      place.preview.forEach((number) => {
        const frame = document.createElement('figure');
        frame.append(makeImage(key, number, { onMissing: () => frame.remove() }));
        strip.append(frame);
      });

      const arrow = document.createElement('span');
      arrow.className = 'chapter-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';

      link.append(meta, strip, arrow);
      root.append(link);
    });
  }

  function renderPlaceViewer() {
    const root = document.querySelector('[data-place-viewer]');
    if (!root) return;

    const params = new URLSearchParams(location.search);
    const key = params.get('place') || 'berkeley';
    const place = data.places[key];
    if (!place) {
      location.href = 'visual-geography.html';
      return;
    }

    document.title = `${place.label} — Visual Geography — Eva K.`;
    document.querySelector('[data-place-title]').textContent = place.label;
    document.querySelector('[data-place-date]').textContent = place.date;

    const stage = document.querySelector('[data-place-stage]');
    const filmstrip = document.querySelector('[data-place-filmstrip]');
    const counter = document.querySelector('[data-place-counter]');
    const prev = document.querySelector('[data-place-prev]');
    const next = document.querySelector('[data-place-next]');

    let current = 1;
    const mainImg = document.createElement('img');
    mainImg.alt = `${place.label} photograph`;
    mainImg.decoding = 'async';
    stage.append(mainImg);

    const thumbs = [];
    for (let i = 1; i <= place.count; i++) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'film-thumb';
      button.setAttribute('aria-label', `View photograph ${i}`);
      const img = makeImage(key, i, { onMissing: () => button.remove() });
      button.append(img);
      button.addEventListener('click', () => show(i));
      filmstrip.append(button);
      thumbs.push(button);
    }

    function show(number) {
      current = Math.min(place.count, Math.max(1, number));
      mainImg.classList.add('is-changing');
      const base = baseFor(key, current);
      let done = false;
      const temp = document.createElement('img');
      resolvePhoto(temp, base, () => {
        if (!done) mainImg.classList.remove('is-changing');
      });
      temp.addEventListener('load', () => {
        done = true;
        mainImg.src = temp.src;
        mainImg.classList.remove('is-changing');
      }, { once: true });
      counter.textContent = `${current} / ${place.count}`;
      thumbs.forEach((thumb, idx) => thumb.classList.toggle('is-current', idx === current - 1));
      const thumb = thumbs[current - 1];
      if (thumb) thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    prev.addEventListener('click', () => show(current === 1 ? place.count : current - 1));
    next.addEventListener('click', () => show(current === place.count ? 1 : current + 1));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(current === 1 ? place.count : current - 1);
      if (e.key === 'ArrowRight') show(current === place.count ? 1 : current + 1);
    });

    let startX = null;
    stage.addEventListener('pointerdown', (e) => { startX = e.clientX; });
    stage.addEventListener('pointerup', (e) => {
      if (startX == null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) < 45) return;
      if (dx < 0) next.click(); else prev.click();
    });

    show(1);
  }

  function renderFinalSequence() {
    const root = document.querySelector('[data-sequence-book]');
    if (!root) return;

    const sequence = data.finalSequence;
    const track = document.querySelector('[data-book-track]');
    const status = document.querySelector('[data-book-status]');
    const prev = document.querySelector('[data-book-prev]');
    const next = document.querySelector('[data-book-next]');
    let current = 0;

    sequence.forEach(([place, number], index) => {
      const slide = document.createElement('section');
      slide.className = 'book-slide';
      slide.dataset.slide = index;

      const figure = document.createElement('figure');
      figure.className = 'sequence-image';
      figure.append(makeImage(place, number, {
        eager: index === 0,
        alt: `${data.places[place].label} photograph`,
        onMissing: () => slide.remove()
      }));

      slide.append(figure);
      track.append(slide);
    });

    function updateUI() {
      status.textContent = `${current + 1} / ${sequence.length}`;
      prev.disabled = current === 0;
      next.disabled = current === sequence.length - 1;
    }

    function go(index) {
      current = Math.min(sequence.length - 1, Math.max(0, index));
      root.scrollTo({ left: current * root.clientWidth, behavior: 'smooth' });
      updateUI();
    }

    prev.addEventListener('click', () => go(current - 1));
    next.addEventListener('click', () => go(current + 1));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') go(current - 1);
      if (e.key === 'ArrowRight') go(current + 1);
    });

    let startX = null;
    root.addEventListener('pointerdown', (e) => { startX = e.clientX; });
    root.addEventListener('pointerup', (e) => {
      if (startX == null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) < 50) return;
      if (dx < 0) go(current + 1); else go(current - 1);
    });

    let scrollTimer;
    root.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const w = root.clientWidth || 1;
        current = Math.round(root.scrollLeft / w);
        current = Math.min(sequence.length - 1, Math.max(0, current));
        updateUI();
      }, 80);
    }, { passive: true });

    updateUI();
  }

  renderHome();
  renderPlaceIndex();
  renderPlaceViewer();
  renderFinalSequence();
})();
