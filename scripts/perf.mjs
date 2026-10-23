// Lab performance check for the Stock Field site (DevTools-style throttling, like Lighthouse "devtools" mode).
// Cold loads with network + CPU throttling, then field frame times in the hero and while scrubbing #decide,
// then a few real interactions (Event Timing, an INP proxy).
//
// usage: SANKET_TEST_URL=http://localhost:4173 node scripts/perf.mjs [options]
//   --profiles=desktop,mobile   --cpu=1,4,6   --runs=3   --gpu=hw|swiftshader   --out=qa/perf/run.json
//   --urls=before=http://localhost:4175,after=http://localhost:4174   A/B: alternates the builds run by run
//                                                                     (ABBA order) so machine drift hits both alike
// Uses installed Google Chrome (channel "chrome") when present, else Playwright's Chromium.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const arg = (name, def) => process.argv.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? def;
const targets = (arg("urls", "") || `site=${process.env.SANKET_TEST_URL || "http://localhost:4173"}`).split(",").map(t => {
  const [label, ...rest] = t.split("=");
  return { label, url: rest.join("=") };
});
const profiles = arg("profiles", "desktop,mobile").split(",");
const cpus = arg("cpu", "1,4,6").split(",").map(Number);
const runs = Number(arg("runs", "3"));
const gpu = arg("gpu", "hw");
const outFile = arg("out", `qa/perf/${gpu}-${Date.now()}.json`);
const query = arg("query", "");

// Lighthouse's DevTools throttling presets (requestLatency / throughput already adjusted).
const PROFILES = {
  desktop: {
    context: { viewport: { width: 1350, height: 940 }, deviceScaleFactor: 1 },
    net: { latency: 40, downloadThroughput: (10240 * 1024) / 8, uploadThroughput: (10240 * 1024) / 8 },
  },
  mobile: {
    context: {
      viewport: { width: 412, height: 823 },
      deviceScaleFactor: 1.75,
      isMobile: true,
      hasTouch: true,
      userAgent:
        "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36",
    },
    net: { latency: 562.5, downloadThroughput: (1474.56 * 1024) / 8, uploadThroughput: (675 * 1024) / 8 },
  },
};

/** Median per build × profile × CPU rate, as a Markdown table. */
function summarize(results) {
  const med = xs => {
    const v = xs.filter(x => typeof x === "number" && !Number.isNaN(x)).sort((a, b) => a - b);
    return v.length ? v[Math.floor((v.length - 1) / 2)] : NaN;
  };
  const groups = {};
  for (const r of results) (groups[`${r.label ?? "site"}|${r.profile}|${r.cpu}`] ||= []).push(r);
  const rows = ["| build | profile | CPU | FCP | LCP | CLS | TBT | worst interaction | hero fps (main ms/frame) | Decide fps (main ms/frame) | runs |", "|---|---|---|---|---|---|---|---|---|---|---|"];
  for (const [key, rs] of Object.entries(groups)) {
    const [label, profile, cpu] = key.split("|");
    const inp = rs.map(r => Math.max(0, ...Object.values(r.inp).map(v => (typeof v.ms === "number" ? v.ms : 0))));
    rows.push(
      `| ${label} | ${profile} | ${cpu}x | ${med(rs.map(r => r.lab.fcp))} | ${med(rs.map(r => r.lab.lcp))} | ${med(rs.map(r => r.lab.cls))} | ${med(rs.map(r => r.lab.tbt))} | ${med(inp)} | ${med(rs.map(r => r.hero.fps))} (${med(rs.map(r => r.hero.taskMs))}) | ${med(rs.map(r => r.decide.fps))} (${med(rs.map(r => r.decide.taskMs))}) | ${rs.length} |`,
    );
  }
  return rows.join("\n");
}

if (arg("summarize", "")) {
  console.log(summarize(JSON.parse(fs.readFileSync(arg("summarize", ""), "utf8")).results));
  process.exit(0);
}

const gpuArgs = gpu === "swiftshader" ? ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] : ["--ignore-gpu-blocklist", "--enable-gpu"];
// A fresh browser per run: one long-lived instance drifted slower run after run.
async function launch() {
  try {
    return await chromium.launch({ channel: "chrome", args: gpuArgs });
  } catch {
    return chromium.launch({ args: gpuArgs });
  }
}

