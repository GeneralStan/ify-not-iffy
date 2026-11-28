/**
 * Case study overlay. Every case study is its own page with its own address, drawn over Home:
 * - Desktop (1024+): a full-width drawer that slides in from the right.
 * - Phones and tablets: a bottom sheet with a grab handle; drag the handle down to close.
 * Both sit over a frosted Stone/950 20% backdrop (tap it to close), with the shared glass × and
 * Escape.
 *
 * Two ways in:
 * - From Home, tapping a card loads the case study in place: the address changes (shareable), and
 *   Back closes it (see the popstate guard in BaseLayout.astro); Forward opens it again.
 * - Opening the address directly renders Home with the overlay already there (CaseStudy.astro);
 *   it slides in on load, and closing it leaves you on Home at Selected projects.
 *
 * Motion (Emil Kowalski's drawer notes):
 * - The panel moves on one CSS transition (500ms, the Vaul curve), so a close mid-open reverses
 *   from where it is.
 * - Nothing heavy happens while it moves. The page is fetched on hover or touch, before the click;
 *   if it is not ready yet, a skeleton of the same layout slides in and the content replaces it
 *   only once the panel has stopped.
 * - The page underneath is not scroll-locked with overflow:hidden (that drops the scrollbar and
 *   reflows Home on desktop, and moves Safari's toolbar on iOS mid-slide). Instead the overlay
 *   swallows wheel and touch scrolling outside its own scroller. Home's videos and animations
 *   pause underneath, so the frosted backdrop is not re-blurred every frame.
 * - The card's image glides into the hero image box as the overlay opens, and back into the card
 *   as it closes (a fixed "ghost" copy above everything; see fly()).
 */

const desktop = window.matchMedia('(min-width: 1024px)');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const DRAG_CLOSE_PX = 120;
const PANEL_MS = 500;
const PANEL_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
/* Desktop: the image eases in and out across the gap between the card and the drawer's hero. */
const GLIDE_EASE_DESKTOP = 'cubic-bezier(0.65, 0, 0.35, 1)';
const GLIDE_MS_DESKTOP = 560;
const SVG_NS = 'http://www.w3.org/2000/svg';
const CLOSE_PATH =
  'M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z';

declare global {
  interface Window {
    __caseSheet?: { open: boolean; close: (fromHistory?: boolean) => void };
    /** BaseLayout.astro: focus the control for keyboard users, else the container (no ring). */
    __ifyFocus?: (control: HTMLElement | null, container?: HTMLElement | null) => void;
    __ifySkeleton?: (scope?: ParentNode) => void;
  }
}

const root = document.documentElement;
let sheet: HTMLElement | null = null;
let closing = false;
let lastFocus: HTMLElement | null = null;
let pageTitle = document.title;
let tocCleanup: (() => void) | null = null;
let ghost: Ghost | null = null;
let pausedVideos: HTMLVideoElement[] = [];

const exitMs = () => (reduced.matches ? 0 : PANEL_MS);
const HERO_BOX = '.case-hero__media .study-media--hero';

/* Safari's top bar can't show a translucent colour, so while the overlay is open it gets the
   overlay pre-blended over the page: Stone/950 at 20% over Stone/0. */
const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
const themeDefault = themeMeta?.content ?? '';
const setTheme = (open: boolean) => themeMeta && (themeMeta.content = open ? '#CECDCA' : themeDefault);

/* ---------- Fetch ahead: on hover (desktop) or touch (phones), before the click lands ---------- */
const pages = new Map<string, Promise<Document | null>>();
const ready = new Map<string, Document>();

function load(url: string) {
  const key = new URL(url, location.href).pathname;
  let page = pages.get(key);
  if (!page) {
    page = fetch(url)
      .then((response) => (response.ok ? response.text() : Promise.reject(new Error(String(response.status)))))
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        ready.set(key, doc);
        return doc;
      })
      .catch(() => {
        pages.delete(key);
        return null;
      });
    pages.set(key, page);
  }
  return page;
}

const cardLink = (target: EventTarget | null) =>
  target instanceof Element ? target.closest<HTMLAnchorElement>('a[data-case-sheet]') : null;

document.addEventListener('pointerover', (event) => {
  const link = cardLink(event.target);
  if (link) load(link.href);
});
document.addEventListener(
  'pointerdown',
  (event) => {
    const link = cardLink(event.target);
    if (link) load(link.href);
  },
  { passive: true },
);

