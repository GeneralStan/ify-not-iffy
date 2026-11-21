/**
 * Case studies on phones and tablets (< 1024px) open as a tall bottom sheet over the page you came from:
 * a dimmed strip of the site stays visible above it (tap it to close), with a grab handle and a
 * close button at the top of the sheet. Drag the sheet down to close it. The URL changes to the
 * case study, and the back button closes the sheet (see the popstate guard in BaseLayout.astro).
 * Desktops follow the link to the full case study page as before.
 */

const phone = window.matchMedia('(max-width: 1023px)');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const CLOSE_MS = 300;
const DRAG_CLOSE_PX = 120;
const SVG_NS = 'http://www.w3.org/2000/svg';
const CLOSE_PATH =
  'M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z';

declare global {
  interface Window {
    __caseSheet?: { open: boolean; close: (fromHistory?: boolean) => void };
  }
}

let sheet: HTMLElement | null = null;
let lastFocus: HTMLElement | null = null;
let pageTitle = document.title;

/** Drag the panel down by its grab area (or anywhere while scrolled to the top); release past the
    threshold, or flick down, to close; otherwise it springs back. Shared with the standalone page. */
export function attachDrag(panel: HTMLElement, scroller: HTMLElement | Window, onClose: () => void) {
  let startY = 0;
  let lastY = 0;
  let lastT = 0;
  let velocity = 0;
  let dragging = false;
  const scrolled = () => (scroller instanceof Window ? scroller.scrollY : scroller.scrollTop) > 0;

  const onMove = (event: PointerEvent) => {
    const dy = event.clientY - startY;
    if (!dragging) {
      if (dy < 6) return; // only downward drags move the sheet
      dragging = true;
      try {
        panel.setPointerCapture(event.pointerId);
      } catch {
        /* capture is a nicety; dragging still works without it */
      }
      panel.classList.add('is-dragging');
    }
    const dt = Math.max(1, event.timeStamp - lastT);
    velocity = (event.clientY - lastY) / dt;
    lastY = event.clientY;
    lastT = event.timeStamp;
    panel.style.translate = `0 ${Math.max(0, dy)}px`;
  };

  const onUp = (event: PointerEvent) => {
    panel.removeEventListener('pointermove', onMove);
    if (!dragging) return;
    dragging = false;
    panel.classList.remove('is-dragging');
    const dy = event.clientY - startY;
    if (dy > DRAG_CLOSE_PX || velocity > 0.6) onClose();
    else panel.style.translate = '';
  };

  panel.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const onGrab = (event.target as Element).closest('[data-sheet-grab]');
    if (!onGrab && scrolled()) return;
    startY = lastY = event.clientY;
    lastT = event.timeStamp;
    velocity = 0;
    panel.addEventListener('pointermove', onMove);
    panel.addEventListener('pointerup', onUp, { once: true });
    panel.addEventListener('pointercancel', onUp, { once: true });
  });
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, attrs: Record<string, string> = {}) {
  const node = document.createElement(tag);
  node.className = className;
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  return node;
}

function closeButton() {
  const button = el('button', 'case-close case-sheet__close', { type: 'button', 'aria-label': 'Close case study' });
  button.dataset.sheetClose = '';
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('fill', 'currentColor');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', CLOSE_PATH);
  svg.append(path);
  button.append(svg);
  return button;
}

function chrome() {
  const root = el('div', 'case-sheet', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Case study' });
  const backdrop = el('button', 'case-sheet__backdrop', { type: 'button', 'aria-label': 'Close case study' });
  backdrop.dataset.sheetClose = '';
  const panel = el('div', 'case-sheet__panel');
  const grab = el('div', 'case-sheet__grab');
  grab.dataset.sheetGrab = '';
  grab.append(el('span', 'case-sheet__handle'));
  const scroll = el('div', 'case-sheet__scroll');
  const loading = el('p', 'case-sheet__loading text-body');
  loading.textContent = 'Loading…';
  scroll.append(loading);
  panel.append(grab, closeButton(), scroll);
  root.append(backdrop, panel);
  return { root, panel, scroll };
}

function finishClose() {
  sheet?.remove();
  sheet = null;
  document.documentElement.classList.remove('has-case-sheet');
  document.title = pageTitle;
  lastFocus?.focus({ preventScroll: true });
  if (window.__caseSheet) window.__caseSheet.open = false;
}

function close(fromHistory = false) {
  if (!sheet) return;
  if (!fromHistory && history.state?.caseSheet) {
    // Step back over the entry we pushed; the popstate guard then calls close(true).
    history.back();
    return;
  }
  sheet.classList.remove('is-open');
  window.setTimeout(finishClose, reduced.matches ? 0 : CLOSE_MS);
}

async function open(url: string, push = true) {
  if (sheet) return;
  lastFocus = document.activeElement as HTMLElement | null;
  pageTitle = document.title;
  const { root, panel, scroll } = chrome();
  sheet = root;
  document.body.append(root);
  document.documentElement.classList.add('has-case-sheet');
  window.__caseSheet = { open: true, close };
  if (push) history.pushState({ ...history.state, caseSheet: true }, '', url);

  root.querySelectorAll('[data-sheet-close]').forEach((node) => node.addEventListener('click', () => close()));
  attachDrag(panel, scroll, () => close());
  requestAnimationFrame(() => requestAnimationFrame(() => sheet?.classList.add('is-open')));
  root.querySelector<HTMLElement>('.case-sheet__close')?.focus({ preventScroll: true });

  try {
    const response = await fetch(url);
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    const main = doc.querySelector('.case-main');
    if (!sheet || !main) throw new Error('No case study content');
    root.setAttribute('aria-label', doc.title.split(' — ')[0] || 'Case study');
    if (sheet) document.title = doc.title;
    main.removeAttribute('id');
    scroll.replaceChildren(document.importNode(main, true));
    scroll.querySelectorAll<HTMLVideoElement>('video[data-lazy-video]').forEach((video) => {
      if (reduced.matches) return;
      video.preload = 'auto';
      video.play().catch(() => undefined);
    });
  } catch {
    // Could not load it in place: go to the page instead.
    location.href = url;
  }
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && sheet) close();
});

document.addEventListener(
  'click',
  (event) => {
    if (!phone.matches || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[data-case-sheet]');
    if (!link) return;
    event.preventDefault();
    event.stopPropagation();
    open(link.href);
  },
  true,
);

/* Forward into a sheet entry after closing it with back: open it again in place. */
window.addEventListener('case-sheet:reopen', () => open(location.href, false));