// Collected in the page from the first byte.
function observe() {
  const P = (window.__perf = { lcp: [], cls: [], long: [], loaf: [], events: [], paint: [], ready: null, mode: null });
  const describe = n => {
    if (!n || !n.nodeName) return null;
    const cls = typeof n.className === "string" && n.className.trim() ? "." + n.className.trim().split(/\s+/).slice(0, 3).join(".") : "";
    return n.nodeName.toLowerCase() + (n.id ? "#" + n.id : "") + cls;
  };
  const po = (type, fn, extra = {}) => {
    try {
      new PerformanceObserver(list => list.getEntries().forEach(fn)).observe({ type, buffered: true, ...extra });
    } catch {}
  };
  po("largest-contentful-paint", e => P.lcp.push({ t: e.startTime, size: e.size, el: describe(e.element), url: e.url || null }));
  po("layout-shift", e =>
    P.cls.push({
      t: e.startTime,
      v: e.value,
      input: e.hadRecentInput,
      src: (e.sources || []).map(s => ({ n: describe(s.node), from: [s.previousRect.y, s.previousRect.height], to: [s.currentRect.y, s.currentRect.height] })),
    }),
  );
  po("longtask", e => P.long.push({ t: e.startTime, d: e.duration }));
  po("long-animation-frame", e =>
    P.loaf.push({
      t: e.startTime,
      d: e.duration,
      block: e.blockingDuration,
      render: e.renderStart ? e.startTime + e.duration - e.renderStart : 0,
      style: e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0,
      scripts: (e.scripts || [])
        .map(s => ({ src: (s.sourceURL || "").split("/").pop(), fn: s.sourceFunctionName, inv: s.invoker, d: Math.round(s.duration) }))
        .sort((a, b) => b.d - a.d)
        .slice(0, 3),
    }),
  );
  po("event", e => P.events.push({ name: e.name, t: e.startTime, d: e.duration, id: e.interactionId, delay: e.processingStart - e.startTime, proc: e.processingEnd - e.processingStart }), {
    durationThreshold: 16,
  });
  po("paint", e => P.paint.push({ name: e.name, t: e.startTime }));
  document.addEventListener("DOMContentLoaded", () => {
    new MutationObserver(muts => {
      for (const m of muts) {
        const el = m.target;
        if (P.ready === null && el.classList?.contains("stage")) {
          if (el.classList.contains("is-ready")) (P.ready = performance.now()), (P.mode = "webgl");
          else if (el.classList.contains("stage-poster")) (P.ready = performance.now()), (P.mode = "poster");
        }
      }
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["class"] });
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const q = (arr, p) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(p * s.length))];
};
const round = (n, d = 0) => Math.round(n * 10 ** d) / 10 ** d;

async function metrics(cdp) {
  const { metrics } = await cdp.send("Performance.getMetrics");
  return Object.fromEntries(metrics.map(m => [m.name, m.value]));
}

/** rAF deltas for `ms`, optionally driving a time-based scroll from y0 to y1. */
async function frames(page, cdp, ms, scroll) {
  const before = await metrics(cdp);
  const deltas = await page.evaluate(
    ([ms, scroll]) =>
      new Promise(res => {
        const d = [];
        let last = 0;
        let t0 = 0;
        const go = y => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y));
        const f = now => {
          if (!t0) t0 = now;
          else d.push(now - last);
          last = now;
          const k = (now - t0) / ms;
          if (scroll) go(scroll[0] + (scroll[1] - scroll[0]) * Math.min(1, k));
          if (k < 1) requestAnimationFrame(f);
          else res(d);
        };
        requestAnimationFrame(f);
      }),
    [ms, scroll],
  );
  const after = await metrics(cdp);
  const n = Math.max(1, deltas.length);
  const per = k => round(((after[k] - before[k]) * 1000) / n, 1);
  return {
    frames: deltas.length,
    fps: round(deltas.length / (deltas.reduce((a, b) => a + b, 0) / 1000), 1),
    p50: round(q(deltas, 0.5), 1),
    p95: round(q(deltas, 0.95), 1),
    over33: round((deltas.filter(x => x > 34).length / n) * 100, 1),
    // main-thread busy time per frame, split by kind
    taskMs: per("TaskDuration"),
    scriptMs: per("ScriptDuration"),
    styleLayoutMs: round(per("RecalcStyleDuration") + per("LayoutDuration"), 1),
  };
}

async function sectionY(page, id, frac = 0) {
  return page.evaluate(
    ([id, frac]) => {
      const el = document.getElementById(id);
      return el.offsetTop + (el.offsetHeight - innerHeight) * frac;
    },
    [id, frac],
  );
}

async function jump(page, y, wait = 1500) {
  await page.evaluate(y => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y)), y);
  await sleep(wait);
}