/** The card on Home that opens this address, if it is on the page. */
function cardFor(url: string) {
  if (!url) return undefined;
  const path = new URL(url, location.href).pathname;
  return [...document.querySelectorAll<HTMLAnchorElement>('a[data-case-sheet]')].find(
    (link) => new URL(link.href).pathname === path,
  );
}

/* ---------- The image glide between a card and the hero box ---------- */
interface Ghost {
  node: HTMLElement;
  card: HTMLElement;
}

const rectOf = (el: Element) => el.getBoundingClientRect();
const inView = (r: DOMRect) => r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;

/** A fixed copy of the card's media. Its content keeps the card's size and only scales uniformly,
    so nothing stretches while the box itself grows into the hero's shape. */
function makeGhost(card: HTMLElement, at: DOMRect, radius: string) {
  const node = document.createElement('div');
  node.className = 'case-ghost';
  node.setAttribute('aria-hidden', 'true');
  Object.assign(node.style, {
    left: `${at.left}px`,
    top: `${at.top}px`,
    width: `${at.width}px`,
    height: `${at.height}px`,
    borderRadius: radius,
  });
  const media = card.cloneNode(true) as HTMLElement;
  media.removeAttribute('data-skeleton');
  media.classList.remove('is-skeleton');
  media.classList.add('case-ghost__media');
  media.style.visibility = 'visible';
  const box = rectOf(card);
  media.style.width = `${box.width}px`;
  media.style.height = `${box.height}px`;
  node.append(media);
  document.body.append(node);
  return { node, media, box };
}

