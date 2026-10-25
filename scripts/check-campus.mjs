import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';

// Execute the same pure timeline used by the renderer, without a browser or a second implementation.
const source = await fs.readFile(new URL('../src/campus/timeline.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2020, target: ts.ScriptTarget.ES2020 } }).outputText;
const { sampleTimeline, documentProgress } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const snapshots = Array.from({ length: 501 }, (_, i) => sampleTimeline(i / 100));
for (let i = 500; i >= 0; i--) assert.deepEqual(sampleTimeline(i / 100), snapshots[i], 'Backward scrolling must reproduce the same scene state');
for (const state of snapshots) {
  for (const value of [...state.position, ...state.target, state.scale, state.roof, state.pallet, state.loading, state.route, state.truck]) assert(Number.isFinite(value));
  assert(state.scale >= 17 && state.scale <= 60);
  assert(state.truck === 0 || state.loading === 1, 'A truck cannot leave before loading finishes');
  assert(state.loading === 0 || state.pallet === 1, 'Loading cannot begin before the pallet reaches the dock');
  assert(state.route === 0 || state.loading > .9, 'Freight route follows the shipment, not the information signal');
}
// Test continuity at a fine delta, independently of chapter scroll length.
for (let i = 1; i <= 5000; i++) {
  const a = sampleTimeline(i / 1000 - .00001), b = sampleTimeline(i / 1000);
  assert(Math.hypot(...a.position.map((v, axis) => v - b.position[axis])) < .01, 'Camera must never jump at a shot boundary');
}
assert.equal(sampleTimeline(0).chapter, 0);
assert.equal(sampleTimeline(5).roof, 0);
assert.equal(sampleTimeline(2).wall, 1);
assert(sampleTimeline(2).roof >= 14, 'Interior must open in the same warehouse');
assert.equal(sampleTimeline(5).ambient, 1, 'The closing wide shot carries ambient life');
for (const state of snapshots) if (state.progress >= 1 && state.progress <= 4.86) assert.equal(state.ambient, 0, 'Reading holds stay still');
assert.deepEqual(sampleTimeline(1.1, true).position, sampleTimeline(1.3, true).position, 'Reduced-motion view must stay stable within a reading beat');
const tops = [0,1500,4900,10400,15900,24400];
for (let i = 0; i < 5; i++) {
  assert.equal(documentProgress(tops[i], tops, 1000), i);
  assert(Math.abs(documentProgress(tops[i + 1] - 1000, tops, 1000) - (i + .86)) < .001, 'Narrative must finish while its text is still sticky');
  assert(documentProgress(tops[i + 1] - .01, tops, 1000) <= i + 1);
}
assert.equal(documentProgress(4900 - .1, tops, 1000), 2, 'Fractional anchor rounding must select the destination chapter');
assert.equal(sampleTimeline(documentProgress(23400, tops, 1000)).step, 4);
assert.equal(sampleTimeline(0).hero, 1, 'Opening frames the warehouse under the headline');
assert.equal(sampleTimeline(1).hero, 0, 'The warehouse chapter uses its own shot');
assert.equal(sampleTimeline(2).shortage, 0);
assert.equal(sampleTimeline(2.6).shortage, 1, 'Popular rack empties before the solution');
assert.equal(sampleTimeline(2.9).resolution, 0, 'Solution cannot precede the problem');
assert.equal(sampleTimeline(3.6).resolution, 1);
assert.equal(sampleTimeline(3.9).pallet, 0, 'Transfer follows the explanation');
assert.equal(sampleTimeline(2.2).shortage, 0, 'Demand must be explained before the rack empties');
assert(sampleTimeline(2.4).scale < sampleTimeline(1).scale / 2, 'Stockout gets a close-up at more than twice the opening scale');
assert.deepEqual(sampleTimeline(2.12).position, sampleTimeline(2.24).position, 'Reading beats hold the camera still');
assert.notDeepEqual(sampleTimeline(1.1, true).position, sampleTimeline(1.7, true).position, 'Reduced motion must still show each distinct scene');
console.log('PASS: 501 forward/backward snapshots, continuous cameras, sequence ordering, reduced-motion views, section mapping, and final settled state.');

// Browser regression (needs a running site): a page loaded in a background tab must still reach the
// ready stage once revealed. Runs when SANKET_TEST_URL is set, e.g. against `npm run dev` or preview.
if (process.env.SANKET_TEST_URL) {
  const { chromium } = await import('playwright');
  const { hiddenTabLoad } = await import('./lib/hidden-tab.mjs');
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const r = await hiddenTabLoad(browser, process.env.SANKET_TEST_URL);
    assert(r.ok, `Hidden-tab load must reach campus-ready: ${JSON.stringify(r)}`);
    console.log(`PASS: hidden-tab load (${r.whileHidden} while hidden → ${r.cls}, canvas opacity ${r.opacity}).`);
  } finally { await browser.close(); }
} else console.log('SKIP: hidden-tab browser check (set SANKET_TEST_URL to run it).');
