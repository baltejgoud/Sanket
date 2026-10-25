// Behaviour checks for the review fixes and upgrades: palette type-ahead while its chunk loads,
// focus after in-page jumps, scene deep links and hash sync, language in the URL, data saver,
// the phone bottom sheet, scenario sharing and the privacy-friendly events.
// usage: SANKET_TEST_URL=http://localhost:5173 node scripts/check-features.mjs
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base = (process.env.SANKET_TEST_URL || 'http://localhost:5173').replace(/\/$/, '');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
const open = async (path = '/', { width = 1440, height = 900, init, reduced = true } = {}) => {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: reduced ? 'reduce' : 'no-preference', isMobile: width < 700, hasTouch: width < 700 });
  if (init) await context.addInitScript(init);
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(`${path}: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error' && !/WebGL|GPU stall|THREE/.test(m.text())) errors.push(`${path} console: ${m.text()}`); });
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.waitForSelector('.campus-ready, .campus-fallback', { timeout: 30000 });
  return { page, context };
};
const pass = msg => console.log(`PASS ${msg}`);
try {
  {
    // Keys typed right after Ctrl+K, while the palette's chunk is still downloading, are not lost.
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.route(/Palette.*\.js|components\/Palette\.tsx/, async route => { await new Promise(r => setTimeout(r, 1500)); await route.continue(); });
    const page = await context.newPage();
    await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.campus-stage');
    await page.keyboard.press('Control+k');
    await page.keyboard.type('roi', { delay: 40 });
    const input = page.locator('dialog.palette[open] input[role=combobox]');
    await input.waitFor({ timeout: 15000 });
    assert.equal(await input.inputValue(), 'roi', 'typed keys reach the palette');
    assert.equal(await input.getAttribute('aria-label'), 'Jump to');
    const labels = await page.locator('dialog.palette [role=option] .palette-label').allTextContents();
    assert(labels.length > 0 && /business case/i.test(labels[0]), `ROI search finds the business case first: ${labels[0]}`);
    await input.fill('');
    const chapters = await page.locator('dialog.palette [role=group]').first().locator('.palette-hint').allTextContents();
    assert.deepEqual(chapters, ['01', '02', '03', '04', '05', '06'], 'chapters in page order, numbered as on the page');
    await context.close();
    pass('palette keeps type-ahead while loading, has a label, lists chapters 01–06 in order');
  }
  {
    const { page, context } = await open('/');
    await page.click('.chapter-nav a[href="#problems"]');
    await page.waitForFunction(() => document.activeElement?.id === 'problem-title');
    const top = await page.evaluate(() => [document.querySelector('#problems .story-eyebrow').getBoundingClientRect().top, document.querySelector('.site-header').getBoundingClientRect().bottom]);
    assert(top[0] >= top[1], `eyebrow clears the header after a jump: ${top}`);
    pass('nav jump moves focus to the chapter heading, eyebrow clear of the header');
    // Hash follows the reader; a scene link opens that scene.
    await page.evaluate(() => { const s = document.getElementById('forecast'); scrollTo({ top: s.offsetTop + (s.offsetHeight - innerHeight) * 2.5 / 5, behavior: 'instant' }); });
    await page.waitForFunction(() => location.hash === '#forecast/3');
    pass('address bar follows the scene (#forecast/3)');
    const events = await page.evaluate(() => window.__sanketEvents.map(e => e.name));
    assert(events.includes('chapter_reached'), `events: ${events}`);
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('sanket:tool', { detail: 1 })));
    await page.waitForSelector('dialog[open] .scenario-share a[href^="mailto:"]');
    const href = await page.locator('dialog[open] .scenario-share a').first().getAttribute('href');
    assert(/Please%20send%20me%20this%20scenario/.test(href), 'scenario mail is written out');
    assert(await page.evaluate(() => window.__sanketEvents.some(e => e.name === 'tool_opened' && e.props.tool === 'business_case')));
    pass('business case offers "send me this scenario"; chapter and tool events recorded');
    await context.close();
  }
  {
    const { page, context } = await open('/#problems/2');
    await page.waitForFunction(() => document.querySelector('.campus-stage').dataset.storyChapter === 'problems' && document.querySelector('#problems .story-detail-card:not([hidden])')?.dataset.cardIndex === '1');
    pass('deep link #problems/2 opens the second problem scene');
    await context.close();
  }
  {
    const { page, context } = await open('/?lang=hi');
    assert.equal(await page.evaluate(() => document.documentElement.lang), 'hi');
    assert(/वही स्टॉक/.test(await page.title()), 'Hindi title');
    assert(/lang=hi/.test(await page.evaluate(() => document.querySelector('link[rel=canonical]').href)), 'canonical follows language');
    await page.locator('.header-actions .lang-switch button[lang=te]').click();
    await page.waitForFunction(() => location.search === '?lang=te' && document.documentElement.lang === 'te');
    pass('?lang=hi opens Hindi (title, canonical); switching writes ?lang=te');
    await context.close();
  }
  {
    const init = () => Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true } });
    const { page, context } = await open('/', { init });
    assert(await page.locator('.campus-fallback').count(), 'data saver starts with the HTML story');
    assert(!(await page.evaluate(() => performance.getEntriesByType('resource').some(r => /engine-|campus\/engine/.test(r.name)))), 'engine not downloaded');
    await page.locator('.load-3d').click();
    await page.waitForSelector('.campus-ready', { timeout: 30000 });
    pass('data saver skips the 3D engine until asked, then loads it');
    await context.close();
  }
  {
    const { page, context } = await open('/', { width: 390, height: 844 });
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('sanket:tool', { detail: 0 })));
    await page.waitForSelector('dialog[open] .sandbox');
    const box = await page.evaluate(() => { const r = document.querySelector('dialog[open]').getBoundingClientRect(); return [Math.round(r.bottom), Math.round(r.left), Math.round(r.width)]; });
    assert.deepEqual(box, [844, 0, 390], `bottom sheet on phones: ${box}`);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('dialog[open]'));
    pass('tools open as a bottom sheet on phones and close on Esc');
    await context.close();
  }
  assert.deepEqual(errors, [], 'no page or console errors');
  console.log('PASS: no page or console errors');
} finally { await browser.close(); }
