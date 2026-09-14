(() => {
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const hero = document.querySelector('[data-home-hero]');
  const heroCopy = document.querySelector('[data-hero-copy]');
  const heroImage = document.querySelector('[data-hero-image]');
  const transitionBlur = document.querySelector('[data-transition-blur]');
  const summer = document.querySelector('[data-summer]');
  const summerLine = document.querySelector('[data-summer-line]');
  const chapterScenes = [...document.querySelectorAll('.chapter[data-scroll-scene]')];
  const geoIntro = document.querySelector('.geo-intro[data-scroll-scene]');

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
      heroCopy.style.transform = `translate3d(0, ${(-56 * eased).toFixed(2)}px, 0)`;
      heroCopy.style.opacity = `${(1 - .28 * eased).toFixed(3)}`;
    }
    if (heroImage) {
      heroImage.style.transform = `scale(${(1.008 + .038 * eased).toFixed(4)}) translate3d(0, ${(-7 * eased).toFixed(2)}px, 0)`;
      heroImage.style.filter = `blur(${(2.4 * eased).toFixed(2)}px)`;
    }
    if (transitionBlur) {
      const blurIn = clamp((progress - .32) / .55, 0, 1);
      transitionBlur.style.opacity = `${(.92 * blurIn).toFixed(3)}`;
      transitionBlur.style.transform = `scale(${(1.12 + .03 * blurIn).toFixed(3)}) translate3d(0, ${(-18 * blurIn).toFixed(2)}px, 0)`;
    }

    if (summerLine) {
      // The sentence arrives as the second “page” takes over, rather than sitting there from the start.
      const lineProgress = clamp((progress - .52) / .42, 0, 1);
      const lineEase = 1 - Math.pow(1 - lineProgress, 3);
      summerLine.style.opacity = `${lineEase.toFixed(3)}`;
      summerLine.style.transform = `translate3d(0, ${(34 * (1 - lineEase)).toFixed(2)}px, 0)`;
    }
  }

  function chapterMotion() {
    if (reducedMotion.matches) return;
    const vh = Math.max(1, window.innerHeight);

    if (geoIntro) {
      const rect = geoIntro.getBoundingClientRect();
      const p = clamp(1 - Math.abs(rect.top) / vh, 0, 1);
      const title = geoIntro.querySelector('h1');
      if (title) {
        title.style.transform = `translate3d(0, ${((1 - p) * 40).toFixed(1)}px, 0)`;
        title.style.opacity = `${(.58 + .42 * p).toFixed(3)}`;
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
        heading.style.transform = `translate3d(${(-18 * direction * (1 - p)).toFixed(1)}px, ${((1 - p) * 34).toFixed(1)}px, 0)`;
        heading.style.opacity = `${(.52 + .48 * p).toFixed(3)}`;
      }
      if (enter) {
        enter.style.transform = `translate3d(0, ${((1 - p) * 18).toFixed(1)}px, 0)`;
        enter.style.opacity = `${(.42 + .58 * p).toFixed(3)}`;
      }
      if (ambient) {
        ambient.style.transform = `scale(${(1.08 + .035 * (1 - p)).toFixed(3)}) translate3d(0, ${(direction * -12).toFixed(1)}px, 0)`;
        ambient.style.opacity = `${(.22 + .10 * p).toFixed(3)}`;
      }

      const vectors = [
        [0, 42],
        [-38, -14],
        [38, 24],
        [-18, 38]
      ];
      prints.forEach((print, index) => {
        const [vx, vy] = vectors[index] || [0, 24];
        const factor = 1 - p;
        print.style.translate = `${(vx * direction * factor).toFixed(1)}px ${(vy * direction * factor).toFixed(1)}px`;
        print.style.opacity = `${(.62 + .38 * p).toFixed(3)}`;
      });
    });
  }

  function tick() {
    targetScroll = window.scrollY;
    smoothScroll = lerp(smoothScroll, targetScroll, .15);
    homeMotion(smoothScroll);
    chapterMotion();
    raf = requestAnimationFrame(tick);
  }

  if (reducedMotion.matches && summerLine) {
    summerLine.style.opacity = '1';
    summerLine.style.transform = 'none';
  }

  raf = requestAnimationFrame(tick);
  window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
})();
