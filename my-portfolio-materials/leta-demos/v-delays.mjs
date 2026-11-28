import { openRec, load } from './rec.mjs';
// Step 2.0: delayed and at-risk orders in the table, then each one's Overview and its delay banner.
const r = await openRec('delays');
const { page } = r;
const dlg = () => page.locator('[role=dialog]').last();
const log = (...a) => console.log('STEP', ...a);
await load(page);
await r.wait(1200);
await r.mark();
await r.wait(500);
await r.click(page.getByRole('button', { name: /^Dispatched/ }).first(), { post: 1700 });
const rowWith = (label) => page.locator('[role=row]').filter({ has: page.locator(`[aria-label="${label}"]`) }).first();
const delayedRow = rowWith('Delayed');
const riskRow = rowWith('At Risk');
log('rows', (await delayedRow.innerText()).split('\n')[0], (await riskRow.innerText()).split('\n')[0]);
// Look along the table, then rest on each status icon so its reason shows.
await r.hover(riskRow, 700, { dx: 0.35 });
await r.hover(delayedRow, 600, { dx: 0.55 });
// The status column (with the Delayed / At Risk icons) sits past the table's right edge here:
// scroll the table sideways to it.
const sideways = async (dx) => { for (let i = 0; i < 14; i++) { await page.mouse.wheel(dx / 14, 0); await r.wait(40); } };
await sideways(900); await r.wait(700);
await r.hover(delayedRow.locator('[aria-label="Delayed"]').first(), 2200);
await r.hover(riskRow.locator('[aria-label="At Risk"]').first(), 2200);
await r.to(760, 520, 600);
await sideways(-900); await r.wait(600);
// The delayed order: its Overview and the red banner under the card.
await r.click(delayedRow, { dx: 0.4, post: 2200 });
log('delayed banner', ((await dlg().innerText()).match(/(Delayed|Late|At Risk):[^\n]*/) || ['none'])[0]);
await r.hover(dlg().getByText(/^(Delayed|Late):/).first(), 2000, { dx: 0.3 });
await r.wheel(360, 12, 50); await r.wait(900);
await r.wheel(-360, 10, 45); await r.wait(700);
await r.click(dlg().getByRole('button', { name: 'Close' }).first(), { post: 1200 });
// The at-risk order.
await r.click(riskRow, { dx: 0.4, post: 2200 });
log('risk banner', ((await dlg().innerText()).match(/At Risk:[^\n]*/) || ['none'])[0]);
await r.hover(dlg().getByText(/^At Risk:/).first(), 2200, { dx: 0.3 });
console.log(await r.done(900));
