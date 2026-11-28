// Records LETA playground demos for the Leta case study (public/work/leta-design-system/demo-*).
// Run with the playground on :5180, from this folder, e.g.
//   OUT=/tmp/leta-raw HEADFUL=1 node v-notifications.mjs && ./enc.sh /tmp/leta-raw/raw-notifications notifications
// HEADFUL=1 opens a real (off-screen) Chrome window: only a headed window screencasts at 2x.
// ENROUTE="Ruth Njoki" patches the playground's mock data in the browser only (no repo change) so that
// driver counts as heading to the depot (the "about to leave the pickup zone" warning).
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire('/Users/ifeanyi/ify-not-iffy/playground-sims/leta-express/package.json');
const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));

// No focus state anywhere in a recording (owner's rule, Nov 27 2026): outlines and rings off, and the
// LETA focus border token pointed at the idle border so a focused field looks idle.
const NO_FOCUS_CSS = `
  html[data-theme], html, [data-theme] { --border-secondary-component-focus: var(--border-neutral-default) !important; }
  *:focus, *:focus-visible, *:focus-within { outline: none !important; }
  *:focus-visible { box-shadow: none !important; }
  *:focus-visible + .leta-checkbox-mark, *:focus-visible + .leta-radio-mark { box-shadow: none !important; outline: none !important; }
`;

export async function openRec(name, { path: route = '/orders', clock = false, vh = 900 } = {}) {
  const dir = `${process.env.OUT || '/tmp'}/raw-${name}`;
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir + '/f', { recursive: true });
  const browser = await chromium.launch(process.env.HEADFUL ? { headless: false, args: ['--window-position=-4000,0'] } : {});
  const ctx = await browser.newContext({ viewport: { width: 1440, height: vh }, deviceScaleFactor: 2, colorScheme: 'light', reducedMotion: 'no-preference' });
  await ctx.addInitScript(() => {
    localStorage.setItem('leta.playground.session', JSON.stringify({ email: 'kevin.otieno@acme.example', personaId: 'dispatcher' }));
  });
  await ctx.addInitScript({ path: path.join(here, 'cursor.js') });
  await ctx.addInitScript((css) => {
    const add = () => {
      if (document.getElementById('__nofocus')) return;
      const s = document.createElement('style');
      s.id = '__nofocus';
      s.textContent = css;
      (document.head || document.documentElement).appendChild(s);
    };
    add();
    document.addEventListener('DOMContentLoaded', add);
  }, NO_FOCUS_CSS);
  if (process.env.ENROUTE) await ctx.route(/\/src\/store\/mockData\.ts/, async (r) => {
    const res = await r.fetch();
    const body = (await res.text()).replace(/(EN_ROUTE_DRIVER_NAMES\s*=\s*\[)/, `$1"${process.env.ENROUTE}", `);
    await r.fulfill({ response: res, body });
  });
  const page = await ctx.newPage();
  if (clock) await page.clock.install();
  await page.goto('http://localhost:5180' + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const cdp = await ctx.newCDPSession(page);
  const frames = [];
  let n = 0;
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const f = `${dir}/f/${String(n++).padStart(6, '0')}.jpg`;
    fs.writeFileSync(f, Buffer.from(data, 'base64'));
    frames.push({ f, t: metadata.timestamp });
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  const st = { x: 720, y: 450 };
  const r = {
    browser, ctx, page, dir,
    async mark() {
      await page.mouse.move(st.x, st.y);
      await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 2880, maxHeight: vh * 2, everyNthFrame: 1 });
      await page.waitForTimeout(300);
    },
    async to(x, y, ms = 650) {
      const steps = Math.max(12, Math.round(ms / 16));
      const sx = st.x, sy = st.y;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps; const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        await page.mouse.move(sx + (x - sx) * e, sy + (y - sy) * e);
        await page.waitForTimeout(ms / steps);
      }
      st.x = x; st.y = y;
    },
    async at(loc, { dx = 0.5, dy = 0.5, ms } = {}) {
      const l = typeof loc === 'string' ? page.locator(loc).first() : loc;
      let b = await l.boundingBox();
      const vhNow = page.viewportSize().height;
      // Scroll only when off screen: scrolling closes open popovers.
      if (!b || b.y < 0 || b.y + b.height > vhNow) { await l.scrollIntoViewIfNeeded().catch(() => {}); b = await l.boundingBox(); }
      if (!b) throw new Error('no box for ' + loc);
      const x = b.x + b.width * dx, y = b.y + b.height * dy;
      const d = Math.hypot(x - st.x, y - st.y);
      await r.to(x, y, ms ?? Math.min(1100, 380 + d * 0.6));
      return { x, y };
    },
    async click(loc, opts = {}) {
      if (loc) await r.at(loc, opts);
      await page.waitForTimeout(opts.pre ?? 180);
      await page.mouse.down({ button: opts.button || 'left' });
      await page.waitForTimeout(70);
      await page.mouse.up({ button: opts.button || 'left' });
      await page.waitForTimeout(opts.post ?? 650);
    },
    async hover(loc, hold = 900, opts = {}) { await r.at(loc, opts); await page.waitForTimeout(hold); },
    async type(text, delay = 70) { await page.keyboard.type(text, { delay }); },
    async wheel(dy, steps = 10, gap = 45) { for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, dy / steps); await page.waitForTimeout(gap); } },
    wait: (ms) => page.waitForTimeout(ms),
    async shot(f) { await page.screenshot({ path: `${process.env.OUT || '/tmp'}/${f}.png` }); },
    async done(tail = 1200) {
      await page.waitForTimeout(tail);
      const endT = Date.now() / 1000;
      await cdp.send('Page.stopScreencast');
      await page.waitForTimeout(300);
      await ctx.close(); await browser.close();
      const lines = [];
      frames.forEach((fr, i) => {
        const next = i + 1 < frames.length ? frames[i + 1].t : endT;
        lines.push(`file '${fr.f}'`, `duration ${Math.max(0.001, next - fr.t).toFixed(4)}`);
      });
      lines.push(`file '${frames[frames.length - 1].f}'`);
      fs.writeFileSync(`${dir}/list.txt`, lines.join('\n'));
      return { frames: frames.length, seconds: (endT - frames[0].t).toFixed(1), dir };
    },
  };
  return r;
}

/** Loads the playground's demo data (Import/Export → Import; the first import shows an error state). */
export async function load(page) {
  await page.getByRole('button', { name: /Import\/Export/ }).first().click();
  await page.waitForTimeout(500);
  await page.getByText('Import', { exact: true }).last().click();
  await page.waitForTimeout(4500);
  for (let i = 0; i < 3; i++) {
    const reload = page.getByRole('button', { name: /Reload Page/ });
    if (!(await reload.count())) break;
    await reload.first().click();
    await page.waitForTimeout(5000);
  }
}
