/** Prefix an in-site path with Astro's `base` (`/ify-not-iffy` on GitHub Pages). */
export function withBase(path = '/'): string {
  const base = import.meta.env.BASE_URL;
  const normalized = base === '/' ? '' : base.replace(/\/$/, '');
  if (path === '/' || path === '') return `${normalized}/`;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${normalized}${suffix}`;
}

export function assetSrc(asset: string | { src: string }): string {
  return typeof asset === 'string' ? asset : asset.src;
}
