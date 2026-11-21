/**
 * Home hero load-in.
 *
 * Rules (see .claude/skills/site-motion/SKILL.md):
 * - The hero waits for the display font and the polaroid before anything moves.
 * - Only transform and opacity animate. No bounce.
 * - Reduced motion: no intro.
 * The polaroid and the ampersand are placed in CSS (home.css); polaroid hover / pop lives in
 * src/scripts/polaroid.ts.
 */

const root = document.documentElement;

/* Matches the timeline in home.css (intro-play): the hedges pop once the copy has landed. */
const HEDGE_POP_AT = 900;
const INTRO_TOTAL_MS = 1950;

function decoded(img: HTMLImageElement | null) {
  if (!img) return Promise.resolve();
  if (img.complete) return img.decode().catch(() => undefined);
  return new Promise<void>((resolve) => {
    img.addEventListener('load', () => resolve(), { once: true });
    img.addEventListener('error', () => resolve(), { once: true });
  });
}

async function intro() {
  // Reduced motion, a page without the hero, or the safety timeout already revealed it.
  if (!root.classList.contains('intro-wait')) return;

  const fonts = document.fonts?.ready ?? Promise.resolve();
  const photo = document.querySelector<HTMLImageElement>('.hero-polaroid img');
  const cap = new Promise((resolve) => setTimeout(resolve, 1800));
  await Promise.race([Promise.all([fonts, decoded(photo)]), cap]);

  if (!root.classList.contains('intro-wait')) return;

  root.classList.add('intro-play');
  root.classList.remove('intro-wait');
  window.setTimeout(
    () => document.querySelector('[data-hedges="hero"]')?.classList.add('is-popped'),
    HEDGE_POP_AT,
  );
  window.setTimeout(() => root.classList.remove('intro-play'), INTRO_TOTAL_MS + 300);
}

intro();