async function interactions(page, mobile) {
  const mark = () => page.evaluate(() => window.__perf.events.length);
  const results = {};
  const measure = async (name, fn) => {
    const from = await mark();
    try {
      await fn();
    } catch (e) {
      results[name] = { error: e.message.split("\n")[0] };
      return;
    }
    await sleep(900);
    const ev = await page.evaluate(n => window.__perf.events.slice(n), from);
    const byId = {};
    for (const e of ev) if (e.id) byId[e.id] = Math.max(byId[e.id] || 0, e.d);
    const worst = ev.filter(e => e.id).sort((a, b) => b.d - a.d)[0];
    results[name] = worst
      ? { ms: Math.round(worst.d), delay: Math.round(worst.delay), proc: Math.round(worst.proc), present: Math.round(worst.d - worst.delay - worst.proc), event: worst.name }
      : { ms: "<16" };
  };
  const tap = async locator => (mobile ? locator.tap() : locator.click());

  await jump(page, 0, 1200);
  await measure("hero tap (signal wave)", async () => {
    const vp = page.viewportSize();
    mobile ? await page.touchscreen.tap(vp.width * 0.7, vp.height * 0.35) : await page.mouse.click(vp.width * 0.7, vp.height * 0.35);
  });
  await jump(page, await sectionY(page, "problems"), 1500);
  await measure("problem tab", () => tap(page.getByRole("tab", { name: /Warehouse full of slow stock/ })));
  const viral = page.getByRole("button", { name: /Viral spike/ });
  await viral.scrollIntoViewIfNeeded();
  await sleep(1200);
  await measure("sandbox scenario", () => tap(viral));
  await jump(page, 0, 1200);
  // Phones switch language inside the index dialog; desktop in the header.
  const scope = mobile ? page.getByRole("dialog") : page;
  if (mobile) await measure("open index menu", () => tap(page.getByRole("button", { name: "Open menu" })));
  await measure("language → हिन्दी", () => tap(scope.getByRole("button", { name: "हिन्दी" }).first()));
  await sleep(600);
  await measure("language → English", () => tap(scope.getByRole("button", { name: "English" }).first()));
  if (mobile) await measure("close menu (Escape)", () => page.keyboard.press("Escape"));
  return results;
}

