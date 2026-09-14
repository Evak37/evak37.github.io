(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const reveals = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(el => observer.observe(el));
  }

  const ribbon = document.querySelector('[data-ribbon]');
  if (!ribbon) return;

  const frames = [...ribbon.querySelectorAll('[data-frame]')];
  frames.forEach(frame => {
    frame.addEventListener('click', () => {
      const opening = !frame.classList.contains('is-open');
      frames.forEach(other => other.classList.remove('is-open'));
      if (opening) {
        frame.classList.add('is-open');
        requestAnimationFrame(() => {
          frame.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
        });
      }
    });
  });

  let isDown = false;
  let startX = 0;
  let startScroll = 0;
  let moved = false;

  ribbon.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    isDown = true;
    moved = false;
    startX = event.clientX;
    startScroll = ribbon.scrollLeft;
    ribbon.classList.add('is-dragging');
    ribbon.setPointerCapture?.(event.pointerId);
  });

  ribbon.addEventListener('pointermove', (event) => {
    if (!isDown) return;
    const dx = event.clientX - startX;
    if (Math.abs(dx) > 5) moved = true;
    ribbon.scrollLeft = startScroll - dx;
  });

  const stopDrag = (event) => {
    if (!isDown) return;
    isDown = false;
    ribbon.classList.remove('is-dragging');
    try { ribbon.releasePointerCapture?.(event.pointerId); } catch (_) {}
  };
  ribbon.addEventListener('pointerup', stopDrag);
  ribbon.addEventListener('pointercancel', stopDrag);

  ribbon.addEventListener('click', (event) => {
    if (moved) {
      event.preventDefault();
      event.stopPropagation();
      moved = false;
    }
  }, true);
})();
