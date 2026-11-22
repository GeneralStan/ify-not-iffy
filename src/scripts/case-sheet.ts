/**
 * Case study overlay. Every case study is its own page with its own address, drawn over Home:
 * - Desktop (1024+): a drawer that slides in from the right.
 * - Phones and tablets: a bottom sheet with a grab handle; drag the handle down to close.
 * Both sit over a frosted Stone/950 20% backdrop (tap it to close), with the shared round × (the
 * menu's ×, 40px) and Escape.
 *
 * Two ways in:
 * - From Home, tapping a card loads the case study in place: the address changes (shareable), and
 *   Back closes it (see the popstate guard in BaseLayout.astro); Forward opens it again.
 * - Opening the address directly renders Home with the overlay already there (CaseStudy.astro);
 *   it slides in on load, and closing it leaves you on Home at Selected projects.
 *
 * Scrolling happens inside the overlay only; the page underneath is locked. Dragging is limited to
 * the handle so scrolling up never tugs the sheet.
 */

const desktop = window.matchMedia('(min-width: 1024px)');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const DRAG_CLOSE_PX = 120;
const SVG_NS = 'http://www.w3.org/2000/svg';
const CLOSE_PATH =
  'M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z';

declare global {
  interface Window {
    __caseSheet?: { open: boolean; close: (fromHistory?: boolean) => void };
  }
}

const root = document.documentElement;
let sheet: HTMLElement | null = null;
let lastFocus: HTMLElement | null = null;
let pageTitle = document.title;
let tocCleanup: (() => void) | null = null;

/** Exit takes a little less time than entry (matches the CSS in case-study.css). */
const exitMs = () => (reduced.matches ? 0 : desktop.matches ? 380 : 320);

/* ---------- Drag the sheet down by its handle (phones and tablets) ---------- */
function attachDrag(panel: HTMLElement, onClose: () => void) {
  const grab = panel.querySelector<HTMLElement>('[data-sheet-grab]');
  if (!grab) return;
  let startY = 0;
  let lastY = 0;
  let lastT = 0;
  let velocity = 0;
  let dragging = false;

  const onMove = (event: PointerEvent) => {
    const dy = event.clientY - startY;
    if (!dragging) {
      if (dy < 4) return;
      dragging = true;
      panel.classList.add('is-dragging');
    }
    const dt = Math.max(1, event.timeStamp - lastT);
    velocity = (event.clientY - lastY) / dt;
    lastY = event.clientY;
    lastT = event.timeStamp;
    panel.style.translate = `0 ${Math.max(0, dy)}px`;
  };

  const onUp = (event: PointerEvent) => {
    grab.removeEventListener('pointermove', onMove);
    if (!dragging) return;
    dragging = false;
    panel.classList.remove('is-dragging');
    const dy = event.clientY - startY;
    panel.style.translate = '';
    if (dy > DRAG_CLOSE_PX || velocity > 0.6) onClose();
  };

  grab.addEventListener('pointerdown', (event) => {
    if (desktop.matches || (event.pointerType === 'mouse' && event.button !== 0)) return;
    startY = lastY = event.clientY;
    lastT = event.timeStamp;
    velocity = 0;
    try {
      grab.setPointerCapture(event.pointerId);
    } catch {
      /* capture is a nicety */
    }
    grab.addEventListener('pointermove', onMove);
    grab.addEventListener('pointerup', onUp, { once: true });
    grab.addEventListener('pointercancel', onUp, { once: true });
  });
}

/* ---------- Side nav inside the overlay (desktop): current section, smooth jumps ---------- */
function bindToc(scope: HTMLElement, scroller: HTMLElement) {
  tocCleanup?.();
  const links = new Map<string, HTMLElement>();
  scope.querySelectorAll<HTMLElement>('[data-toc-link]').forEach((link) => links.set(link.dataset.tocLink!, link));
  const sections = scope.querySelectorAll<HTMLElement>('[data-toc-section]');
  if (!links.size || !sections.length) return;
  const setCurrent = (id: string) =>
    links.forEach((link, key) => (key === id ? link.setAttribute('aria-current', 'true') : link.removeAttribute('aria-current')));
  setCurrent(sections[0].id);

  const onClick = (event: Event) => {
    const link = (event.target as Element).closest<HTMLElement>('[data-toc-link]');
    if (!link) return;
    const target = scope.querySelector<HTMLElement>(`#${link.dataset.tocLink}`);
    if (!target) return;
    event.preventDefault();
    const top = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    scroller.scrollTo({ top, behavior: reduced.matches ? 'auto' : 'smooth' });
  };
  scope.addEventListener('click', onClick);

  let observer: IntersectionObserver | null = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) setCurrent(visible[0].target.id);
      },
      { root: scroller, rootMargin: '-30% 0px -60% 0px' },
    );
    sections.forEach((section) => observer!.observe(section));
  }
  tocCleanup = () => {
    scope.removeEventListener('click', onClick);
    observer?.disconnect();
    tocCleanup = null;
  };
}

