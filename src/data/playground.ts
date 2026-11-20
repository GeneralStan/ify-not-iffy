/**
 * Playground cards (Figma "Playground" 4026:700, grid 4026:734).
 * Placeholders until the real work is in: add `image` (an imported asset) and `title` per card.
 * Geometry is the Figma board: x / y / w on the 1240 column, y from the top of the grid,
 * `media` the height of the image area (the card is 20 + media + 20 + 28 + 20 tall).
 */
import type { ImageMetadata } from 'astro';

export const playgroundHead = {
  title: 'Built in my spare time',
  lead: '1M+ tokens burnt, 7,000 Github commits & counting',
};

export const PLAYGROUND_BOARD = { width: 1240, height: 2137 };

export const playground: Array<{
  badge: string;
  title: string;
  image?: ImageMetadata;
  x: number;
  y: number;
  w: number;
  media: number;
}> = [
  { badge: 'Animation', title: 'Lorem Ipsum ipsum', x: 0, y: 0, w: 815, media: 400 },
  { badge: 'Illustration', title: 'Lorem Ipsum ipsum', x: 910, y: 258, w: 328, media: 400 },
  { badge: 'Illustration', title: 'Lorem Ipsum ipsum', x: 128, y: 576, w: 340, media: 300 },
  { badge: 'Illustration', title: 'Lorem Ipsum ipsum', x: 898, y: 878, w: 340, media: 300 },
  { badge: 'Animation', title: 'Lorem Ipsum ipsum', x: 0, y: 1068, w: 742, media: 400 },
  { badge: 'Branding', title: 'Lorem Ipsum ipsum', x: 0, y: 1649, w: 1240, media: 400 },
];
