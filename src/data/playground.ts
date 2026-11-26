/**
 * Playground (Figma "Playground — layout explorations", Variation D: rows + filters).
 * A centred heading with filter pills, then the pieces laid out in rows. Each row is one of four
 * types, and the order of types is set per breakpoint below, so the rhythm can be changed freely:
 * - full:  one tile across the whole width
 * - two:   two tiles side by side
 * - three: three tiles, 32 apart (phones: a sideways swipe strip)
 * - bento: one big tile beside two stacked
 * Filtering keeps only the matching pieces and lays them out again with the same row order.
 *
 * Tiles (Figma component "Playground Tile"): Stone/50, the preview centred with at least 40 clear
 * around it on desktop, and a one-line caption 16 below it. Add a piece with `image` (an imported
 * asset) or `video` (files in public/, played by StudyMedia), and `aspect` (width / height of the
 * preview) so it sits in the tile uncropped.
 */
import type { ImageMetadata } from 'astro';

export const playgroundHead = {
  title: 'Built in my spare time',
  lead: '1M+ tokens burnt, 7,000 Github commits & counting',
};

export const categories = ['Motion', 'Product', '3D', 'Illustration'] as const;
export type Category = (typeof categories)[number];

export type RowType = 'full' | 'two' | 'three' | 'bento';

/** Row order, repeated as needed. Change these to try other rhythms. */
export const rowPattern: { desktop: RowType[]; mobile: RowType[] } = {
  desktop: ['full', 'two', 'full', 'bento', 'three'],
  mobile: ['full', 'two', 'full', 'bento', 'three'],
};

export interface Piece {
  title: string;
  categories: Category[];
  /** Preview width / height; the preview is fitted inside the tile without cropping. */
  aspect: number;
  image?: ImageMetadata;
  video?: { src: string; webm: string; poster: string };
  /** The media has no background of its own (an alpha video), so it sits straight on the tile. */
  transparent?: boolean;
  /** A stand-in until the real piece is added (an empty tile with its name). */
  placeholder?: boolean;
}

const PHONE = 9 / 19.5;
const SCREEN = 16 / 10;

export const pieces: Piece[] = [
  {
    // LETA Express home entrance, recorded from playground-sims/leta-express with no background:
    // VP9-alpha WebM and HEVC-alpha MP4, 640x822 (record.mjs --bg transparent).
    title: 'LETA Express home entrance',
    categories: ['Motion', 'Product'],
    aspect: 640 / 822,
    transparent: true,
    video: {
      src: '/playground/leta-express.mp4',
      webm: '/playground/leta-express.webm',
      poster: '/playground/leta-express-poster.webp',
    },
  },
  { title: 'Product piece', categories: ['Product'], aspect: SCREEN, placeholder: true },
  { title: '3D piece', categories: ['3D'], aspect: 1, placeholder: true },
  { title: 'Illustration', categories: ['Illustration'], aspect: 4 / 5, placeholder: true },
  { title: 'Motion piece', categories: ['Motion'], aspect: PHONE, placeholder: true },
  { title: 'Product piece', categories: ['Product'], aspect: PHONE, placeholder: true },
  { title: '3D piece', categories: ['3D'], aspect: SCREEN, placeholder: true },
  { title: 'Illustration', categories: ['Illustration'], aspect: SCREEN, placeholder: true },
  { title: 'Motion piece', categories: ['Motion'], aspect: SCREEN, placeholder: true },
];

const SIZE: Record<RowType, number> = { full: 1, two: 2, three: 3, bento: 3 };

/**
 * Split `count` tiles into rows following `pattern` (repeated). When fewer tiles are left than the
 * next row needs, the largest row type that fits takes them (three or bento → two → full).
 * Shared by the page (first render) and its script (filters and breakpoint changes).
 */
export function layoutRows(count: number, pattern: RowType[]): Array<{ type: RowType; size: number }> {
  const rows: Array<{ type: RowType; size: number }> = [];
  let left = count;
  let i = 0;
  while (left > 0) {
    let type = pattern[i % pattern.length];
    i += 1;
    if (SIZE[type] > left) type = left >= 2 ? 'two' : 'full';
    rows.push({ type, size: SIZE[type] });
    left -= SIZE[type];
  }
  return rows;
}
