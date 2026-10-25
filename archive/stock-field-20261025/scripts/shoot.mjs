// Visual QA: capture the running site at chosen scroll targets.
// usage: node scripts/shoot.mjs <outDir> <width>x<height> <target>[@wait] ...
//   target: "top", a section id ("#decide"), a pixel offset ("1200"),
//           or "#decide+0.5" for a fraction through a section.
// env: SANKET_TEST_URL (default http://localhost:5173), REDUCED=1, LANG_CODE=hi|te, QUERY=?poster
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const [outDir = "qa/shots", size = "1440x900", ...targets] = process.argv.slice(2);
const [width, height] = size.split("x").map(Number);
const base = (process.env.SANKET_TEST_URL || "http://localhost:5173") + (process.env.QUERY || "");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 1,
  reducedMotion: process.env.REDUCED ? "reduce" : "no-preference",
  hasTouch: width < 700,
  isMobile: width < 700,
});
if (process.env.LANG_CODE) await context.addInitScript(l => localStorage.setItem("sanket-lang", l), process.env.LANG_CODE);
const page = await context.newPage();
const logs = [];
page.on("console", m => (m.type() === "error" || m.type() === "warning") && logs.push(`${m.type()}: ${m.text()}`));
page.on("pageerror", e => logs.push(`pageerror: ${e.message}`));
await page.goto(base, { waitUntil: "networkidle" });
await page.waitForTimeout(3200);

for (const raw of targets.length ? targets : ["top"]) {
  const [target, wait = "1800"] = raw.split("@");
  await page.evaluate(t => {
    const lenis = window.__lenis;
    let y = 0;
    if (t === "top") y = 0;
    else if (t.startsWith("#")) {
      const [id, frac = "0"] = t.slice(1).split("+");
      const el = document.getElementById(id);
      if (el) y = el.getBoundingClientRect().top + window.scrollY + el.offsetHeight * parseFloat(frac) - (frac === "0" ? 0 : 0);
    } else y = parseFloat(t);
    window.scrollTo(0, y);
    lenis?.scrollTo?.(y, { immediate: true });
  }, target);
  await page.waitForTimeout(Number(wait));
  const name = `${String(targets.indexOf(raw)).padStart(2, "0")}-${target.replace(/[^a-z0-9.+-]/gi, "_")}.jpg`;
  await page.screenshot({ path: path.join(outDir, name), type: "jpeg", quality: 82 });
  console.log("shot", name);
}
console.log(logs.length ? logs.join("\n") : "no console errors");
await browser.close();
