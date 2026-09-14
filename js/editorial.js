(() => {
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const hero = document.querySelector('[data-home-hero]');
  const heroCopy = document.querySelector('[data-hero-copy]');
  const heroImage = document.querySelector('[data-hero-image]');
  const transitionBlur = document.querySelector('[data-transition-blur]');
  const summer = document.querySelector('[data-summer]');
  const summerStage = document.querySelector('[data-summer-stage]');
  const summerLine = document.querySelector('[data-summer-line]');
  const flowerTrack = document.querySelector('[data-flower-track]');
  const flowerFrames = [...document.querySelectorAll('[data-flower-frame]')];
  const chapterScenes = [...document.querySelectorAll('.chapter[data-scroll-scene]')];
  const geoIntro = document.querySelector('.geo-intro[data-scroll-scene]');
  const introMosaic = document.querySelector('[data-intro-mosaic]');

  let targetScroll = window.scrollY;
  let smoothScroll = targetScroll;
  let raf = 0;

  function homeMotion(scrollY) {
    if (!hero || !summer || reducedMotion.matches) return;
    const vh = Math.max(1, window.innerHeight);
    const heroTop = hero.offsetTop;
    const progress = clamp((scrollY - heroTop) / vh, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    if (heroCopy) {
      heroCopy.style.transform = `translate3d(0, ${(-82 * eased).toFixed(2)}px, 0)`;
      heroCopy.style.opacity = `${(1 - .34 * eased).toFixed(3)}`;
    }
    if (heroImage) {
      heroImage.style.transform = `scale(${(1.008 + .034 * eased).toFixed(4)}) translate3d(0, ${(-8 * eased).toFixed(2)}px, 0)`;
      heroImage.style.filter = 'none';
    }
    if (transitionBlur) {
      // Blur exists only at the seam where page 1 meets page 2.
      const blurIn = clamp((progress - .68) / .32, 0, 1);
      transitionBlur.style.opacity = `${(.92 * blurIn).toFixed(3)}`;
      transitionBlur.style.transform = `scale(${(1.08 + .03 * blurIn).toFixed(3)}) translate3d(0, ${(-8 * blurIn).toFixed(2)}px, 0)`;
    }

    const summerRect = summer.getBoundingClientRect();
    const summerEntry = clamp(1 - summerRect.top / vh, 0, 1);
    if (summerStage) {
      summerStage.style.filter = 'none';
      summerStage.style.transform = 'none';
    }

    if (summerLine) {
      const lineProgress = clamp((summerEntry - .22) / .58, 0, 1);
      const lineEase = 1 - Math.pow(1 - lineProgress, 3);
      summerLine.style.opacity = `${lineEase.toFixed(3)}`;
      summerLine.style.transform = `translate3d(${(-92 * (1 - lineEase)).toFixed(2)}px, 0, 0)`;
    }
  }

  function initAccordion() {
    if (!flowerTrack || !flowerFrames.length) return;
    if (window.matchMedia('(hover: none)').matches) return;

    let active = null;
    const setActive = (frame) => {
      if (frame === active) return;
      if (active) active.classList.remove('is-active');
      active = frame;
      flowerTrack.classList.toggle('is-hovering', Boolean(frame));
      if (active) active.classList.add('is-active');
    };

    flowerTrack.addEventListener('pointermove', (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      setActive(el ? el.closest('[data-flower-frame]') : null);
    }, { passive: true });

    flowerTrack.addEventListener('pointerleave', () => setActive(null), { passive: true });
  }

  function chapterMotion() {
    if (reducedMotion.matches) return;
    const vh = Math.max(1, window.innerHeight);

    if (geoIntro) {
      const rect = geoIntro.getBoundingClientRect();
      const p = clamp(1 - Math.abs(rect.top) / vh, 0, 1);
      const title = geoIntro.querySelector('h1');
      if (title) {
        title.style.transform = `translate3d(0, ${((1 - p) * 58).toFixed(1)}px, 0)`;
        title.style.opacity = `${(.50 + .50 * p).toFixed(3)}`;
      }
      if (introMosaic) {
        [...introMosaic.children].forEach((panel, index) => {
          const drift = (index % 2 ? -1 : 1) * (1 - p) * (16 + index * 3);
          panel.style.transform = `translate3d(0, ${drift.toFixed(1)}px, 0) scale(1.04)`;
        });
      }
    }

    chapterScenes.forEach((chapter) => {
      const rect = chapter.getBoundingClientRect();
      const p = clamp(1 - Math.abs(rect.top) / vh, 0, 1);
      const direction = clamp(rect.top / vh, -1, 1);
      const heading = chapter.querySelector('.chapter-heading');
      const enter = chapter.querySelector('.chapter-enter');
      const ambient = chapter.querySelector('.chapter-ambient');
      const prints = [...chapter.querySelectorAll('.print')];

      if (heading) {
        heading.style.transform = `translate3d(${(-20 * direction * (1 - p)).toFixed(1)}px, ${((1 - p) * 40).toFixed(1)}px, 0)`;
        heading.style.opacity = `${(.50 + .50 * p).toFixed(3)}`;
      }
      if (enter) {
        enter.style.transform = `translate3d(0, ${((1 - p) * 22).toFixed(1)}px, 0)`;
        enter.style.opacity = `${(.40 + .60 * p).toFixed(3)}`;
      }
      if (ambient) {
        ambient.style.transform = `scale(${(1.08 + .040 * (1 - p)).toFixed(3)}) translate3d(0, ${(direction * -16).toFixed(1)}px, 0)`;
        ambient.style.opacity = `${(.22 + .11 * p).toFixed(3)}`;
      }

      const vectors = [
        [0, 54],
        [-44, -18],
        [42, 28],
        [-24, 46]
      ];
      prints.forEach((print, index) => {
        const [vx, vy] = vectors[index] || [0, 28];
        const factor = 1 - p;
        print.style.translate = `${(vx * direction * factor).toFixed(1)}px ${(vy * direction * factor).toFixed(1)}px`;
        print.style.opacity = `${(.60 + .40 * p).toFixed(3)}`;
      });
    });
  }

  function initSlowSnap() {
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine || window.innerWidth < 900 || reducedMotion.matches) return;

    const pages = [...document.querySelectorAll('.snap-page')];
    if (pages.length < 2) return;

    let animating = false;
    let accumulator = 0;
    let resetTimer = 0;

    const pageTop = (el) => window.scrollY + el.getBoundingClientRect().top;
    const nearestIndex = () => {
      let best = 0;
      let bestDistance = Infinity;
      pages.forEach((page, index) => {
        const d = Math.abs(page.getBoundingClientRect().top);
        if (d < bestDistance) { bestDistance = d; best = index; }
      });
      return best;
    };

    function animateTo(el) {
      const target = pageTop(el);
      let position = window.scrollY;
      let velocity = 0;
      let lastTime = performance.now();
      const startTime = lastTime;
      animating = true;

      // A lightly under-damped spring: slower than a normal smooth scroll,
      // with a tiny settle at the end rather than a mechanical ease-in/out.
      const stiffness = 0.006;
      const damping = 0.88;
      const maxDuration = 2400;

      const frame = (now) => {
        const dt = clamp((now - lastTime) / 16.667, .5, 2.0);
        lastTime = now;
        const displacement = target - position;
        velocity += displacement * stiffness * dt;
        velocity *= Math.pow(damping, dt);
        position += velocity * dt;
        window.scrollTo(0, position);

        const settled = Math.abs(target - position) < .7 && Math.abs(velocity) < .22;
        if (!settled && now - startTime < maxDuration) {
          requestAnimationFrame(frame);
        } else {
          window.scrollTo(0, target);
          setTimeout(() => { animating = false; }, 170);
        }
      };
      requestAnimationFrame(frame);
    }

    window.addEventListener('wheel', (e) => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const edgeIndex = nearestIndex();
      if ((edgeIndex === 0 && e.deltaY < 0) || (edgeIndex === pages.length - 1 && e.deltaY > 0)) return;
      // Keep wheel/trackpad as vertical page navigation; hover never hijacks it for the accordion.
      e.preventDefault();
      if (animating) return;

      accumulator += e.deltaY;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { accumulator = 0; }, 210);
      if (Math.abs(accumulator) < 62) return;

      const direction = accumulator > 0 ? 1 : -1;
      accumulator = 0;
      const current = nearestIndex();
      const next = clamp(current + direction, 0, pages.length - 1);
      if (next === current) return;
      animateTo(pages[next]);
    }, { passive: false });
  }

  function tick() {
    targetScroll = window.scrollY;
    smoothScroll = lerp(smoothScroll, targetScroll, .13);
    homeMotion(smoothScroll);
    chapterMotion();
    raf = requestAnimationFrame(tick);
  }

  if (reducedMotion.matches && summerLine) {
    summerLine.style.opacity = '1';
    summerLine.style.transform = 'none';
  }

  initAccordion();
  initSlowSnap();
  raf = requestAnimationFrame(tick);
  window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
})();
