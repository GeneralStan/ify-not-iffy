/**
 * "Let’s Chat" opens the Cal.com booking modal (virtual coffee).
 * Based on Cal.com's element-click embed. Cal's script (app.cal.com/embed/embed.js) only loads once
 * someone points at, focuses or taps a [data-cal-button], so the page itself stays script-light.
 * Without JS, or with a modifier key, the button is a normal link to the booking page.
 */
import { cal } from '../data/site';

type CalApi = ((...args: unknown[]) => void) & {
  loaded?: boolean;
  ns: Record<string, (...args: unknown[]) => void>;
  q?: unknown[];
  config?: Record<string, unknown>;
};

declare global {
  interface Window {
    Cal?: CalApi;
  }
}

let ready = false;

function initCal() {
  if (ready) return;
  ready = true;
  // Cal.com's loader stub, verbatim in behaviour: queues calls until embed.js arrives.
  (function (C: Window & typeof globalThis, A: string, L: string) {
    const p = (a: { q: unknown[] }, ar: unknown) => {
      a.q.push(ar);
    };
    const d = C.document;
    C.Cal =
      C.Cal ||
      (function (this: unknown, ...ar: unknown[]) {
        const c = C.Cal as CalApi;
        if (!c.loaded) {
          c.ns = {};
          c.q = c.q || [];
          d.head.appendChild(d.createElement('script')).src = A;
          c.loaded = true;
        }
        if (ar[0] === L) {
          const api = function (...args: unknown[]) {
            p(api as unknown as { q: unknown[] }, args);
          } as unknown as { q: unknown[] } & ((...a: unknown[]) => void);
          const namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === 'string') {
            c.ns[namespace] = c.ns[namespace] || api;
            p(c.ns[namespace] as unknown as { q: unknown[] }, ar);
            p(c as unknown as { q: unknown[] }, ['initNamespace', namespace]);
          } else p(c as unknown as { q: unknown[] }, ar);
          return;
        }
        p(c as unknown as { q: unknown[] }, ar);
      } as CalApi);
  })(window, 'https://app.cal.com/embed/embed.js', 'init');

  const Cal = window.Cal!;
  Cal('init', cal.namespace, { origin: 'https://app.cal.com' });
  Cal.config = Cal.config || {};
  Cal.config.forwardQueryParams = true;
  Cal.ns[cal.namespace]('ui', {
    cssVarsPerTheme: { light: { 'cal-brand': '#0B0F02' }, dark: { 'cal-brand': '#5B7813' } },
    hideEventTypeDetails: false,
    layout: 'week_view',
  });
}

const isCalButton = (target: EventTarget | null) =>
  target instanceof Element ? target.closest<HTMLAnchorElement>('[data-cal-button]') : null;

for (const type of ['pointerover', 'focusin', 'touchstart'] as const) {
  document.addEventListener(type, (event) => isCalButton(event.target) && initCal(), { passive: true });
}

document.addEventListener('click', (event) => {
  const button = isCalButton(event.target);
  if (!button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  initCal();
  window.Cal!.ns[cal.namespace]('modal', { calLink: cal.link, config: cal.config });
});
