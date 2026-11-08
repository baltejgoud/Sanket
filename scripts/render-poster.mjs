// Renders the loading poster: the 3D scene's own first frame (lamps off, nothing moving), framed with the
// hero's lens and cropped to the model, for desktop and phones. CampusStage.tsx places it exactly where
// the first frame will draw, so the page shows the warehouse while three.js loads and then cross-fades.
// usage: npm run dev  (then)  node scripts/render-poster.mjs [--url=http://localhost:5173]
import { chromium } from 'playwright';
import fs from 'node:fs';

const arg = (name, def) => process.argv.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? def;
const base = arg('url', process.env.SANKET_TEST_URL || 'http://localhost:5173').replace(/\/$/, '');
const out = new URL('../src/campus/poster/', import.meta.url);
fs.mkdirSync(out, { recursive: true });
// Desktop is captured at the 1440×900 hero lens (×.9), phones at ×1.5; both wide enough to hold the model.
const variants = [
  { name: 'desktop', viewport: { width: 1440, height: 1000 }, dpr: 1, lens: .9 },
  { name: 'mobile', viewport: { width: 720, height: 844 }, dpr: 2, lens: 1.5 },
];
const browser = await chromium.launch({ channel: 'chrome', args: ['--ignore-gpu-blocklist', '--enable-gpu'] }).catch(() => chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] }));
const meta = {};
try {
  for (const v of variants) {
    const page = await browser.newPage({ viewport: v.viewport, deviceScaleFactor: v.dpr });
    await page.goto(`${base}/?poster`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.campus-ready', { timeout: 60000 });
    await page.waitForFunction(() => window.__posterFrame, null, { timeout: 30000 });
    // A few frames for shadows and the post passes to settle.
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    await page.waitForTimeout(1500);
    const result = await page.evaluate(async ({ cssW, cssH }) => {
      const img = new Image(); img.src = window.__posterFrame; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#090b09'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, c.width, c.height);
      let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
      for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4;
        if (Math.abs(data[i] - 9) + Math.abs(data[i + 1] - 11) + Math.abs(data[i + 2] - 9) > 14) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      }
      const pad = 6; x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(c.width - 1, x1 + pad); y1 = Math.min(c.height - 1, y1 + pad);
      const crop = document.createElement('canvas'); crop.width = x1 - x0 + 1; crop.height = y1 - y0 + 1;
      crop.getContext('2d').drawImage(c, x0, y0, crop.width, crop.height, 0, 0, crop.width, crop.height);
      const ratio = c.width / cssW;
      return { webp: crop.toDataURL('image/webp', .78), ratio, x0, y0, w: crop.width, h: crop.height, cw: c.width, ch: c.height, cssW, cssH };
    }, { cssW: v.viewport.width, cssH: v.viewport.height });
    const file = `hero-${v.name}.webp`;
    fs.writeFileSync(new URL(file, out), Buffer.from(result.webp.split(',')[1], 'base64'));
    // Everything in CSS pixels: image size, where the shot's target lands in it, and pixels per world unit.
    meta[v.name] = {
      w: +(result.w / result.ratio).toFixed(1), h: +(result.h / result.ratio).toFixed(1),
      tx: +((result.cw / 2 - result.x0) / result.ratio).toFixed(1), ty: +((result.ch / 2 - result.y0) / result.ratio).toFixed(1),
      unit: +(v.viewport.height / (60 * v.lens)).toFixed(4), lens: v.lens,
    };
    console.log(v.name, `${result.w}×${result.h}px`, `${(fs.statSync(new URL(file, out)).size / 1024).toFixed(1)} kB`, JSON.stringify(meta[v.name]));
    await page.close();
  }
  fs.writeFileSync(new URL('poster.json', out), JSON.stringify(meta, null, 2) + '\n');
} finally { await browser.close(); }
