(() => {
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Gentle reveal for the non-photographic text/layout moments.
  const revealItems = [...document.querySelectorAll('.reveal:not(.is-visible)')];
  if (revealItems.length) {
    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      revealItems.forEach((el) => el.classList.add('is-visible'));
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: .13 });
      revealItems.forEach((el) => observer.observe(el));
    }
  }

  const summer = document.querySelector('[data-summer]');
  const ribbon = document.querySelector('[data-flower-ribbon]');
  const frames = [...document.querySelectorAll('[data-flower-frame]')];
  const progressBar = document.querySelector('[data-summer-progress]');
  if (!summer || !ribbon || !frames.length) return;

  let desktop = window.innerWidth > 1000 && !reducedMotion.matches;
  let targetProgress = 0;
  let currentProgress = 0;
  let activeTarget = 0;
  let activeAmount = 0;
  let activeUntil = 0;
  let raf = 0;
  let widths = frames.map(() => window.innerWidth / frames.length);

  function sectionProgress() {
    const rect = summer.getBoundingClientRect();
    const travel = Math.max(1, summer.offsetHeight - window.innerHeight);
    return clamp(-rect.top / travel, 0, 1);
  }

  function summerIsRelevant() {
    const rect = summer.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  function noteScrollActivity() {
    if (!desktop || !summerIsRelevant()) return;
    activeUntil = performance.now() + 900;
    activeTarget = 1;
  }

  window.addEventListener('scroll', noteScrollActivity, { passive: true });
  window.addEventListener('wheel', noteScrollActivity, { passive: true });

  function resetInlineStyles() {
    frames.forEach((frame) => {
      frame.style.width = '';
      const full = frame.querySelector('.flower-full');
      const crop = frame.querySelector('.flower-crop');
      if (full) { full.style.opacity = ''; full.style.transform = ''; }
      if (crop) { crop.style.filter = ''; crop.style.transform = ''; }
    });
  }

  function onResize() {
    const wasDesktop = desktop;
    desktop = window.innerWidth > 1000 && !reducedMotion.matches;
    if (desktop !== wasDesktop) resetInlineStyles();
    widths = frames.map(() => window.innerWidth / frames.length);
  }
  window.addEventListener('resize', onResize, { passive: true });
  reducedMotion.addEventListener?.('change', onResize);

  function tick(now) {
    if (!desktop) {
      if (progressBar) progressBar.style.transform = 'scaleX(0)';
      raf = requestAnimationFrame(tick);
      return;
    }

    targetProgress = sectionProgress();
    currentProgress = lerp(currentProgress, targetProgress, .075);

    if (now > activeUntil) activeTarget = 0;
    activeAmount = lerp(activeAmount, activeTarget, activeTarget ? .115 : .055);
    if (activeTarget === 0 && activeAmount < .003) activeAmount = 0;

    // A little breathing room at the start/end keeps the collage intact before it begins unfolding.
    const staged = clamp((currentProgress - .045) / .91, 0, 1);
    const focusFloat = staged * (frames.length - 1);
    const weights = [];
    const focuses = [];

    frames.forEach((frame, i) => {
      const distance = Math.abs(i - focusFloat);
      const focus = Math.exp(-(distance * distance) / .42);
      focuses.push(focus);
      const portrait = frame.dataset.orientation === 'portrait';
      const bonus = portrait ? 3.2 : 5.6;
      weights.push(1 + bonus * focus * activeAmount);
    });

    const gapTotal = 2 * (frames.length - 1);
    const available = Math.max(320, window.innerWidth - gapTotal);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    frames.forEach((frame, i) => {
      const targetWidth = available * (weights[i] / totalWeight);
      widths[i] = lerp(widths[i] || targetWidth, targetWidth, .12);
      frame.style.width = `${widths[i].toFixed(2)}px`;

      const focusStrength = clamp(focuses[i] * activeAmount, 0, 1);
      const full = frame.querySelector('.flower-full');
      const crop = frame.querySelector('.flower-crop');
      if (full) {
        full.style.opacity = `${Math.pow(focusStrength, .78).toFixed(3)}`;
        full.style.transform = `scale(${(0.985 + 0.015 * focusStrength).toFixed(4)})`;
      }
      if (crop) {
        const dim = 1 - .18 * focusStrength;
        crop.style.filter = `saturate(${(0.98 + .08 * focusStrength).toFixed(3)}) brightness(${dim.toFixed(3)})`;
        crop.style.transform = `scale(${(1.003 + .012 * focusStrength).toFixed(4)})`;
      }
    });

    if (progressBar) progressBar.style.transform = `scaleX(${currentProgress.toFixed(4)})`;
    raf = requestAnimationFrame(tick);
  }

  raf = requestAnimationFrame(tick);
  window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
})();
