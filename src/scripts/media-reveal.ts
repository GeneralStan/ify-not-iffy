/**
 * Media reveals: the snippet inside a frame (screenshot, browser window, recording, component
 * demo, playground preview) rises into its box the first time the box scrolls into view, the way
 * text lines rise in (src/scripts/reveal.ts). The box itself is already there; only what is inside
 * it moves, and the box clips it, so it reads as arriving in its frame.
 *
 * Mark a box with [data-media-reveal]; its snippets are the elements styled in
 * src/styles/reveal.css ("Media reveal"). All snippets in one box move together.
 * Plays once per element. Off with reduced motion or without IntersectionObserver (the flag that
 * hides things, html.reveal-ready, is only set when both are fine).
 *
 * Case studies opened in the drawer are inserted after load, so case-sheet.ts calls
 * window.__ifyMediaReveal(scope) for the new content.
 */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let observer: IntersectionObserver | null = null;

function observe(scope: ParentNode = document) {
  if (reduced.matches || !('IntersectionObserver' in window)) {
    scope.querySelectorAll('[data-media-reveal]').forEach((el) => el.classList.add('is-in'));
    return;
  }
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
  );
  scope.querySelectorAll('[data-media-reveal]:not(.is-in)').forEach((el) => observer?.observe(el));
}

declare global {
  interface Window {
    __ifyMediaReveal?: (scope?: ParentNode) => void;
  }
}

window.__ifyMediaReveal = observe;
observe();
document.addEventListener('astro:page-load', () => observe());
