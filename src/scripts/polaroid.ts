/**
 * Polaroid interactions, for every [data-polaroid] on the page.
 * - Hover (fine pointer): CSS scales the card to 1.1 (Polaroid.astro).
 * - Click / tap: a white sheen sweeps across once and the card pops to 1.2 and settles back.
 *   The pop is relative to the hover scale, so a hovered card still peaks at 1.2, not 1.32.
 * Reduced motion: the sheen still plays, the card does not scale.
 */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

/** Matches --motion-ease-enter (easeOutExpo). */
const EASE_ENTER = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_IN_OUT = 'cubic-bezier(0.65, 0, 0.35, 1)';
const HOVER_SCALE = 1.1;
const POP_SCALE = 1.2;

const running = new WeakMap<HTMLElement, Animation[]>();

function pop(polaroid: HTMLElement) {
  const card = polaroid.querySelector<HTMLElement>('.polaroid__card');
  const shine = polaroid.querySelector<HTMLElement>('.polaroid__shine');
  if (!card || !shine) return;

  running.get(polaroid)?.forEach((animation) => animation.cancel());
  polaroid.classList.add('is-popping');

  const animations: Animation[] = [
    shine.animate(
      [
        { transform: 'translateX(-130%) skewX(-18deg)', opacity: 0 },
        { opacity: 1, offset: 0.2 },
        { opacity: 1, offset: 0.75 },
        { transform: 'translateX(130%) skewX(-18deg)', opacity: 0 },
      ],
      { duration: 760, easing: EASE_IN_OUT, pseudoElement: '::before' },
    ),
  ];

  if (!reduced.matches) {
    const hovered = finePointer.matches && polaroid.matches(':hover');
    const peak = POP_SCALE / (hovered ? HOVER_SCALE : 1);
    animations.push(
      card.animate(
        [
          { transform: 'scale(1)', easing: EASE_ENTER },
          { transform: `scale(${peak})`, offset: 0.42, easing: EASE_IN_OUT },
          { transform: 'scale(1)' },
        ],
        { duration: 720 },
      ),
    );
  }

  running.set(polaroid, animations);
  animations[animations.length - 1].finished
    .then(() => polaroid.classList.remove('is-popping'))
    .catch(() => {
      /* cancelled by a newer tap */
    });
}

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const polaroid = target.closest<HTMLElement>('[data-polaroid]');
  if (polaroid) pop(polaroid);
});
