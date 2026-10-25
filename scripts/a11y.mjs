// Detailed accessibility report (axe, WCAG 2.0–2.2 A/AA): every issue with its element, and
// for contrast the colours and ratio. Audits the page, then each tool dialog open on its own.
// Exits non-zero on any serious or critical issue, so it doubles as a CI gate.
// usage: SANKET_TEST_URL=http://localhost:5173 node scripts/a11y.mjs [--lang=en] [--width=1440,390] [--dialogs=0,1,2]
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const arg = (name, def) => process.argv.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? def;
const url = process.env.SANKET_TEST_URL || "http://localhost:5173";
const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const dialogs = arg("dialogs", "0,1,2").split(",").filter(Boolean).map(Number);
let serious = 0;
function report(label, violations) {
  console.log(`\n# ${label}: ${violations.length} rule(s)`);
  for (const v of violations) {
    if (v.impact === "serious" || v.impact === "critical") serious += v.nodes.length;
    console.log(`\n${v.impact} ${v.id}: ${v.help}`);
    for (const n of v.nodes) {
      const d = n.any[0]?.data;
      const contrast = d?.contrastRatio ? ` ${d.fgColor} on ${d.bgColor} = ${d.contrastRatio}:1 (${d.fontSize}, ${d.fontWeight})` : "";
      console.log(`  ${n.target.join(" ")}${contrast}`);
    }
  }
}
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
for (const lang of arg("lang", "en").split(","))
  for (const width of arg("width", "1440,390").split(",").map(Number)) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce", isMobile: width < 700 });
    const page = await context.newPage();
    await page.addInitScript(l => localStorage.setItem("sanket-lang", l), lang);
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForSelector(".campus-ready, .campus-fallback", { timeout: 30000 });
    await page.waitForTimeout(600);
    report(`${width}px ${lang} page`, (await new AxeBuilder({ page }).withTags(tags).analyze()).violations);
    for (const tool of dialogs) {
      await page.evaluate(t => window.dispatchEvent(new CustomEvent("sanket:tool", { detail: t })), tool);
      await page.waitForSelector("dialog[open] header h2:not(:empty)");
      await page.waitForFunction(() => !document.querySelector("dialog[open] [role=status]"));
      await page.waitForTimeout(300);
      report(`${width}px ${lang} dialog ${tool}`, (await new AxeBuilder({ page }).include("dialog[open]").withTags(tags).analyze()).violations);
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => !document.querySelector("dialog[open]"));
    }
    await context.close();
  }
await browser.close();
console.log(`\n${serious ? `FAIL: ${serious} serious/critical node(s)` : "PASS: no serious or critical issues"}`);
process.exit(serious ? 1 : 0);
