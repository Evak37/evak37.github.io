(() => {
  const viewport = document.querySelector('[data-drag-scroll]');
  const track = document.getElementById('sequence-track');
  const empty = document.getElementById('sequence-empty');
  if (!viewport || !track) return;

  let loaded = 0;
  track.querySelectorAll('figure img').forEach((img) => {
    const figure = img.closest('figure');
    const markLoaded = () => {
      loaded += 1;
      if (empty) empty.hidden = true;
    };
    const markMissing = () => { if (figure) figure.remove(); };

    if (img.complete) {
      if (img.naturalWidth > 0) markLoaded(); else markMissing();
    } else {
      img.addEventListener('load', markLoaded, { once: true });
      img.addEventListener('error', markMissing, { once: true });
    }
  });

  let pointerDown = false;
  let startX = 0;
  let startScroll = 0;

  viewport.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch') return;
    pointerDown = true;
    startX = event.clientX;
    startScroll = viewport.scrollLeft;
    viewport.classList.add('is-dragging');
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener('pointermove', (event) => {
    if (!pointerDown) return;
    viewport.scrollLeft = startScroll - (event.clientX - startX);
  });

  const stopDragging = () => {
    pointerDown = false;
    viewport.classList.remove('is-dragging');
  };

  viewport.addEventListener('pointerup', stopDragging);
  viewport.addEventListener('pointercancel', stopDragging);
})();
