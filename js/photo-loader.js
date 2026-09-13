/*
  Resolve photography assets without requiring one file extension.
  For each <img data-photo-base="images/oakland/04">, try common web
  extensions in sequence. This makes the current working archive tolerant
  of .jpg/.jpeg/.png/.webp files while the collection is still being整理.
*/
(() => {
  const extensions = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG', 'WEBP'];

  document.querySelectorAll('img[data-photo-base]').forEach((img) => {
    const base = img.dataset.photoBase;
    let index = 0;

    const tryNext = () => {
      if (index >= extensions.length) {
        img.removeEventListener('error', tryNext);
        img.classList.add('is-missing-photo');
        const figure = img.closest('figure');
        if (figure) figure.classList.add('is-missing-photo');
        console.warn(`Photo not found for base path: ${base}`);
        return;
      }

      img.src = `${base}.${extensions[index]}`;
      index += 1;
    };

    img.addEventListener('error', tryNext);
    img.addEventListener('load', () => {
      img.removeEventListener('error', tryNext);
    }, { once: true });

    tryNext();
  });
})();