/* ---------- Overlay chrome for case studies opened from Home ---------- */
function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, attrs: Record<string, string> = {}) {
  const node = document.createElement(tag);
  node.className = className;
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  return node;
}

function closeButton() {
  const button = el('button', 'overlay-close case-sheet__close', { type: 'button', 'aria-label': 'Close case study' });
  button.dataset.sheetClose = '';
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', '20');
  svg.setAttribute('height', '20');
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
  const node = el('div', 'case-sheet', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Case study' });
  const backdrop = el('button', 'case-sheet__backdrop', { type: 'button', 'aria-label': 'Close case study' });
  backdrop.dataset.sheetClose = '';
  const panel = el('div', 'case-sheet__panel');
  const grab = el('div', 'case-sheet__grab', { 'aria-hidden': 'true' });
  grab.dataset.sheetGrab = '';
  grab.append(el('span', 'case-sheet__handle'));
  const scroll = el('div', 'case-sheet__scroll');
  scroll.dataset.sheetScroll = '';
  const loading = el('p', 'case-sheet__loading text-body');
  loading.textContent = 'Loading…';
  scroll.append(loading);
  panel.append(grab, closeButton(), scroll);
  node.append(backdrop, panel);
  return node;
}

/** Wire an overlay (built here or rendered by the page) and slide it in. */
function wire(node: HTMLElement) {
  sheet = node;
  root.classList.add('has-case-sheet');
  window.__caseSheet = { open: true, close };
  node.querySelectorAll<HTMLElement>('[data-sheet-close]').forEach((control) =>
    control.addEventListener('click', (event) => {
      event.preventDefault();
      close();
    }),
  );
  const panel = node.querySelector<HTMLElement>('.case-sheet__panel');
  if (panel) attachDrag(panel, () => close());
  requestAnimationFrame(() => requestAnimationFrame(() => node.classList.add('is-open')));
  node.querySelector<HTMLElement>('.case-sheet__close')?.focus({ preventScroll: true });
}

function finishClose() {
  const wasStatic = sheet?.hasAttribute('data-case-static');
  const homeHref = sheet?.dataset.homeHref;
  const homeTitle = sheet?.dataset.homeTitle;
  tocCleanup?.();
  sheet?.remove();
  sheet = null;
  root.classList.remove('has-case-sheet');
  if (window.__caseSheet) window.__caseSheet.open = false;
  if (wasStatic) {
    // Opened by its own address: what's left is Home, so the address and title become Home's.
    if (homeHref) history.replaceState(null, '', homeHref);
    if (homeTitle) document.title = homeTitle;
    document.querySelector<HTMLElement>('#work')?.scrollIntoView({ block: 'start' });
  } else {
    document.title = pageTitle;
    lastFocus?.focus({ preventScroll: true });
  }
}

function close(fromHistory = false) {
  if (!sheet) return;
  if (!fromHistory && !sheet.hasAttribute('data-case-static') && history.state?.caseSheet) {
    // Step back over the entry we pushed; the popstate guard then calls close(true).
    history.back();
    return;
  }
  sheet.classList.add('is-closing');
  sheet.classList.remove('is-open');
  window.setTimeout(finishClose, exitMs());
}

async function open(url: string, push = true) {
  if (sheet) return;
  lastFocus = document.activeElement as HTMLElement | null;
  pageTitle = document.title;
  const node = chrome();
  document.body.append(node);
  if (push) history.pushState({ ...history.state, caseSheet: true }, '', url);
  wire(node);
  const scroll = node.querySelector<HTMLElement>('[data-sheet-scroll]')!;

  try {
    const response = await fetch(url);
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    const layout = doc.querySelector('[data-case-layout]');
    if (sheet !== node || !layout) throw new Error('No case study content');
    node.setAttribute('aria-label', doc.title.split(' — ')[0] || 'Case study');
    document.title = doc.title;
    scroll.replaceChildren(document.importNode(layout, true));
    bindToc(scroll, scroll);
    scroll.querySelectorAll<HTMLVideoElement>('video[data-lazy-video]').forEach((video) => {
      if (reduced.matches) return;
      video.preload = 'auto';
      video.play().catch(() => undefined);
    });
  } catch {
    // Could not load it in place: go to its page instead (which draws the same overlay).
    location.href = url;
  }
}

/* ---------- Start ---------- */

/* Opened by its own address: the page already holds the overlay. */
const staticSheet = document.querySelector<HTMLElement>('[data-case-static]');
if (staticSheet) {
  wire(staticSheet);
  const scroll = staticSheet.querySelector<HTMLElement>('[data-sheet-scroll]');
  if (scroll) bindToc(scroll, scroll);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && sheet) close();
});

/* Cards on Home open the overlay in place (any screen size); modified clicks open a new tab. */
document.addEventListener(
  'click',
  (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[data-case-sheet]');
    if (!link || sheet) return;
    event.preventDefault();
    event.stopPropagation();
    open(link.href);
  },
  true,
);

/* Forward into a case study entry after closing it with Back: open it again in place. */
window.addEventListener('case-sheet:reopen', () => open(location.href, false));
