/**
 * Glass toolbar (src/components/GlassNav.astro). Only runs when the glass nav is on.
 * - Phones and tablets: Menu morphs into the capsule; × (on its left), Escape, a tap outside or
 *   following a link closes it. The header's .is-open also slides the name and role out.
 * - The selection pill sits behind the current page and slides to a hovered or pressed item.
 * - Over the dark hero or footer, html.glass-on-dark switches the glass to its dark style.
 * - Chromium: each glass shape gets an SVG displacement map that bends what is behind it near the
 *   rim, like a thick glass edge. Safari and Firefox do not support SVG filters in backdrop-filter,
 *   so they keep the plain blur.
 */

const root = document.documentElement;

if (root.dataset.navstyle === 'glass') {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  const wrap = document.querySelector<HTMLElement>('[data-glass-nav]');
  const capsule = wrap?.querySelector<HTMLElement>('[data-glass-capsule]');
  const openButton = wrap?.querySelector<HTMLButtonElement>('[data-glass-open]');
  const closeButton = wrap?.querySelector<HTMLButtonElement>('[data-glass-close]');
  const pill = wrap?.querySelector<HTMLElement>('[data-glass-pill]');
  const items = [...(wrap?.querySelectorAll<HTMLElement>('[data-glass-item]') ?? [])];
  const current = items.find((item) => item.getAttribute('aria-current') === 'page') ?? null;
  const compact = window.matchMedia('(max-width: 1023px)');

  /* ---------- Open / close (phones and tablets) ---------- */
  function setOpen(open: boolean, focus = true) {
    if (!nav || !openButton) return;
    nav.classList.toggle('is-open', open);
    openButton.setAttribute('aria-expanded', String(open));
    if (open) requestAnimationFrame(() => placePill(current, false));
    if (!focus) return;
    if (open) closeButton?.focus({ preventScroll: true });
    else openButton.focus({ preventScroll: true });
  }

  openButton?.addEventListener('click', () => setOpen(true));
  closeButton?.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav?.classList.contains('is-open')) setOpen(false);
  });
  document.addEventListener('pointerdown', (event) => {
    if (!nav?.classList.contains('is-open') || !(event.target instanceof Node)) return;
    if (wrap?.contains(event.target)) return;
    setOpen(false, false);
  });
  compact.addEventListener('change', () => setOpen(false, false));

  /* The closed capsule is clipped to the Menu button's width. */
  function measureMenu() {
    if (openButton && wrap) wrap.style.setProperty('--menu-w', `${openButton.offsetWidth}px`);
  }

  /* ---------- Selection pill ---------- */
  function placePill(target: HTMLElement | null, animate = true) {
    if (!pill || !capsule) return;
    items.forEach((item) => item.classList.toggle('is-target', item === target));
    if (!target) {
      pill.classList.remove('is-placed');
      return;
    }
    if (!animate) pill.style.transition = 'none';
    pill.style.width = `${target.offsetWidth}px`;
    pill.style.translate = `${target.offsetLeft}px 0`;
    pill.classList.add('is-placed');
    if (!animate) {
      pill.getBoundingClientRect();
      pill.style.transition = '';
    }
  }

  items.forEach((item) => {
    item.addEventListener('pointerenter', () => placePill(item));
    item.addEventListener('pointerdown', () => placePill(item));
    item.addEventListener('focus', () => placePill(item));
  });
  capsule?.addEventListener('pointerleave', () => placePill(current));
  capsule?.addEventListener('focusout', (event) => {
    if (!capsule.contains(event.relatedTarget as Node)) placePill(current);
  });

  /* ---------- Dark backgrounds under the toolbar ---------- */
  const darkZones = [...document.querySelectorAll<HTMLElement>('.hero, .site-footer')];
  function tone() {
    if (!wrap) return;
    const line = wrap.getBoundingClientRect().top + wrap.offsetHeight / 2;
    const dark = darkZones.some((zone) => {
      const r = zone.getBoundingClientRect();
      return r.top <= line && r.bottom >= line;
    });
    root.classList.toggle('glass-on-dark', dark);
  }
  window.addEventListener('scroll', tone, { passive: true });

  /* ---------- Refraction (Chromium) ---------- */
  const chromium = 'chrome' in window && /Chrome\//.test(navigator.userAgent);
  const SVG = 'http://www.w3.org/2000/svg';
  let defs: SVGSVGElement | null = null;

  /** Displacement map for a w x h capsule: neutral grey inside, and within `edge` px of the rim
      the red/green channels push samples outward along the rim's normal, strongest at the edge. */
  function displacementMap(w: number, h: number, edge: number) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const image = ctx.createImageData(w, h);
    const r = h / 2;
    const sd = (x: number, y: number) => {
      const qx = Math.abs(x - w / 2) - (w / 2 - r);
      const qy = Math.abs(y - h / 2) - (h / 2 - r);
      return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
    };
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const px = x + 0.5;
        const py = y + 0.5;
        const d = -sd(px, py);
        let red = 128;
        let green = 128;
        if (d > 0 && d < edge) {
          const nx = sd(px + 1, py) - sd(px - 1, py);
          const ny = sd(px, py + 1) - sd(px, py - 1);
          const len = Math.hypot(nx, ny) || 1;
          const m = Math.pow(1 - d / edge, 2);
          red = 128 + (nx / len) * m * 127;
          green = 128 + (ny / len) * m * 127;
        }
        image.data[i] = red;
        image.data[i + 1] = green;
        image.data[i + 2] = 128;
        image.data[i + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
    return canvas.toDataURL();
  }

  function refract(el: HTMLElement, id: string) {
    const w = Math.round(el.offsetWidth);
    const h = Math.round(el.offsetHeight);
    if (!w || !h) return;
    const map = displacementMap(w, h, Math.min(14, h / 3));
    if (!map) return;
    if (!defs) {
      defs = document.createElementNS(SVG, 'svg');
      defs.setAttribute('width', '0');
      defs.setAttribute('height', '0');
      defs.setAttribute('aria-hidden', 'true');
      defs.style.position = 'absolute';
      document.body.append(defs);
    }
    defs.querySelector(`#${id}`)?.remove();
    const filter = document.createElementNS(SVG, 'filter');
    filter.id = id;
    filter.setAttribute('color-interpolation-filters', 'sRGB');
    filter.setAttribute('x', '0');
    filter.setAttribute('y', '0');
    filter.setAttribute('width', String(w));
    filter.setAttribute('height', String(h));
    filter.setAttribute('filterUnits', 'userSpaceOnUse');
    const feImage = document.createElementNS(SVG, 'feImage');
    feImage.setAttribute('href', map);
    feImage.setAttribute('x', '0');
    feImage.setAttribute('y', '0');
    feImage.setAttribute('width', String(w));
    feImage.setAttribute('height', String(h));
    feImage.setAttribute('result', 'map');
    const displace = document.createElementNS(SVG, 'feDisplacementMap');
    displace.setAttribute('in', 'SourceGraphic');
    displace.setAttribute('in2', 'map');
    displace.setAttribute('scale', '18');
    displace.setAttribute('xChannelSelector', 'R');
    displace.setAttribute('yChannelSelector', 'G');
    filter.append(feImage, displace);
    defs.append(filter);
    const value = `blur(4px) url(#${id}) blur(10px) saturate(1.7) brightness(1.04)`;
    el.style.setProperty('backdrop-filter', value);
    el.style.setProperty('-webkit-backdrop-filter', value);
  }

  function refractAll() {
    if (!chromium) return;
    wrap?.querySelectorAll<HTMLElement>('[data-glass]').forEach((el, i) => {
      if (el.offsetWidth) refract(el, `glass-refract-${i}`);
    });
  }

  /* ---------- Start ---------- */
  function layout() {
    measureMenu();
    placePill(current, false);
    refractAll();
    tone();
  }
  document.fonts?.ready.then(layout);
  layout();
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(layout, 150);
  });
  /* The capsule only has a size once opened on phones; build its map then. */
  openButton?.addEventListener('click', () => window.setTimeout(refractAll, 460));
}