async function one(profileName, cpu, baseUrl) {
  const prof = PROFILES[profileName];
  const mobile = !!prof.context.isMobile;
  const browser = await launch();
  const context = await browser.newContext({ ...prof.context, reducedMotion: "no-preference" });
  await context.addInitScript(observe);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push((e.stack || e.message).split("\n").slice(0, 4).join(" | ")));
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", { offline: false, ...prof.net });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
  await cdp.send("Performance.enable");

  await page.goto(baseUrl + query, { waitUntil: "load", timeout: 120000 });
  await page.waitForFunction(() => window.__perf.ready !== null, null, { timeout: 60000 }).catch(() => {});
  await sleep(6000); // let the TTI quiet window close

  const lab = await page.evaluate(() => {
    const P = window.__perf;
    const fcp = P.paint.find(p => p.name === "first-contentful-paint")?.t ?? 0;
    const lcp = P.lcp.at(-1) || {};
    // CLS: largest session window (1s gap, 5s cap), excluding input-driven shifts.
    let cls = 0;
    let win = 0;
    let start = -1;
    let prev = -1;
    for (const s of P.cls.filter(s => !s.input)) {
      if (prev < 0 || s.t - prev > 1000 || s.t - start > 5000) (win = 0), (start = s.t);
      win += s.v;
      prev = s.t;
      cls = Math.max(cls, win);
    }
    // TTI: end of the last long task before the first 5 s window with none (network quiet ignored).
    const longs = P.long.filter(l => l.t + l.d > fcp);
    let tti = fcp;
    for (const l of longs) {
      if (l.t - tti >= 5000) break;
      tti = l.t + l.d;
    }
    const tbt = longs.filter(l => l.t < tti).reduce((a, l) => a + Math.max(0, l.d - 50 - Math.max(0, fcp - l.t)), 0);
    const resources = performance.getEntriesByType("resource");
    const field = resources.find(r => r.name.includes("StockField"));
    const nav = performance.getEntriesByType("navigation")[0];
    const timing = [["document", nav], ...resources.filter(r => /\.(js|css)$|fonts\.googleapis|woff2/.test(r.name)).map(r => [r.name.split("/").pop().slice(0, 32), r])].map(
      ([n, r]) => `${n} ${Math.round(r.startTime)}→${Math.round(r.responseEnd)}`,
    );
    let gl = "n/a";
    try {
      const c = document.createElement("canvas").getContext("webgl2");
      const ext = c.getExtension("WEBGL_debug_renderer_info");
      gl = ext ? c.getParameter(ext.UNMASKED_RENDERER_WEBGL) : c.getParameter(c.RENDERER);
    } catch {}
    return {
      fcp: Math.round(fcp),
      lcp: Math.round(lcp.t || 0),
      lcpEl: lcp.el,
      cls: Math.round(cls * 1000) / 1000,
      shifts: P.cls.filter(s => !s.input && s.v > 0.001).map(s => ({ t: Math.round(s.t), v: Math.round(s.v * 1000) / 1000, src: s.src.slice(0, 3) })),
      tbt: Math.round(tbt),
      tti: Math.round(tti),
      longest: Math.round(Math.max(0, ...longs.map(l => l.d))),
      longTasks: longs.map(l => [Math.round(l.t), Math.round(l.d)]),
      fieldChunk: field ? [Math.round(field.startTime), Math.round(field.responseEnd)] : null,
      timing,
      ready: P.ready && Math.round(P.ready),
      mode: P.mode,
      initLoaf: P.loaf
        .filter(l => l.scripts.some(s => /StockField/.test(s.src)))
        .slice(0, 2)
        .map(l => ({ t: Math.round(l.t), d: Math.round(l.d), scripts: l.scripts })),
      gl,
      dpr: devicePixelRatio,
      canvas: (c => (c ? [c.width, c.height] : null))(document.querySelector(".stage-canvas")),
    };
  });

  // Field frame time: hero at rest (the field idles continuously), then the scroll-scrubbed Decide chapter.
  await jump(page, 0, 1500);
  const hero = await frames(page, cdp, 5000);
  let heroHover = null;
  if (!mobile) {
    const vp = page.viewportSize();
    const wiggle = (async () => {
      for (let k = 0; k < 60; k++) await page.mouse.move(vp.width * (0.45 + 0.3 * Math.sin(k / 4)), vp.height * (0.35 + 0.15 * Math.cos(k / 5)));
    })();
    heroHover = await frames(page, cdp, 3000);
    await wiggle;
    await page.mouse.move(5, 5);
  }
  // Read on the way down, as a visitor would: Signal for a while (its pulses reach the field
  // every 2.3 s), then the start of Forecast.
  await jump(page, await sectionY(page, "signal", 0.2), 12000);
  await jump(page, await sectionY(page, "forecast", 0), 6000);
  const y0 = await sectionY(page, "decide", 0);
  const y1 = await sectionY(page, "decide", 1);
  await jump(page, y0, 2000);
  const decide = await frames(page, cdp, 6000, [y0, y1]);
  const loafs = await page.evaluate(() => window.__perf.loaf.map(l => ({ t: Math.round(l.t), d: Math.round(l.d), block: Math.round(l.block), style: Math.round(l.style), scripts: l.scripts })));

  const inp = await interactions(page, mobile);
  await context.close();
  await browser.close();
  return { profile: profileName, cpu, lab, hero, heroHover, decide, loafs, inp, errors };
}

const all = [];
for (const p of profiles)
  for (const cpu of cpus)
    for (let r = 0; r < runs; r++)
      for (const { label, url } of r % 2 ? [...targets].reverse() : targets) {
        const res = { label, ...(await one(p, cpu, url)) };
        all.push(res);
        const { lab, hero, decide, inp } = res;
        const worstInp = Math.max(0, ...Object.values(inp).map(v => (typeof v.ms === "number" ? v.ms : 0)));
        console.log(
          `${label.padEnd(6)} ${p.padEnd(7)} cpu${cpu}x r${r + 1}  FCP ${lab.fcp}  LCP ${lab.lcp} (${lab.lcpEl})  CLS ${lab.cls}  TBT ${lab.tbt}  longest ${lab.longest}  ready ${lab.ready} ${lab.mode}` +
            `  | hero ${hero.fps}fps p95 ${hero.p95}ms main ${hero.taskMs}ms/f  | decide ${decide.fps}fps p95 ${decide.p95}ms main ${decide.taskMs}ms/f style ${decide.styleLayoutMs}  | INP~ ${worstInp}`,
        );
      }
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify({ targets, query, gpu, date: new Date().toISOString(), results: all }, null, 2));
console.log(summarize(all));
console.log("gl:", all[0]?.lab.gl);
console.log("wrote", outFile);