/** Fly a copy of the card's media from one box to another. */
function fly(from: DOMRect, to: DOMRect, fromRadius: string, toRadius: string, card: HTMLElement, opening: boolean) {
  const { node, media, box } = makeGhost(card, from, fromRadius);
  const scaleAt = (r: DOMRect) => Math.min(r.width / box.width, r.height / box.height);
  const onDesktop = desktop.matches;
  const timing: KeyframeAnimationOptions = {
    duration: onDesktop && opening ? GLIDE_MS_DESKTOP : PANEL_MS,
    easing: onDesktop && opening ? GLIDE_EASE_DESKTOP : PANEL_EASE,
    fill: 'forwards',
  };
  const frame = (r: DOMRect, radius: string) => ({
    left: `${r.left}px`,
    top: `${r.top}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
    borderRadius: radius,
  });
  const outer = node.animate([frame(from, fromRadius), frame(to, toRadius)], timing);
  media.animate(
    [
      { transform: `translate(-50%, -50%) scale(${scaleAt(from)})` },
      { transform: `translate(-50%, -50%) scale(${scaleAt(to)})` },
    ],
    timing,
  );
  // Never wait on the animation alone (a background tab may not run it).
  const limit = new Promise((resolve) => window.setTimeout(resolve, Number(timing.duration) + 120));
  return { node, outer, landed: Promise.race([outer.finished.catch(() => undefined), limit]) };
}

/** Where `el` will be once the panel has finished sliding in (it is still off-screen now). */
function restingRect(el: HTMLElement, panel: HTMLElement) {
  const r = rectOf(el);
  const p = rectOf(panel);
  return new DOMRect(r.left - (p.left - panel.offsetLeft), r.top - (p.top - panel.offsetTop), r.width, r.height);
}

function dropGhost(fade = true) {
  const current = ghost;
  ghost = null;
  if (!current) return;
  current.card.style.visibility = '';
  if (!fade || reduced.matches) {
    current.node.remove();
    return;
  }
  const remove = () => current.node.remove();
  current.node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease-out', fill: 'forwards' }).finished.then(remove, remove);
}

/** After landing, the copy moves into the hero box (so it scrolls with it) and stands in as the
    hero image until the real content is there. */
function parkGhost(holder: HTMLElement | null) {
  if (!ghost || !holder) return;
  ghost.node.getAnimations().forEach((animation) => animation.cancel());
  Object.assign(ghost.node.style, {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    borderRadius: '20px',
    zIndex: '2',
  });
  holder.style.position = 'relative';
  holder.append(ghost.node);
}

/* ---------- Drag the sheet down by its handle (phones and tablets) ---------- */
function attachDrag(panel: HTMLElement, onClose: () => void) {
  const grab = panel.querySelector<HTMLElement>('[data-sheet-grab]');
  if (!grab) return;
  let startY = 0;
  let lastY = 0;
  let lastT = 0;
  let velocity = 0;
  let dragging = false;
  let pointer: number | null = null;

  const onMove = (event: PointerEvent) => {
    if (event.pointerId !== pointer) return;
    const dy = event.clientY - startY;
    if (!dragging) {
      if (Math.abs(dy) < 4) return;
      dragging = true;
      panel.classList.add('is-dragging');
    }
    const dt = Math.max(1, event.timeStamp - lastT);
    velocity = (event.clientY - lastY) / dt;
    lastY = event.clientY;
    lastT = event.timeStamp;
    // Down follows the finger; up (the wrong way) is damped, moving less the further you pull.
    const y = dy >= 0 ? dy : -8 * Math.log1p(-dy / 8);
    // Set the transform directly (no CSS variable), so a drag never restyles the content.
    panel.style.translate = `0 ${y}px`;
  };

  const onUp = (event: PointerEvent) => {
    if (event.pointerId !== pointer) return;
    pointer = null;
    grab.removeEventListener('pointermove', onMove);
    if (!dragging) return;
    dragging = false;
    const dy = event.clientY - startY;
    // Transition back on, then move: a close carries on down from the finger (close() clears the
    // inline offset in the same frame the open state goes), a cancel springs back up. Clearing it
    // first made a closing sheet hop up before it fell.
    panel.classList.remove('is-dragging');
    if (dy > DRAG_CLOSE_PX || velocity > 0.6) onClose();
    else panel.style.translate = '';
  };

  grab.addEventListener('pointerdown', (event) => {
    if (desktop.matches || (event.pointerType === 'mouse' && event.button !== 0)) return;
    if (pointer !== null) return; // a second finger mid-drag is ignored
    pointer = event.pointerId;
    startY = lastY = event.clientY;
    lastT = event.timeStamp;
    velocity = 0;
    try {
      grab.setPointerCapture(event.pointerId);
    } catch {
      /* capture is a nicety */
    }
    grab.addEventListener('pointermove', onMove);
    grab.addEventListener('pointerup', onUp);
    grab.addEventListener('pointercancel', onUp);
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

/** Skeleton of the inner page, built from the same layout classes so its hero box sits exactly
    where the real one will (the card's image lands in it). */
function skeleton() {
  const layout = el('div', 'case-layout case-layout--loading', { role: 'status', 'aria-label': 'Loading case study' });
  const rail = el('aside', 'case-rail');
  for (let i = 0; i < 4; i++) rail.append(el('div', 'skel skel--toc'));
  const main = el('div', 'case-main');
  const hero = el('div', 'case-hero');
  const media = el('div', 'case-hero__media');
  media.append(el('div', 'study-media study-media--hero skel'));
  const text = el('div', 'case-hero__text');
  ['title', 'title-2', 'facts'].forEach((kind) => text.append(el('div', `skel skel--${kind}`)));
  hero.append(media, text);
  const body = el('div', 'case-skeleton__body');
  ['line', 'line', 'line', 'line-short'].forEach((kind) => body.append(el('div', `skel skel--${kind}`)));
  main.append(hero, body);
  layout.append(rail, main);
  return layout;
}

function chrome() {
  const node = el('div', 'case-sheet', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Case study' });
  const backdrop = el('button', 'case-sheet__backdrop', { type: 'button', 'aria-label': 'Close case study', tabindex: '-1' });
  backdrop.dataset.sheetClose = '';
  const panel = el('div', 'case-sheet__panel');
  const grab = el('div', 'case-sheet__grab', { 'aria-hidden': 'true' });
  grab.dataset.sheetGrab = '';
  grab.append(el('span', 'case-sheet__handle'));
  const scroll = el('div', 'case-sheet__scroll', { tabindex: '-1' });
  scroll.dataset.sheetScroll = '';
  scroll.append(skeleton());
  const edge = (side: string) => {
    const node = el('span', `sheet-edge sheet-edge--${side}`, { 'aria-hidden': 'true' });
    node.append(el('span', ''), el('span', ''));
    return node;
  };
  panel.append(grab, closeButton(), edge('top'), edge('bottom'), scroll);
  node.append(backdrop, panel);
  return node;
}

/* ---------- Scroll edges: blur only where there is more to scroll ---------- */
function bindEdges(panel: HTMLElement) {
  const scroller = panel.querySelector<HTMLElement>('[data-sheet-scroll]');
  if (!scroller) return () => undefined;
  let frame = 0;
  const update = () => {
    frame = 0;
    const { scrollTop, scrollHeight, clientHeight } = scroller;
    panel.classList.toggle('has-above', scrollTop > 2);
    panel.classList.toggle('has-below', scrollTop + clientHeight < scrollHeight - 2);
  };
  const queue = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  scroller.addEventListener('scroll', queue, { passive: true });
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(queue);
    observer.observe(scroller);
    // The content is replaced once loaded; watch whatever is inside now.
    new MutationObserver(() => {
      observer.disconnect();
      observer.observe(scroller);
      if (scroller.firstElementChild) observer.observe(scroller.firstElementChild);
      queue();
    }).observe(scroller, { childList: true });
    if (scroller.firstElementChild) observer.observe(scroller.firstElementChild);
  }
  update();
  return queue;
}

/* ---------- Keep Home still underneath ---------- */
function holdHome(hold: boolean, overlay: HTMLElement | null) {
  if (hold) {
    pausedVideos = [...document.querySelectorAll<HTMLVideoElement>('video')].filter(
      (video) => !video.paused && !overlay?.contains(video),
    );
    pausedVideos.forEach((video) => video.pause());
  } else {
    pausedVideos.forEach((video) => video.isConnected && video.play().catch(() => undefined));
    pausedVideos = [];
  }
}

/** Scrolling over the overlay never reaches Home: wheel and touch moves outside the sheet's own
    scroller are swallowed (the scroller itself has overscroll-behavior: contain). */
function containScroll(node: HTMLElement) {
  const outside = (event: Event) => {
    const scroller = node.querySelector('[data-sheet-scroll]');
    if (!scroller || !(event.target instanceof Node) || !scroller.contains(event.target)) event.preventDefault();
  };
  node.addEventListener('wheel', outside, { passive: false });
  node.addEventListener('touchmove', outside, { passive: false });
}

/** Resolves once the panel has finished sliding in (straight away with reduced motion). */
function settled(panel: HTMLElement) {
  return new Promise<void>((resolve) => {
    if (reduced.matches) return resolve();
    const done = () => {
      panel.removeEventListener('transitionend', onEnd);
      window.clearTimeout(timer);
      resolve();
    };
    const onEnd = (event: TransitionEvent) => event.target === panel && done();
    const timer = window.setTimeout(done, PANEL_MS + 80);
    panel.addEventListener('transitionend', onEnd);
  });
}

/** Wire an overlay (built here or rendered by the page) and slide it in. */
function wire(node: HTMLElement) {
  sheet = node;
  closing = false;
  root.classList.add('has-case-sheet');
  holdHome(true, node);
  setTheme(true);
  window.__caseSheet = { open: true, close };
  node.querySelectorAll<HTMLElement>('[data-sheet-close]').forEach((control) =>
    control.addEventListener('click', (event) => {
      event.preventDefault();
      close();
    }),
  );
  containScroll(node);
  const panel = node.querySelector<HTMLElement>('.case-sheet__panel')!;
  attachDrag(panel, () => close());
  bindEdges(panel);
  const opened = settled(panel);
  requestAnimationFrame(() => requestAnimationFrame(() => node.classList.add('is-open')));
  opened.then(() => sheet === node && !closing && node.classList.add('is-settled'));
  window.__ifyFocus?.(node.querySelector<HTMLElement>('.case-sheet__close'), node.querySelector<HTMLElement>('[data-sheet-scroll]'));
  return opened;
}

function finishClose() {
  const wasStatic = sheet?.hasAttribute('data-case-static');
  const homeHref = sheet?.dataset.homeHref;
  const homeTitle = sheet?.dataset.homeTitle;
  tocCleanup?.();
  dropGhost(false);
  sheet?.remove();
  sheet = null;
  closing = false;
  root.classList.remove('has-case-sheet');
  holdHome(false, null);
  setTheme(false);
  if (window.__caseSheet) window.__caseSheet.open = false;
  if (wasStatic) {
    // Opened by its own address: what's left is Home, so the address and title become Home's.
    if (homeHref) history.replaceState(null, '', homeHref);
    if (homeTitle) document.title = homeTitle;
  } else {
    document.title = pageTitle;
    lastFocus?.focus({ preventScroll: true });
  }
}

function close(fromHistory = false) {
  if (!sheet || closing) return;
  closing = true;
  const node = sheet;
  const isStatic = node.hasAttribute('data-case-static');
  const url = node.dataset.caseUrl ?? location.href;
  if (!fromHistory && !isStatic && history.state?.caseSheet) {
    // Step back over the entry we pushed. The overlay starts closing now instead of waiting for
    // popstate; the guard's close(true) then finds it already closing.
    history.back();
  }
  const panel = node.querySelector<HTMLElement>('.case-sheet__panel');

  // Opened by its address, Home sits at its top underneath: bring Selected projects into place
  // first (behind the panel), so the close lands on the card.
  if (isStatic) {
    const work = document.querySelector<HTMLElement>('#work');
    work?.querySelectorAll('[data-reveal]').forEach((item) => item.classList.add('is-in'));
    work?.scrollIntoView({ block: 'start' });
  }

  // The hero image glides back into its card when both are on screen.
  dropGhost(false);
  const hero = node.querySelector<HTMLElement>(HERO_BOX);
  const card = cardFor(url)?.querySelector<HTMLElement>('.project-card__media');
  if (!reduced.matches && hero && card && inView(rectOf(hero)) && inView(rectOf(card))) {
    const flight = fly(rectOf(hero), rectOf(card), '20px', getComputedStyle(card).borderRadius, card, false);
    ghost = { node: flight.node, card };
    hero.style.visibility = 'hidden';
    card.style.visibility = 'hidden';
  }

  node.classList.remove('is-settled', 'is-open');
  if (panel) panel.style.translate = '';
  window.setTimeout(finishClose, exitMs());
}

function fillFrom(doc: Document, node: HTMLElement, scroll: HTMLElement) {
  const layout = doc.querySelector('[data-case-layout]');
  if (!layout) return false;
  node.setAttribute('aria-label', doc.title.split(' — ')[0] || 'Case study');
  document.title = doc.title;
  scroll.replaceChildren(document.importNode(layout, true));
  // Scripts inserted this way never run, and the layout carries Astro's island loader (the Leta
  // light/dark compare is a React island). Recreate each one so it runs and the island hydrates;
  // the loader guards its own custom element, so opening a case study twice is safe.
  scroll.querySelectorAll('script').forEach((old) => {
    const script = document.createElement('script');
    for (const { name, value } of old.attributes) script.setAttribute(name, value);
    script.textContent = old.textContent;
    old.replaceWith(script);
  });
  window.__ifySkeleton?.(scroll);
  window.__ifyMediaReveal?.(scroll);
  bindToc(scroll, scroll);
  scroll.querySelectorAll<HTMLVideoElement>('video[data-lazy-video]').forEach((video) => {
    if (reduced.matches) return;
    video.preload = 'auto';
    video.play().catch(() => undefined);
  });
  return true;
}

async function open(url: string, push = true) {
  if (sheet) return;
  lastFocus = document.activeElement as HTMLElement | null;
  pageTitle = document.title;
  const key = new URL(url, location.href).pathname;
  const page = load(url);
  const node = chrome();
  node.dataset.caseUrl = url;
  const scroll = node.querySelector<HTMLElement>('[data-sheet-scroll]')!;
  // Already fetched (hovered or touched first): it slides in with the real content.
  const early = ready.get(key);
  const filled = early ? fillFrom(early, node, scroll) : false;
  document.body.append(node);
  if (push) history.pushState({ ...history.state, caseSheet: true }, '', url);

  // The card's image starts gliding towards the hero box straight away.
  const card = cardFor(url)?.querySelector<HTMLElement>('.project-card__media');
  const hero = node.querySelector<HTMLElement>(HERO_BOX);
  const panel = node.querySelector<HTMLElement>('.case-sheet__panel')!;
  let landed: Promise<unknown> = Promise.resolve();
  if (!reduced.matches && card && hero && inView(rectOf(card))) {
    const flight = fly(rectOf(card), restingRect(hero, panel), getComputedStyle(card).borderRadius, '20px', card, true);
    ghost = { node: flight.node, card };
    card.style.visibility = 'hidden';
    hero.style.visibility = 'hidden';
    landed = flight.landed;
  }

  const opened = wire(node);
  await Promise.all([opened, landed]);
  if (sheet !== node || closing) return;
  if (hero) hero.style.visibility = '';
  parkGhost(hero?.parentElement ?? null);

  if (!filled) {
    const doc = await page;
    if (sheet !== node || closing) return;
    if (!doc || !fillFrom(doc, node, scroll)) {
      // Could not load it in place: go to its page instead (which draws the same overlay).
      location.href = url;
      return;
    }
    parkGhost(scroll.querySelector<HTMLElement>('.case-hero__media'));
  }
  // The real hero is in place: the copy fades away over it.
  window.setTimeout(() => sheet === node && !closing && dropGhost(), 60);
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
    const link = cardLink(event.target);
    if (!link || sheet) return;
    event.preventDefault();
    event.stopPropagation();
    open(link.href);
  },
  true,
);

/* Forward into a case study entry after closing it with Back: open it again in place. */
window.addEventListener('case-sheet:reopen', () => open(location.href, false));
