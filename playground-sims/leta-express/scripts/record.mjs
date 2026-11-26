/**
 * Frame-exact capture of the looping showcase (needs `npm run web` on :8091).
 *
 *   node scripts/record.mjs --mode screen --out <dir>            1080x2400 screen only (DPR 3)
 *   node scripts/record.mjs --mode framed --out <dir>            phone frame on the playground card colour (DPR 2)
 *   node scripts/record.mjs --mode framed --aspect 310:398 --out <dir>   phone centred in a box of that shape
 *                                                                        (the playground card's media area)
 *   node scripts/record.mjs --mode framed --aspect 310:398 --bg transparent --out <dir>   no background (alpha video)
 *   node scripts/record.mjs --mode screen --at 0,650,900 --out <dir>   stills at given ms (for checking)
 *
 * The page runs on Playwright's fake clock, so every frame is exactly 1/60s after the last one
 * no matter how long a screenshot takes. Then encode with scripts/encode.sh.
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};

const MODE = arg('mode', 'screen');
const OUT = arg('out', 'frames');
const FPS = Number(arg('fps', 60));
const CYCLE_MS = Number(arg('cycle', 5400)); // LOOP.cycle in src/useEntrance.ts
const AT = arg('at', null)?.split(',').map(Number);
const BG = arg('bg', 'F6F6F1'); // --color-stone-50, the playground card media background
const PAD = 48; // room for the phone's shadow in framed mode
const ASPECT = arg('aspect', null)?.split(':').map(Number); // framed only: output box width:height
const MARGIN = 36; // above and below the phone with --aspect

const framed = MODE === 'framed';
const dpr = framed ? 2 : 3;
const url = `http://localhost:8091/?loop=1&record=1&frame=${framed ? 1 : 0}&bg=${BG}`;

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const viewport = ASPECT ? { width: 1100, height: 1000 } : { width: 520, height: 960 };
const page = await browser.newPage({ viewport, deviceScaleFactor: dpr });
await page.clock.install({ time: 0 });
// Paused: time only moves when we call runFor, so slow screenshots can't push the animation ahead.
await page.clock.pauseAt(1000);
await page.goto(url);

// Fonts and images load in real time; nudge the fake clock until the app says it is ready.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; ; i++) {
  await page.clock.runFor(50);
  const ready = await page.evaluate(
    () => typeof window.__letaStart === 'function' && Array.from(document.images).every((im) => im.complete && im.naturalWidth > 0),
  );
  if (ready) break;
  if (i > 300) throw new Error('App never became ready (is the Expo web server running on :8091?)');
  await sleep(50);
}
await page.evaluate(() => document.fonts.ready);
await page.clock.runFor(100);

const box = await page.locator('#phone').boundingBox();
let clip = box;
if (framed && ASPECT) {
  const height = box.height + MARGIN * 2;
  const width = (height * ASPECT[0]) / ASPECT[1];
  clip = { x: box.x + box.width / 2 - width / 2, y: box.y - MARGIN, width, height };
} else if (framed) {
  clip = { x: box.x - PAD, y: box.y - PAD / 2, width: box.width + PAD * 2, height: box.height + PAD * 1.5 };
}

await page.evaluate(() => window.__letaStart());

const times = AT ?? Array.from({ length: Math.round((CYCLE_MS / 1000) * FPS) }, (_, f) => Math.round((f * 1000) / FPS));
let now = 0;
for (let i = 0; i < times.length; i++) {
  const t = times[i];
  if (t > now) {
    await page.clock.runFor(t - now);
    now = t;
  }
  const name = AT ? `at-${String(t).padStart(5, '0')}.png` : `f${String(i).padStart(4, '0')}.png`;
  await page.screenshot({ path: join(OUT, name), clip, omitBackground: BG === 'transparent' });
  if (!AT && i % 30 === 0) process.stdout.write(`frame ${i}/${times.length}\n`);
}

await browser.close();
console.log(`done: ${times.length} frames → ${OUT} (${Math.round(clip.width * dpr)}x${Math.round(clip.height * dpr)})`);
