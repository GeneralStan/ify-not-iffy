import { openRec, load } from './rec.mjs';
const r = await openRec('broadcast', { clock: true });
const { page } = r;
const dlg = () => page.locator('[role=dialog]').last();
const dlgText = () => dlg().innerText().catch(() => '');
const menu = () => page.locator('[role=menu],[role=listbox],[role=dialog]').last();
await load(page);
// Pre-roll (not recorded): run 7pced's broadcast on to Floaters [P3] in Round 2, then reset the view.
await page.getByRole('button', { name: 'Show Unassigned statuses' }).click(); await r.wait(600);
await menu().getByText(/^Broadcasted \(\d+\)$/).click(); await r.wait(600);
await page.keyboard.press('Escape'); await r.wait(600);
await page.getByText('7pced-sdqez').first().click(); await r.wait(1500);
await page.getByRole('button', { name: 'View Logs' }).nth(1).click(); await r.wait(800);
for (let i = 0; i < 40 && !/Broadcasting to Floaters/.test(await dlgText()); i++) { await page.clock.fastForward(5000); await r.wait(120); }
await page.clock.fastForward(8000); await r.wait(300);
await page.keyboard.press('Escape'); await r.wait(1000);
await page.getByRole('button', { name: 'Show Unassigned statuses' }).click(); await r.wait(600);
await menu().getByText(/^Broadcasted \(\d+\)$/).click(); await r.wait(500);
await page.keyboard.press('Escape'); await r.wait(800);
// The pre-roll used the keyboard; a fresh mouse click resets Chrome's keyboard-focus heuristics.
await page.mouse.click(1300, 100); await r.wait(1200);
await page.mouse.move(720, 450);
await r.mark();
await r.wait(700);
const arrow = page.getByRole('button', { name: 'Show Unassigned statuses' });
await r.hover(arrow, 400);
await r.click(null, { post: 900 });
await r.click(menu().getByText(/^Broadcasted \(\d+\)$/), { post: 900 });
// Close the menu by clicking an empty part of the page header (no keyboard).
// Empty space in the page header, right of the 'Deliveries' title.
await r.to(760, 92, 700);
await r.click(null, { post: 1400 });
await r.click(page.getByText('7pced-sdqez').first(), { post: 2000 });
await r.hover(page.getByText(/^Broadcasting to/).first(), 1100);
await r.click(page.getByRole('button', { name: 'View Logs' }).nth(1), { post: 1600 });
await r.hover(page.getByText(/Broadcast summary/).first(), 400);
await r.wheel(900, 30, 60); await r.wait(700);
await r.wheel(-900, 20, 45); await r.wait(700);
async function sub(name) {
  await r.click(dlg().getByRole('button', { name }).first(), { post: 1800 });
  await r.to(1500, 650, 500);
  await r.wheel(500, 14, 50); await r.wait(900);
  await r.click(dlg().getByText('7pced-sdqez', { exact: true }).first(), { post: 1400 });
}
await sub(/^Priority Driver Groups/);
await sub(/^Batched Orders/);
await sub(/^Notified Drivers/);
await r.to(1100, 300, 600);
for (let i = 0; i < 60 && !/Broadcast accepted/.test(await dlgText()); i++) { await page.clock.fastForward(3000); await r.wait(220); }
console.log('end:', ((await dlgText()).match(/Broadcast accepted[^\n]*/) || ['NOT ACCEPTED'])[0]);
await r.wait(1500);
await r.hover(page.getByText(/accepted after/).first(), 1600);
console.log(await r.done(600));
