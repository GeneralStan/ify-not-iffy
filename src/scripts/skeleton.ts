/**
 * Skeleton loaders. Any [data-skeleton] container whose images (or video poster) have not arrived
 * yet shows a Stone/100 block with a soft light sweeping across it (.is-skeleton, reveal.css); the
 * media fades in once loaded. Runs on load, and again on content added later (case studies opened
 * in place call window.__ifySkeleton on the new content).
 */

declare global {
  interface Window {
    __ifySkeleton?: (scope?: ParentNode) => void;
  }
}

function settle(el: HTMLElement) {
  el.classList.remove('is-skeleton');
  el.dataset.skeletonDone = '';
}

function watch(el: HTMLElement) {
  if (el.dataset.skeletonDone !== undefined || el.dataset.skeletonWatching !== undefined) return;
  const waits: Promise<void>[] = [];
  el.querySelectorAll('img').forEach((img) => {
    if (img.complete && img.naturalWidth) return;
    if (getComputedStyle(img).display === 'none') return;
    waits.push(
      new Promise((resolve) => {
        img.addEventListener('load', () => resolve(), { once: true });
        img.addEventListener('error', () => resolve(), { once: true });
      }),
    );
  });
  el.querySelectorAll('video[poster]').forEach((video) => {
    const poster = new Image();
    poster.src = (video as HTMLVideoElement).poster;
    if (poster.complete) return;
    waits.push(
      new Promise((resolve) => {
        poster.onload = poster.onerror = () => resolve();
      }),
    );
  });
  if (!waits.length) return settle(el);
  el.dataset.skeletonWatching = '';
  el.classList.add('is-skeleton');
  Promise.all(waits).then(() => settle(el));
}

function scan(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLElement>('[data-skeleton]').forEach(watch);
}

window.__ifySkeleton = scan;
scan();
