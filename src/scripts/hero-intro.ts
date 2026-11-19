/**
 * Hero load-in, logo spin and polaroid pop.
 *
 * Rules (see .claude/skills/site-motion/SKILL.md):
 * - The hero waits for the display font, the logo and the polaroid before anything moves.
 * - Only transform and opacity animate. No bounce.
 * - Reduced motion: no intro and no spin; the polaroid keeps its shimmer but does not scale.
 */

const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Matches --motion-ease-spin: a short ease-in, then a long settle (fast early, slow at the end). */
const EASE_SPIN = 'cubic-bezier(0.3, 0, 0.1, 1)';
/** Matches --motion-ease-enter (easeOutExpo). */
const EASE_ENTER = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_IN_OUT = 'cubic-bezier(0.65, 0, 0.35, 1)';

const INTRO_SPIN_MS = 2000;
const REPLAY_SPIN_MS = 1600;
const INTRO_TOTAL_MS = 1900;

/* ---------- Logo spin ---------- */

const logo = document.querySelector<HTMLElement>('[data-spin]');
const mark = logo?.querySelector<SVGElement>('svg') ?? null;
let spin: Animation | null = null;

function spinLogo(duration: number, delay = 0) {
  if (!mark || reduced.matches) return;
  if (spin && spin.playState === 'running') return; // never restart mid-spin
  spin = mark.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], {
    duration,
    delay,
    easing: EASE_SPIN,
  });
}

if (logo) {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  logo.addEventListener('pointerenter', () => {
    if (finePointer.matches) spinLogo(REPLAY_SPIN_MS);
  });
  logo.addEventListener('pointerup', (event) => {
    if (event.pointerType !== 'mouse') spinLogo(REPLAY_SPIN_MS);
  });
}

/* ---------- Polaroid pop + shimmer ---------- */

const polaroid = document.querySelector<HTMLElement>('[data-polaroid]');
const card = polaroid?.querySelector<HTMLElement>('.polaroid__card') ?? null;
const shine = polaroid?.querySelector<HTMLElement>('.polaroid__shine') ?? null;
let pop: Animation | null = null;
let sweep: Animation | null = null;

function popPolaroid() {
  if (!card || !shine || !polaroid) return;
  pop?.cancel();
  sweep?.cancel();
  polaroid.classList.add('is-popping');

  sweep = shine.animate(
    [
      { transform: 'translateX(-130%) skewX(-18deg)', opacity: 0 },
      { opacity: 1, offset: 0.2 },
      { opacity: 1, offset: 0.75 },
      { transform: 'translateX(130%) skewX(-18deg)', opacity: 0 },
    ],
    { duration: 760, easing: EASE_IN_OUT, pseudoElement: '::before' },
  );

  if (!reduced.matches) {
    pop = card.animate(
      [
        { transform: 'scale(1)', easing: EASE_ENTER },
        { transform: 'scale(1.2)', offset: 0.42, easing: EASE_IN_OUT },
        { transform: 'scale(1)' },
      ],
      { duration: 720 },
    );
  }

  const done = pop ?? sweep;
  done.finished
    .then(() => polaroid.classList.remove('is-popping'))
    .catch(() => {
      /* cancelled by a newer tap */
    });
}

polaroid?.addEventListener('click', popPolaroid);

/* ---------- Polaroid placement ---------- */

const headline = document.querySelector<HTMLElement>('[data-headline]');
const firstLine = headline?.querySelector<HTMLElement>('[data-line] .hero-line__inner') ?? null;

/** Pin the photo just past the last word of the headline's first visual line (Figma: x +0.12em, y -0.62em). */
function placePolaroid() {
  if (!headline || !firstLine || !polaroid) return;
  const range = document.createRange();
  range.selectNodeContents(firstLine);
  const rects = [...range.getClientRects()].filter((r) => r.width > 0);
  if (!rects.length) return;
  const top = Math.min(...rects.map((r) => r.top));
  const lineEnd = Math.max(...rects.filter((r) => Math.abs(r.top - top) < 2).map((r) => r.right));
  const box = headline.getBoundingClientRect();
  const em = parseFloat(getComputedStyle(headline).fontSize);
  const width = polaroid.offsetWidth;
  // Keep the photo inside the viewport on narrow phones.
  const maxX = document.documentElement.clientWidth - box.left - width - 4;
  const x = Math.min(lineEnd - box.left + 0.12 * em, maxX);
  // Undo the line's intro transform: measure from the line box, not the moving text.
  const lineBox = firstLine.parentElement!.getBoundingClientRect();
  const y = lineBox.top - box.top - 0.62 * em;
  polaroid.style.setProperty('--pol-x', `${x}px`);
  polaroid.style.setProperty('--pol-y', `${y}px`);
}

if (headline) {
  placePolaroid();
  document.fonts?.ready.then(placePolaroid);
  new ResizeObserver(placePolaroid).observe(headline);
}

/* ---------- Load-in ---------- */

function decoded(img: HTMLImageElement | null) {
  if (!img) return Promise.resolve();
  if (img.complete) return img.decode().catch(() => undefined);
  return new Promise<void>((resolve) => {
    img.addEventListener('load', () => resolve(), { once: true });
    img.addEventListener('error', () => resolve(), { once: true });
  });
}

async function intro() {
  if (!root.classList.contains('intro-wait')) {
    // Reduced motion, or the safety timeout already revealed the page.
    return;
  }

  const fonts = document.fonts?.ready ?? Promise.resolve();
  const photo = polaroid?.querySelector<HTMLImageElement>('img') ?? null;
  const cap = new Promise((resolve) => setTimeout(resolve, 1800));
  await Promise.race([Promise.all([fonts, decoded(photo)]), cap]);

  if (!root.classList.contains('intro-wait')) return;

  root.classList.add('intro-play');
  root.classList.remove('intro-wait');
  spinLogo(INTRO_SPIN_MS, 120);

  window.setTimeout(() => root.classList.remove('intro-play'), INTRO_TOTAL_MS + 400);
}

intro();
