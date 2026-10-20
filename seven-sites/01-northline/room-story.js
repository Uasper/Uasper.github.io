(() => {
  const story = document.querySelector('.room-story');
  const canvas = story?.querySelector('.room-canvas');
  if (!story || !canvas) return;

  const context = canvas.getContext('2d', { alpha: false });
  if (!context) return;

  const caption = story.querySelector('.room-caption');
  const bars = Array.from(story.querySelectorAll('.room-progress span'));
  const scenes = [
    { source: '../assets/architecture-interior.webp', label: '01 / Living room', description: 'Quiet modern living room with natural stone and oak', direction: -1 },
    { source: '../assets/northline-dining.webp', label: '02 / Dining room', description: 'Dining room with oak table and limestone wall', direction: 1 },
    { source: '../assets/northline-bedroom.webp', label: '03 / Bedroom', description: 'Bedroom with garden view and warm oak details', direction: -1 },
  ];

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let target = 0;
  let displayed = 0;
  let frame = 0;
  let width = 0;
  let height = 0;
  let lastCaption = -1;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const ease = value => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };

  function fitCanvas() {
    const bounds = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    draw(displayed);
  }

  function drawScene(scene, progress, alpha = 1) {
    if (!scene.image?.complete || !scene.image.naturalWidth) return;
    const image = scene.image;
    const cover = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drift = ease(progress);
    const zoom = 1.075 + drift * 0.055;
    const scaledWidth = image.naturalWidth * cover * zoom;
    const scaledHeight = image.naturalHeight * cover * zoom;
    const freeX = Math.max(0, scaledWidth - width);
    const freeY = Math.max(0, scaledHeight - height);
    const x = -freeX * (0.5 + scene.direction * (drift - 0.5) * 0.28);
    const y = -freeY * (0.47 + (drift - 0.5) * 0.18);
    context.globalAlpha = alpha;
    context.drawImage(image, x, y, scaledWidth, scaledHeight);
    context.globalAlpha = 1;
  }

  function draw(progress) {
    if (!width || !height) return;
    context.fillStyle = '#252820';
    context.fillRect(0, 0, width, height);

    // Each room has a pause; the two passages are continuously tied to scroll.
    const firstBlend = ease((progress - 0.22) / 0.20);
    const secondBlend = ease((progress - 0.62) / 0.20);
    if (progress < 0.42) {
      drawScene(scenes[0], progress / 0.42);
      if (firstBlend > 0) drawScene(scenes[1], (progress - 0.22) / 0.40, firstBlend);
    } else if (progress < 0.82) {
      drawScene(scenes[1], (progress - 0.22) / 0.60);
      if (secondBlend > 0) drawScene(scenes[2], (progress - 0.62) / 0.38, secondBlend);
    } else {
      drawScene(scenes[2], (progress - 0.62) / 0.38);
    }

    const current = progress < 0.32 ? 0 : progress < 0.72 ? 1 : 2;
    if (current !== lastCaption) {
      lastCaption = current;
      if (caption) caption.textContent = scenes[current].label;
      canvas.setAttribute('aria-label', scenes[current].description);
    }
    bars.forEach((bar, index) => {
      const start = [0, 0.32, 0.72][index];
      const end = [0.32, 0.72, 1][index];
      bar.style.setProperty('--fill', `${clamp((progress - start) / (end - start)) * 100}%`);
    });
  }

  function tick() {
    frame = 0;
    displayed += (target - displayed) * (reducedMotion.matches ? 1 : 0.14);
    if (Math.abs(target - displayed) < 0.0004) displayed = target;
    draw(displayed);
    if (displayed !== target) frame = requestAnimationFrame(tick);
  }

  function update() {
    const travel = Math.max(1, story.offsetHeight - innerHeight);
    target = clamp(-story.getBoundingClientRect().top / travel);
    if (!frame) frame = requestAnimationFrame(tick);
  }

  scenes.forEach(scene => {
    const image = new Image();
    image.src = scene.source;
    scene.image = image;
    image.decode?.().then(() => {
      story.classList.add('frames-ready');
      draw(displayed);
    }).catch(() => {});
  });

  fitCanvas();
  update();
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', () => { fitCanvas(); update(); });
  reducedMotion.addEventListener?.('change', update);
})();
