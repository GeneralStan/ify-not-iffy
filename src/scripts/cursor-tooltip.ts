/**
 * Cursor tooltip (Figma "Tooltip" 4042:3946): a glassy pill that follows the pointer over any
 * [data-tooltip] element and shows that attribute's text. Fine pointers only; touch shows nothing.
 * It eases after the pointer with a light lerp (translate only), scales in on enter, out on leave.
 */

const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

const OFFSET_X = 16;
const OFFSET_Y = 20;
const FOLLOW = 0.22;

let tip: HTMLElement | null = null;
let active: Element | null = null;
let frame = 0;
const target = { x: 0, y: 0 };
const pos = { x: 0, y: 0 };

function ensureTip() {
  // The router swaps <body> content on page changes, so re-attach if it was dropped.
  if (!tip) {
    tip = document.createElement('div');
    tip.className = 'cursor-tip';
    tip.setAttribute('aria-hidden', 'true');
    tip.innerHTML = '<span class="cursor-tip__pill text-label-md"></span>';
  }
  if (!tip.isConnected) document.body.append(tip);
  return tip;
}

function place() {
  if (!tip) return;
  tip.style.translate = `${pos.x}px ${pos.y}px`;
}

function tick() {
  frame = 0;
  const step = reduced.matches ? 1 : FOLLOW;
  pos.x += (target.x - pos.x) * step;
  pos.y += (target.y - pos.y) * step;
  place();
  if (Math.abs(target.x - pos.x) > 0.3 || Math.abs(target.y - pos.y) > 0.3) frame = requestAnimationFrame(tick);
}

function show(host: Element, event: PointerEvent) {
  const el = ensureTip();
  el.querySelector('.cursor-tip__pill')!.textContent = host.getAttribute('data-tooltip') ?? '';
  target.x = pos.x = event.clientX + OFFSET_X;
  target.y = pos.y = event.clientY + OFFSET_Y;
  place();
  el.classList.add('is-on');
}

function hide() {
  active = null;
  tip?.classList.remove('is-on');
}

document.addEventListener('pointerover', (event) => {
  if (!fine.matches || event.pointerType !== 'mouse') return;
  const host = event.target instanceof Element ? event.target.closest('[data-tooltip]') : null;
  if (host === active) return;
  if (!host) return hide();
  active = host;
  show(host, event);
});

document.addEventListener('pointermove', (event) => {
  if (!active) return;
  target.x = event.clientX + OFFSET_X;
  target.y = event.clientY + OFFSET_Y;
  if (!frame) frame = requestAnimationFrame(tick);
});

document.addEventListener('pointerout', (event) => {
  if (!active) return;
  const to = event.relatedTarget instanceof Element ? event.relatedTarget.closest('[data-tooltip]') : null;
  if (to !== active) hide();
});

window.addEventListener('scroll', () => active && hide(), { passive: true });
