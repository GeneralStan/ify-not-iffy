/**
 * Scroll reveals, ported from the Nnamdi site's <Reveal> (motion/react whileInView) to one
 * IntersectionObserver. Any element with [data-reveal="rise|soft|scale|pop|words"] animates in the
 * first time it scrolls into view; the CSS lives in src/styles/reveal.css.
 *
 * - Elements stay hidden only under html.reveal-ready, which BaseLayout sets before first paint
 *   (motion allowed + IntersectionObserver available), so without JS everything is visible.
 * - Each element plays once. The persisted footer therefore plays once per visit.
 */

const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

let observer: IntersectionObserver | null = null;

function arm() {
  if (reduced.matches || !('IntersectionObserver' in window)) {
    root.classList.remove('reveal-ready');
    return;
  }
  // The router replaces <html>'s attributes on a page change; put the flag back.
  root.classList.add('reveal-ready');
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => observer?.observe(el));
}

arm();
