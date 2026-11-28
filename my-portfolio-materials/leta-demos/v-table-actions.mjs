import { openRec, load } from './rec.mjs';
// Run with ENROUTE="Ruth Njoki".
const r = await openRec('table-actions');
const { page } = r;
const dlg = () => page.locator('[role=dialog]').last();
const log = (...a) => console.log('STEP', ...a);
await load(page);
// Pre-roll: give Ruth Njoki (en route, patched in) a Lavington order so she is completing a trip.
async function findRow(id) {
  await page.getByRole('button', { name: 'Page 1' }).click().catch(() => {}); await r.wait(600);
  for (let p = 0; p < 6; p++) { const hit = page.getByText(id).first(); if (await hit.count() && await hit.isVisible()) return hit; await page.getByRole('button', { name: 'Next page' }).click(); await r.wait(700); }
  throw new Error('row ' + id);
}
const u = await findRow('utuwu-bwq88');
await u.click({ button: 'right' }); await r.wait(600);
await page.getByRole('menuitem', { name: /^Dispatch/ }).or(page.getByText('Dispatch', { exact: true })).last().hover(); await r.wait(600);
await page.getByText('Assign Driver', { exact: true }).last().click(); await r.wait(1800);
await dlg().getByText('Ruth Njoki').first().click(); await r.wait(800);
await dlg().getByRole('button', { name: 'Preview Trip' }).click(); await r.wait(1200);
await dlg().getByRole('button', { name: 'Assign Driver' }).last().click(); await r.wait(2500);
await page.getByRole('button', { name: 'Page 1' }).click().catch(() => {});
for (let k = 0; k < 2; k++) await page.getByText('Order dispatched').first().locator('xpath=ancestor::*[.//button][1]//button[last()]').click({ timeout: 3000 }).catch(() => {});
await r.wait(1500); log('toast left', await page.getByText('Order dispatched').count());
await page.mouse.move(720, 450);
await r.mark();
await r.wait(600);
const row = page.getByText(/^2dnb5-rb185/).first();
await r.hover(row, 700, { dx: 2.6 });
await r.hover(row, 1300);
const rowEl = page.locator('[role=row]').filter({ hasText: '2dnb5' }).first();
await r.click(rowEl.getByRole('button', { name: /Copy/ }).first(), { post: 1100 });
const ib = await rowEl.getByRole('button', { name: /Copy/ }).first().boundingBox();
await r.to(ib.x + ib.width + 14, ib.y + ib.height / 2, 400); await r.wait(1300);
await r.to(ib.x + ib.width + 38, ib.y + ib.height / 2, 350); await r.wait(1300);
await r.click(rowEl.getByRole('checkbox').first(), { post: 500 });
const row2 = page.locator('[role=row]').filter({ hasText: '4v7dm' }).first();
await r.click(row2.getByRole('checkbox').first(), { post: 1300 });
await r.click(page.getByRole('button', { name: /^Cancel( \d+)? Orders?$|^Cancel$/ }).last(), { post: 1300 });
await r.click(dlg().getByText('Customer requested it').first(), { post: 900 });
await r.click(dlg().getByRole('button', { name: /^Cancel 2 Orders$/ }), { post: 2200 });
const rr = page.locator('[role=row]').filter({ hasText: 'xp5x3' }).first();
await r.hover(rr, 400, { dx: 0.6 });
await r.click(rr.getByRole('button', { name: 'More Actions' }), { post: 800 });
await r.click(page.locator('[role=menu]').last().getByText('Reschedule Order', { exact: true }), { post: 1400 });
await r.click(dlg().getByText(/1 Hour Later/i).first(), { post: 900 });
await r.click(dlg().getByRole('button', { name: /^Reschedule Order$/ }), { post: 2200 });
const vr = page.locator('[role=row]').filter({ hasText: 'vkwch' }).first();
await r.at(vr, { dx: 0.45 });
await r.click(null, { button: 'right', post: 900 });
const dispatchItem = page.getByRole('menuitem', { name: /^Dispatch/ }).or(page.getByText('Dispatch', { exact: true })).last();
await r.hover(dispatchItem, 900);
const sub = page.getByText('Assign Driver', { exact: true }).last();
const sb = await sub.boundingBox(); const db = await dispatchItem.boundingBox();
await r.to(sb.x + 20, db.y + db.height / 2, 350);
await r.hover(sub, 600, { dx: 0.3 });
await r.click(null, { post: 2000 });
await r.click(dlg().getByText('Ruth Njoki').first(), { post: 2600 });
log('warn', ((await dlg().innerText()).match(/The selected driver[^\n]*/) || ['none'])[0]);
await r.hover(dlg().getByText(/The selected driver will not be available/).first(), 1600);
await r.click(dlg().getByText('Joseph Kamande').first(), { post: 1600 });
const exp = dlg().getByRole('button', { name: /Expand driver details/ });
const col = dlg().getByRole('button', { name: /Collapse driver details/ });
if (await exp.count()) { await r.click(exp.first(), { post: 1300 }); await r.click(dlg().getByRole('button', { name: /Collapse driver details/ }).first(), { post: 1100 }); }
else { await r.click(col.first(), { post: 1100 }); await r.click(dlg().getByRole('button', { name: /Expand driver details/ }).first(), { post: 1300 }); await r.click(dlg().getByRole('button', { name: /Collapse driver details/ }).first(), { post: 1100 }); }
await r.click(dlg().getByRole('button', { name: 'Preview Trip' }), { post: 2600 });
await r.to(1000, 420, 900); await r.wait(900);
await r.click(dlg().getByRole('button', { name: 'Assign Driver' }).last(), { post: 2400 });
log('end dialogs', await page.locator('[role=dialog]').count());
console.log(await r.done(300));
