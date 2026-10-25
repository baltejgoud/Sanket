// Loads the page in a tab that is hidden from the start (as when opened in the background), keeps it
// hidden for a while, then reveals it. The stage must reach `campus-ready` with the canvas shown.
// Regression for the stage that stayed on "Preparing the warehouse…" after a background-tab load.
export async function hiddenTabLoad(browser, url, { hiddenFor = 4000 } = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await context.addInitScript(() => {
    let hidden = true;
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (hidden ? 'hidden' : 'visible') });
    // rAF does not run in a background tab; hold callbacks until the tab is revealed.
    const native = window.requestAnimationFrame.bind(window), cancel = window.cancelAnimationFrame.bind(window), held = new Map();
    let id = 1e6;
    window.requestAnimationFrame = cb => { if (!hidden) return native(cb); held.set(++id, cb); return id; };
    window.cancelAnimationFrame = n => { held.delete(n); cancel(n); };
    window.__reveal = () => { hidden = false; document.dispatchEvent(new Event('visibilitychange')); const cbs = [...held.values()]; held.clear(); cbs.forEach(cb => native(cb)); };
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(hiddenFor);
  const whileHidden = await page.evaluate(() => document.querySelector('.campus-stage')?.className);
  await page.evaluate(() => window.__reveal());
  const ready = await page.waitForSelector('.campus-ready', { timeout: 20000 }).then(() => true, () => false);
  // The canvas fades in once ready.
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.campus-stage canvas')).opacity === '1', null, { timeout: 12000 }).catch(() => {});
  const after = await page.evaluate(() => ({ cls: document.querySelector('.campus-stage')?.className, opacity: getComputedStyle(document.querySelector('.campus-stage canvas') ?? document.body).opacity }));
  await context.close();
  return { ok: ready && after.opacity === '1', whileHidden, ...after };
}
