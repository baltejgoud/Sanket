import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';

const browser = await chromium.launch({ headless: true });
const base = process.env.SANKET_TEST_URL || 'http://localhost:5173';
const errors = [];
await fs.mkdir('qa/revision', { recursive: true });
try {
  if (!process.argv.includes('--motion-only')) for (const [width, height, lang] of [[1440, 1000, 'en'], [390, 844, 'en'], [375, 667, 'hi'], [390, 844, 'te']]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(l => localStorage.setItem('sanket-lang', l), lang);
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForSelector('.campus-ready', { timeout: 30000 });
    const views = width === 1440 ? [['warehouse', .25], ['problems', .5], ...[.1, .3, .5, .7, .9].map(p => ['forecast', p]), ['decide', .5]] : [['forecast', .5], ['forecast', .9]];
    for (const [chapter, fraction] of views) {
      await page.evaluate(({ chapter, fraction }) => {
        const section = document.getElementById(chapter);
        scrollTo({ top: section.offsetTop + (section.offsetHeight - innerHeight) * fraction, behavior: 'instant' });
      }, { chapter, fraction });
      await page.waitForTimeout(700);
      await page.waitForFunction(chapter => document.querySelector('.campus-stage').dataset.storyChapter === chapter, chapter);
      const layout = await page.evaluate(() => {
        const stage = document.querySelector('.campus-stage');
        const section = document.getElementById(stage.dataset.storyChapter);
        const card = section.querySelector('.story-detail-card:not([hidden])');
        const rect = card.getBoundingClientRect();
        return { overflow: document.documentElement.scrollWidth > innerWidth, top: rect.top, bottom: rect.bottom, headingBottom: section.querySelector('.story-copy').getBoundingClientRect().bottom, index: Number(card.dataset.cardIndex), calls: stage.dataset.drawCalls, triangles: stage.dataset.triangles, ready: stage.classList.contains('campus-ready') };
      });
      assert(!layout.overflow, `Horizontal overflow at ${width} ${lang}`);
      assert(layout.top > layout.headingBottom, `Card overlaps heading at ${width} ${lang}`);
      assert(layout.bottom <= height, `Card clipped at ${width} ${lang}`);
      if (chapter === 'forecast') assert.equal(layout.index, Math.min(4, Math.floor(fraction * 5)));
      await page.screenshot({ path: `qa/revision/${width}-${lang}-${chapter}-${fraction}.png` });
      console.log(JSON.stringify({ width, lang, chapter, fraction, ...layout }));
    }
    if (lang === 'en') {
      // Phones keep tool links behind the card's "More" while the 3D runs.
      const card = page.locator('#forecast .story-detail-card:not([hidden])');
      if (width < 760) {
        await card.locator('.card-more').evaluate(b => b.click());
        assert.equal(await card.locator('.card-more').getAttribute('aria-expanded'), 'true');
      }
      await card.getByRole('button', { name: 'Try a forecast', exact: true }).click();
      await page.waitForSelector('dialog[open]');
      await page.getByRole('button', { name: 'Close tool', exact: true }).click();
      assert.equal(await page.locator('dialog[open]').count(), 0);
    }
    await page.close();
  }
  const motionContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  const motion = await motionContext.newPage();
  motion.on('pageerror', e => errors.push(e.message));
  await motion.goto(`${base}/#forecast`, { waitUntil: 'networkidle' });
  await motion.waitForSelector('.campus-ready');
  for (let step = 0; step < 5; step++) {
    await motion.waitForFunction(step => {
      const stage = document.querySelector('.campus-stage');
      const card = document.querySelector('#forecast .story-detail-card:not([hidden])');
      return stage.dataset.storyChapter === 'forecast' && stage.dataset.cameraSettled === 'true' && Number(card.dataset.cardIndex) === step;
    }, step);
    if (step === 2) {
      await motion.screenshot({ path: 'qa/revision/final-desktop.png' });
      const result = await new AxeBuilder({ page: motion }).include('#forecast').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      assert.deepEqual(result.violations.map(v => `${v.id}: ${v.nodes.map(n => n.target).join(', ')}`), []);
    }
    if (step < 4) await motion.locator('#forecast .story-detail-card:not([hidden])').getByRole('button', { name: 'Next scene', exact: true }).click();
  }
  // Reverse into the same stockout: proposed stock and solution overlays must disappear.
  await motion.evaluate(() => {
    const s = document.getElementById('problems');
    scrollTo({ top: s.offsetTop + (s.offsetHeight - innerHeight) * .5, behavior: 'instant' });
  });
  await motion.waitForFunction(() => {
    const s = document.querySelector('.campus-stage');
    return s.dataset.storyChapter === 'problems' && s.dataset.cameraSettled === 'true';
  });
  await motion.screenshot({ path: 'qa/revision/final-stockout.png' });
  await motion.close();
  const fallback = await browser.newPage();
  await fallback.goto(`${base}/?no-webgl`);
  await fallback.waitForSelector('.campus-fallback');
  assert.equal(await fallback.locator('#forecast .story-detail-card:visible').count(), 5);
  assert.deepEqual(errors, []);
  console.log('PASS: solution beats, localized mobile layouts, forecast tool, normal/reduced motion, reverse scroll, WCAG scan, no-WebGL content and browser errors.');
} finally { await browser.close(); }
