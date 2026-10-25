import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';

const browser = await chromium.launch({ headless: true });
const base = process.env.SANKET_TEST_URL || 'http://localhost:5173';
const errors = [];
await fs.mkdir('qa/guide', { recursive: true });
async function scene(page, chapter, index, count) {
  await page.evaluate(({ chapter, index, count }) => {
    const section = document.getElementById(chapter);
    scrollTo({ top: section.offsetTop + (section.offsetHeight - innerHeight) * (index + .5) / count, behavior: 'instant' });
  }, { chapter, index, count });
  await page.waitForFunction(({ chapter, index }) => {
    const stage = document.querySelector('.campus-stage');
    const card = document.querySelector(`#${chapter} .story-detail-card:not([hidden])`);
    return stage.dataset.storyChapter === chapter && stage.dataset.cameraSettled === 'true' && Number(card?.dataset.cardIndex) === index;
  }, { chapter, index });
}
try {
  for (const [width, height, lang] of [[1440, 900, 'en'], [768, 1024, 'en'], [390, 844, 'en'], [320, 740, 'en'], [375, 667, 'hi'], [390, 844, 'te']]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(lang => localStorage.setItem('sanket-lang', lang), lang);
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForSelector('.campus-ready');
    for (const [chapter, count] of [['warehouse', 2], ['problems', 3], ['forecast', 5], ['decide', 5]]) {
      for (let index = 0; index < count; index++) {
        await scene(page, chapter, index, count);
        const layout = await page.evaluate(chapter => {
          const section = document.getElementById(chapter);
          const card = section.querySelector('.story-detail-card:not([hidden])');
          const box = card.getBoundingClientRect();
          return { overflow: document.documentElement.scrollWidth > innerWidth, top: box.top, bottom: box.bottom, gap: box.top - section.querySelector('.story-copy').getBoundingClientRect().bottom, cue: card.querySelector('.model-cue').innerText };
        }, chapter);
        assert(!layout.overflow, `Overflow: ${width} ${lang}`);
        assert(layout.gap >= 80, `Model has no reading space: ${width} ${lang} ${chapter}/${index}: ${JSON.stringify(layout)}`);
        assert(layout.bottom <= height, `Clipped card: ${width} ${lang}`);
        assert(layout.cue.length > 20);
      }
    }
    await scene(page, 'forecast', 2, 5);
    await page.screenshot({ path: `qa/guide/${width}-${lang}-order.png` });
    if (lang === 'en' && width === 1440) {
      const card = () => page.locator('#forecast .story-detail-card:not([hidden])');
      await card().getByRole('button', { name: 'Previous scene', exact: true }).click();
      await page.waitForFunction(() => document.activeElement?.closest('[data-card-index]')?.dataset.cardIndex === '1');
      assert.equal(await page.evaluate(() => document.activeElement.dataset.sceneFocus), 'previous');
      await card().getByRole('button', { name: 'Scene 5:', exact: false }).click();
      await page.waitForFunction(() => document.activeElement?.closest('[data-card-index]')?.dataset.cardIndex === '4');
      await card().getByRole('button', { name: 'Try a forecast', exact: true }).click();
      await page.waitForSelector('dialog[open] .sandbox');
      await page.getByRole('button', { name: 'Viral spike', exact: true }).click();
      await page.getByRole('button', { name: 'Close tool', exact: true }).click();
      assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Try a forecast');
      await scene(page, 'forecast', 0, 5);
      await card().getByRole('button', { name: 'Explore connections', exact: true }).click();
      await page.waitForSelector('dialog[open] .industry-list');
      await page.getByRole('button', { name: 'Close tool', exact: true }).click();
      await scene(page, 'problems', 2, 3);
      await page.getByRole('button', { name: 'Estimate the impact', exact: true }).click();
      await page.waitForSelector('dialog[open] .roi-grid');
      await page.getByRole('button', { name: 'Close tool', exact: true }).click();
    }
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.locator('.story-faq summary').first().click();
    assert(await page.locator('.story-faq details').first().getAttribute('open') !== null);
    await page.evaluate(() => scrollTo({ top: document.getElementById('contact').offsetTop, behavior: 'instant' }));
    await page.waitForFunction(() => getComputedStyle(document.querySelector('#contact .story-copy')).opacity === '1');
    await page.screenshot({ path: `qa/guide/${width}-${lang}-contact.png` });
    if (lang === 'en' && width === 1440) {
      const chip = page.locator('.contact-context li').first();
      assert(await chip.count() > 0, 'Explored tools should be visible in contact context');
      const before = await page.locator('.campus-contact a').first().getAttribute('href');
      await chip.getByRole('button').click();
      assert.notEqual(await page.locator('.campus-contact a').first().getAttribute('href'), before);
    }
    const audit = await new AxeBuilder({ page }).include('#contact').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    assert.deepEqual(audit.violations.map(v => `${v.id}: ${v.nodes.map(n => n.target).join(',')}`), [], `${width} ${lang} contact accessibility`);
    console.log(`PASS ${width}×${height} ${lang}: all 15 scenes, readable model space, contact and accessibility`);
    await context.close();
  }
  const fallback = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await fallback.goto(`${base}/?no-webgl`);
  await fallback.waitForSelector('.campus-fallback');
  assert.equal(await fallback.locator('.story-detail-card:visible').count(), 15);
  assert(await fallback.locator('.story-fallback-note').isVisible());
  assert.equal(await fallback.locator('[data-scene-focus]:visible').count(), 0);
  await fallback.close();
  const landscape = await browser.newPage({ viewport: { width: 844, height: 390 }, reducedMotion: 'reduce' });
  await landscape.goto(base, { waitUntil: 'networkidle' });
  await landscape.waitForSelector('.campus-ready');
  assert.equal(await landscape.locator('.story-detail-card:visible').count(), 15, 'Short landscape uses a readable document layout');
  assert.equal(await landscape.locator('[data-scene-focus]:visible').count(), 0);
  await landscape.locator('#forecast .story-detail-card').nth(2).scrollIntoViewIfNeeded();
  assert(await landscape.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await landscape.screenshot({ path: 'qa/guide/landscape.png' });
  await landscape.close();
  assert.deepEqual(errors, []);
  console.log('PASS: scene navigation, tool entry points, focus restoration, removable message context, fallback and no browser errors.');
} finally { await browser.close(); }
