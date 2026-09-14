(() => {
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const hero = document.querySelector('[data-home-hero]');
  const heroCopy = document.querySelector('[data-hero-copy]');
  const heroImage = document.querySelector('[data-hero-image]');
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
    const summerRect = summer.getBoundingClientRect();
    const summerEntry = clamp(1 - summerRect.top / vh, 0, 1);
    if (summerStage) {
      summerStage.style.filter = 'none';
      summerStage.style.transform = 'none';
    }

    if (summerLine) {
      // Restore the V3.6 narration behavior: a modest left-to-right entrance
      // tied to page progress rather than a dramatic off-screen sweep.
      const lineProgress = clamp((summerEntry - .22) / .58, 0, 1);
      const lineEase = 1 - Math.pow(1 - lineProgress, 3);
      summerLine.style.opacity = `${lineEase.toFixed(3)}`;
      summerLine.style.transform = `translate3d(${(-180 * (1 - lineEase)).toFixed(2)}px, 0, 0)`;
    }
  }

  function initAccordion() {
    if (!flowerTrack || !flowerFrames.length) return;
    if (window.matchMedia('(hover: none)').matches) return;

    let active = null;
    let pending = null;
    let hoverTimer = 0;

    const setActive = (frame) => {
      if (frame === active) return;
      if (active) active.classList.remove('is-active');
      active = frame;
      flowerTrack.classList.toggle('is-hovering', Boolean(frame));
      if (active) active.classList.add('is-active');
    };

    const queueActive = (frame) => {
      if (frame === active || frame === pending) return;
      window.clearTimeout(hoverTimer);
      pending = frame;
      hoverTimer = window.setTimeout(() => {
        setActive(pending);
        pending = null;
      }, 145);
    };

    flowerTrack.addEventListener('pointermove', (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      queueActive(el ? el.closest('[data-flower-frame]') : null);
    }, { passive: true });

    flowerTrack.addEventListener('pointerleave', () => {
      window.clearTimeout(hoverTimer);
      pending = null;
      hoverTimer = window.setTimeout(() => setActive(null), 110);
    }, { passive: true });
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
    // Desktop gets one-gesture page turns regardless of mouse/trackpad media-query
    // reporting. Mobile/touch keeps the browser's native vertical scrolling.
    if (window.innerWidth < 900 || reducedMotion.matches) return;

    const pages = [...document.querySelectorAll('.snap-page')];
    if (pages.length < 2) return;

    let animating = false;

    // Disable the browser's own smooth-scroll + CSS snap while the JS spring is
    // responsible for page turns. This prevents the two systems from fighting
    // each other and making a single wheel gesture feel as if it did nothing.
    document.documentElement.classList.add('js-spring-snap');

    const pageTop = (el) => window.scrollY + el.getBoundingClientRect().top;

    const nearestIndex = () => {
      let best = 0;
      let bestDistance = Infinity;
      pages.forEach((page, index) => {
        const d = Math.abs(page.getBoundingClientRect().top);
        if (d < bestDistance) {
          bestDistance = d;
          best = index;
        }
      });
      return best;
    };

    function instantScrollTo(y) {
      window.scrollTo({ top: y, left: 0, behavior: 'instant' });
    }

    function animateTo(el) {
      const target = pageTop(el);
      let position = window.scrollY;
      let velocity = 0;
      let lastTime = performance.now();
      const startTime = lastTime;
      animating = true;

      // Slow, damped motion: one gesture commits immediately, but the page has
      // visible mass and takes its time settling into the next viewport.
      const isHome = document.body.classList.contains('editorial-home');
      const stiffness = isHome ? 0.0024 : 0.0034;
      const damping = isHome ? 0.91 : 0.895;
      const maxDuration = isHome ? 3800 : 3000;

      const frame = (now) => {
        const dt = clamp((now - lastTime) / 16.667, 0.5, 2.0);
        lastTime = now;

        const displacement = target - position;
        velocity += displacement * stiffness * dt;
        velocity *= Math.pow(damping, dt);
        position += velocity * dt;

        instantScrollTo(position);

        const settled =
          Math.abs(target - position) < 0.65 &&
          Math.abs(velocity) < 0.20;

        if (!settled && now - startTime < maxDuration) {
          requestAnimationFrame(frame);
        } else {
          instantScrollTo(target);
          // Keep eating the tail of a trackpad gesture for a moment so one
          // physical swipe cannot accidentally advance two pages.
          setTimeout(() => {
            animating = false;
          }, 260);
        }
      };

      requestAnimationFrame(frame);
    }

    const onWheel = (e) => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.deltaY === 0) {
        return;
      }

      // While the page is travelling, consume momentum events from the same
      // physical gesture rather than treating them as new page turns.
      if (animating) {
        e.preventDefault();
        return;
      }

      const current = nearestIndex();
      const direction = e.deltaY > 0 ? 1 : -1;
      const next = clamp(current + direction, 0, pages.length - 1);

      // At either edge, release the browser so footer / normal document content
      // remains reachable.
      if (next === current) return;

      // No accumulated delta, no threshold: the first vertical wheel event is
      // the decision to turn exactly one page.
      e.preventDefault();
      animateTo(pages[next]);
    };

    // Capture phase makes this reliable even when the pointer is currently over
    // an interactive child such as the flower accordion.
    window.addEventListener('wheel', onWheel, {
      passive: false,
      capture: true
    });
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
