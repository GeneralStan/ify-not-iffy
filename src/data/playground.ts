/**
 * Playground canvas (Figma "Playground" 4068:7511, board 4068:7643).
 * A board wider than the screen that drifts sideways in an endless loop; visitors can drag it
 * sideways, and tap a card to zoom in on it. Placeholders until the real work is in:
 * add `image` (an imported asset) per card.
 * Geometry is the Figma frame: x / y are the card's top-left on the 1440 frame, y measured from the
 * top of the board (frame y 376); w is the card width; mediaW / mediaH the image area inside it
 * (the card is 24 + media + 16 + 24 + 24 tall).
 */
import type { ImageMetadata } from 'astro';

export const playgroundHead = {
  title: 'Built in my spare time',
  lead: '1M+ tokens burnt, 7,000 Github commits & counting',
};

/**
 * The board repeats sideways every PERIOD px (board coordinates) so it can drift and be dragged
 * forever: the cards span x -346 to 1860, so each repeat leaves a 94px gap. HEIGHT is the board's
 * height below the heading: the lowest card ends at 1775, plus 64.
 */
export const PLAYGROUND_PERIOD = 2300;
export const PLAYGROUND_HEIGHT = 1840;

export const playground: Array<{
  tags: string[];
  image?: ImageMetadata;
  x: number;
  y: number;
  w: number;
  mediaH: number;
}> = [
  { tags: ['Leta Technologies', 'Mobile', 'B2B'], x: -105, y: 3, w: 709, mediaH: 328 },
  { tags: ['Leta Technologies'], x: 967, y: 64, w: 362, mediaH: 400 },
  { tags: ['Leta Technologies', 'Mobile', 'B2B'], x: 250, y: 611, w: 470, mediaH: 344 },
  { tags: ['Leta Technologies', 'Mobile', 'B2B'], x: 1390, y: 395, w: 470, mediaH: 344 },
  { tags: ['Leta Technologies', 'Mobile', 'B2B'], x: -346, y: 761, w: 470, mediaH: 344 },
  { tags: ['Leta Technologies', 'Mobile', 'B2B'], x: 875, y: 856, w: 470, mediaH: 344 },
  { tags: ['Leta Technologies', 'Mobile', 'B2B'], x: 100, y: 1232, w: 649, mediaH: 400 },
  { tags: ['Leta Technologies', 'Mobile', 'B2B'], x: 1329, y: 1341, w: 470, mediaH: 344 },
];
