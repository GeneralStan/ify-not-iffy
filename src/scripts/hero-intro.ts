/**
 * Hero load-in, logo spin and hero polaroid placement.
 *
 * Rules (see .claude/skills/site-motion/SKILL.md):
 * - The hero waits for the display font and the polaroid before anything moves.
 * - Only transform and opacity animate. No bounce.
 * - Reduced motion: no intro and no spin.
 * Polaroid hover / pop lives in src/scripts/polaroid.ts.
 */

const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

/** Matches --motion-ease-spin: a short ease-in, then a long settle (fast early, slow at the end). */
const EASE_SPIN = 'cubic-bezier(0.3, 0, 0.1, 1)';

const INTRO_SPIN_MS = 2000;
const REPLAY_SPIN_MS = 1600;
const INTRO_TOTAL_MS = 1900;

/* ---------- Logo spin (hero logo and docked logo) ----------
   The SVG turns around the petals' hub (transform-origin set in CSS), so it never drifts. */

const spins = new WeakMap<Element, Animation>();

function spinLogo(host: Element | null, duration: number, delay = 0) {
  const mark = host?.querySelector('svg');
  if (!host || !mark || reduced.matches) return;
  if (spins.get(host)?.playState === 'running') return; // never restart mid-spin
  spins.set(
    host,
    mark.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], {
      duration,
      delay,
      easing: EASE_SPIN,
    }),
  );
}

document.querySelectorAll('[data-spin]').forEach((host) => {
  host.addEventListener('pointerenter', () => {
    if (finePointer.matches) spinLogo(host, REPLAY_SPIN_MS);
  });
  host.addEventListener('pointerup', (event) => {
    if ((event as PointerEvent).pointerType !== 'mouse') spinLogo(host, REPLAY_SPIN_MS);
  });
});

// The docked logo links home; on the home page it scrolls back to the hero instead of reloading.
document.querySelector<HTMLAnchorElement>('[data-flap-logo]')?.addEventListener('click', (event) => {
  if (!document.querySelector('[data-hero]')) return;
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: reduced.matches ? 'auto' : 'smooth' });
});

/* ---------- Hero polaroid placement ----------
   Figma 4033:3415: the photo's centre sits 0.69em right of the end of "Ulasika"
   and 0.43em below the top of the first line (56px display type). */

const headline = document.querySelector<HTMLElement>('[data-headline]');
const firstLine = headline?.querySelector<HTMLElement>('[data-line] .hero-line__inner') ?? null;
const heroPolaroid = headline?.querySelector<HTMLElement>('[data-polaroid]') ?? null;

const POL_DX = 0.686; // centre of the photo, past the line end
const POL_DY = 0.43;

function placePolaroid() {
  if (!headline || !firstLine || !heroPolaroid) return;
  const range = document.createRange();
  range.selectNodeContents(firstLine);
  const rects = [...range.getClientRects()].filter((r) => r.width > 0);
  if (!rects.length) return;
  const top = Math.min(...rects.map((r) => r.top));
  const lineEnd = Math.max(...rects.filter((r) => Math.abs(r.top - top) < 2).map((r) => r.right));
  const box = headline.getBoundingClientRect();
  const em = parseFloat(getComputedStyle(headline).fontSize);
  const width = heroPolaroid.offsetWidth;
  const height = heroPolaroid.offsetHeight;
  // Keep the card inside the viewport on narrow phones (the tilted card reaches 87% across the box).
  const maxX = document.documentElement.clientWidth - box.left - width * 0.87 - 4;
  const wantX = lineEnd - box.left + POL_DX * em - width / 2;
  const x = Math.min(wantX, maxX);
  // When it has to move in over the word, lift it by the same amount (up to one line) so it pins
  // to the word's top corner instead of covering it.
  const lift = Math.min(Math.max(wantX - x, 0), em);
  // Measure from the line box, not the moving text, so the intro transform does not skew it.
  const lineBox = firstLine.parentElement!.getBoundingClientRect();
  const y = lineBox.top - box.top + POL_DY * em - height / 2 - lift;
  heroPolaroid.style.setProperty('--pol-x', `${x}px`);
  heroPolaroid.style.setProperty('--pol-y', `${y}px`);
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
  const photo = heroPolaroid?.querySelector<HTMLImageElement>('img') ?? null;
  const cap = new Promise((resolve) => setTimeout(resolve, 1800));
  await Promise.race([Promise.all([fonts, decoded(photo)]), cap]);

  if (!root.classList.contains('intro-wait')) return;

  root.classList.add('intro-play');
  root.classList.remove('intro-wait');
  spinLogo(document.querySelector('.hero-logo[data-spin]'), INTRO_SPIN_MS, 120);

  window.setTimeout(() => root.classList.remove('intro-play'), INTRO_TOTAL_MS + 400);
}

intro();
