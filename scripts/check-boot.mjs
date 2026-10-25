// Production boot budget: serves a built dist/ folder itself, loads it in Chrome with the real GPU,
// and records long tasks, TBT and the time the 3D stage reports ready. Also loads the page in a
// hidden tab and reveals it, which must still reach `campus-ready` (P0 regression).
//
// usage: npm run build && node scripts/check-boot.mjs [--dist=dist] [--runs=3] [--cpu=1] [--budget=200] [--tbt=300]
//        [--gpu=hw|swiftshader] [--webgl=off] [--hidden=skip] [--json=qa/perf/boot.json]
// Exits non-zero when the longest task or TBT exceeds the budget (median of runs).
// The engine budget needs a real GPU (run it locally). CI runners have none: there, --webgl=off
// budgets the page itself (React, CSS, the HTML story), and the hidden-tab check runs on SwiftShader.
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { hiddenTabLoad } from './lib/hidden-tab.mjs';

const arg = (name, def) => process.argv.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? def;
const dist = path.resolve(arg('dist', 'dist'));
const runs = Number(arg('runs', '3')), cpu = Number(arg('cpu', '1'));
const budget = Number(arg('budget', '200')), tbtBudget = Number(arg('tbt', '300'));
const gpu = arg('gpu', 'hw');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json', '.txt': 'text/plain', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let file = path.join(dist, decodeURIComponent(url.pathname));
  if (!file.startsWith(dist) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dist, 'index.html');
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

const gpuArgs = arg('webgl', 'on') === 'off' ? ['--disable-webgl', '--disable-3d-apis'] : gpu === 'swiftshader' ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : ['--ignore-gpu-blocklist', '--enable-gpu'];
const hiddenCheck = arg('hidden', 'run') !== 'skip';
const launch = () => chromium.launch({ channel: 'chrome', args: gpuArgs }).catch(() => chromium.launch({ args: gpuArgs }));

function observe() {
  const P = (window.__boot = { long: [], loaf: [], ready: null, status: [] });
  try { new PerformanceObserver(l => l.getEntries().forEach(e => P.long.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: 'longtask', buffered: true }); } catch {}
  try {
    new PerformanceObserver(l => l.getEntries().forEach(e => P.loaf.push({ t: Math.round(e.startTime), d: Math.round(e.duration), scripts: (e.scripts || []).map(s => `${(s.sourceURL || '').split('/').pop()}:${s.sourceFunctionName || s.invoker} ${Math.round(s.duration)}ms`).slice(0, 3) }))).observe({ type: 'long-animation-frame', buffered: true });
  } catch {}
  document.addEventListener('DOMContentLoaded', () => new MutationObserver(() => {
    const stage = document.querySelector('.campus-stage');
    const s = stage && [...stage.classList].find(c => /^campus-(ready|fallback|loading)$/.test(c));
    if (s && P.status.at(-1)?.[0] !== s) P.status.push([s, Math.round(performance.now())]);
    if (P.ready === null && (s === 'campus-ready' || s === 'campus-fallback')) P.ready = Math.round(performance.now());
  }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] }));
}

const results = [];
let failed = false;
try {
  for (let r = 0; r < runs; r++) {
    // A fresh browser per run: Chrome caches compiled shaders per profile, and a first visit has none.
    const browser = await launch();
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(observe);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
    await page.goto(base, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__boot.ready !== null, null, { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(2500);
    const lab = await page.evaluate(() => {
      const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0;
      const B = window.__boot;
      const tbt = B.long.reduce((a, [t, d]) => a + Math.max(0, d - 50 - Math.max(0, fcp - t)), 0);
      let renderer = 'n/a';
      try { const c = document.createElement('canvas').getContext('webgl2'); const x = c.getExtension('WEBGL_debug_renderer_info'); renderer = x ? c.getParameter(x.UNMASKED_RENDERER_WEBGL) : c.getParameter(c.RENDERER); } catch {}
      const phases = performance.getEntriesByType('measure').filter(m => m.name.startsWith('campus:')).map(m => `${m.name.slice(7)} ${Math.round(m.startTime)}+${Math.round(m.duration)}`);
      return { phases, fcp: Math.round(fcp), ready: B.ready, status: B.status, longest: Math.max(0, ...B.long.map(l => l[1])), tbt: Math.round(tbt), long: B.long, loaf: B.loaf.filter(l => l.d > 100), renderer };
    });
    results.push({ ...lab, errors });
    console.log(`run ${r + 1}: FCP ${lab.fcp}  ready ${lab.ready} (${lab.status.map(s => s.join('@')).join(' → ')})  longest ${lab.longest}  TBT ${lab.tbt}  long ${JSON.stringify(lab.long)}${errors.length ? `  errors ${errors.join(' | ')}` : ''}`);
    console.log(`   phases: ${lab.phases.join('  ')}`);
    for (const l of lab.loaf) console.log(`   LoAF @${l.t} ${l.d}ms  ${l.scripts.join('  ')}`);
    await browser.close();
  }

  // Hidden at load, revealed later: the stage must still finish loading.
  if (hiddenCheck) {
    const browser = await launch();
    const r = await hiddenTabLoad(browser, base);
    console.log(`hidden-tab load: while hidden "${r.whileHidden}" → after reveal "${r.cls}", canvas opacity ${r.opacity}`);
    if (!r.ok) { failed = true; console.log('FAIL: stage never became ready after a hidden-tab load'); }
    await browser.close();
  }
} finally { server.close(); }

const med = xs => [...xs].sort((a, b) => a - b)[Math.floor((xs.length - 1) / 2)];
const longest = med(results.map(r => r.longest)), tbt = med(results.map(r => r.tbt)), ready = med(results.map(r => r.ready ?? Infinity));
console.log(`median of ${runs} (cpu ${cpu}x, ${results[0]?.renderer}): longest task ${longest} ms (budget ${budget}), TBT ${tbt} ms (budget ${tbtBudget}), stage ready ${ready} ms`);
if (longest > budget || tbt > tbtBudget) { failed = true; console.log('FAIL: long-task budget exceeded'); }
if (results.some(r => r.errors.length)) { failed = true; console.log('FAIL: page errors'); }
const out = arg('json', '');
if (out) { fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, JSON.stringify({ cpu, gpu, results }, null, 2)); }
process.exit(failed ? 1 : 0);
