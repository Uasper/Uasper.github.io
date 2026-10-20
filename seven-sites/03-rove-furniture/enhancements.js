const chair = document.querySelector('#rove-chair-image');
const productChair = document.querySelector('#rove-product-image');
const finishes = [...document.querySelectorAll('.swatch-buttons [data-image]')];
let selectionVersion = 0;
finishes.forEach(button => button.addEventListener('click', () => {
  const next = button.dataset.image;
  if (!chair || !productChair || chair.getAttribute('src') === next) return;
  const version = ++selectionVersion;
  const preview = new Image();
  preview.onload = () => {
    if (version !== selectionVersion) return;
    [chair, productChair].forEach(image => {
      image.classList.add('is-changing');
      image.src = next;
      image.alt = button.dataset.alt;
      requestAnimationFrame(() => requestAnimationFrame(() => image.classList.remove('is-changing')));
    });
  };
  preview.onerror = () => {
    const output = document.querySelector('[data-choice-output]');
    if (output) output.textContent = 'Image unavailable. Please choose another finish.';
  };
  preview.src = next;
}));
