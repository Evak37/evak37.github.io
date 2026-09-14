(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Soft entrance, kept deliberately simple.
  const reveals = [...document.querySelectorAll('.reveal')];
  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.11 });
    reveals.forEach((el) => observer.observe(el));
  }

  const summer = document.querySelector('[data-summer]');
  const ribbon = document.querySelector('[data-ribbon]');
  const track = document.querySelector('[data-flower-track]');
  const frames = track ? [...track.querySelectorAll('[data-frame]')] : [];
  const progressBar = document.querySelector('[data-summer-progress]');

  if (!summer || !ribbon || !track || !frames.length) return;

  // On touch/tablet, CSS turns the ribbon into native horizontal swipe.
  if (!finePointer || window.innerWidth <= 1000 || reducedMotion) return;

  const state = frames.map((frame) => ({
    frame,
    currentWidth: 0,
    targetWidth: 0,
    baseWidth: 0,
    focus: 0,
  }));

  let currentX = 0;
  let targetX = 0;
  let pointerX = null;
  let sectionProgress = 0;
  let raf = null;

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const lerp = (a, b, t) => a + (b - a) * t;

  function baseFor(frame) {
    const portrait = frame.classList.contains('portrait');
    const vw = window.innerWidth / 100;
    if (portrait) return clamp(12.4 * vw, 150, 230);
    return clamp(17.5 * vw, 210, 320);
  }

  function measureTargets() {
    state.forEach((item) => {
      item.baseWidth = baseFor(item.frame);
      if (!item.currentWidth) item.currentWidth = item.baseWidth;
      if (!item.targetWidth) item.targetWidth = item.baseWidth;
    });
  }

  function updateSectionProgress() {
    const rect = summer.getBoundingClientRect();
    const scrollable = Math.max(1, summer.offsetHeight - window.innerHeight);
    sectionProgress = clamp(-rect.top / scrollable, 0, 1);
    if (progressBar) progressBar.style.transform = `scaleX(${sectionProgress})`;
  }

  function updateFocusTargets() {
    const ribbonRect = ribbon.getBoundingClientRect();
    const localPointer = pointerX == null ? null : pointerX - ribbonRect.left;
    const expansion = clamp(window.innerWidth * 0.19, 190, 360);
    const radius = clamp(window.innerWidth * 0.24, 260, 470);

    state.forEach((item) => {
      if (localPointer == null) {
        item.focus = 0;
      } else {
        const rect = item.frame.getBoundingClientRect();
        const center = rect.left - ribbonRect.left + rect.width / 2;
        const distance = Math.abs(localPointer - center);
        const raw = clamp(1 - (distance / radius), 0, 1);
        item.focus = raw * raw * (3 - 2 * raw); // smoothstep
      }
      item.targetWidth = item.baseWidth + expansion * item.focus;
      item.frame.classList.toggle('is-near', item.focus > .35);
      item.frame.classList.toggle('is-far', localPointer != null && item.focus < .12);
    });
  }

  function updateTrackTarget() {
    const gap = parseFloat(getComputedStyle(track).gap) || 4;
    const totalWidth = state.reduce((sum, item) => sum + item.currentWidth, 0) + gap * (state.length - 1) + window.innerWidth * .04;
    const start = window.innerWidth * .035;
    const end = Math.min(start, window.innerWidth - totalWidth - window.innerWidth * .035);
    // Smooth ease across the pinned section, so the strip has a little resistance.
    const eased = sectionProgress * sectionProgress * (3 - 2 * sectionProgress);
    targetX = lerp(start, end, eased);
  }

  function tick() {
    updateSectionProgress();
    updateFocusTargets();

    state.forEach((item) => {
      item.currentWidth = lerp(item.currentWidth, item.targetWidth, .11);
      item.frame.style.width = `${item.currentWidth.toFixed(2)}px`;
    });

    updateTrackTarget();
    currentX = lerp(currentX, targetX, .075);
    track.style.transform = `translate3d(${currentX.toFixed(2)}px,0,0)`;

    raf = requestAnimationFrame(tick);
  }

  ribbon.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
  });
  ribbon.addEventListener('pointerleave', () => {
    pointerX = null;
    state.forEach((item) => {
      item.frame.classList.remove('is-near', 'is-far');
    });
  });

  window.addEventListener('resize', measureTargets, { passive: true });
  measureTargets();
  raf = requestAnimationFrame(tick);

  window.addEventListener('pagehide', () => {
    if (raf) cancelAnimationFrame(raf);
  }, { once: true });
})();
