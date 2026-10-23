// Detailed accessibility report (axe, WCAG 2.0–2.2 A/AA): every issue with its element, and
// for contrast the colours and ratio. `npm run check` fails on serious issues; this explains them.
// usage: SANKET_TEST_URL=http://localhost:5173 node scripts/a11y.mjs [--lang=en] [--width=1440]
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const arg = (name, def) => process.argv.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? def;
const url = process.env.SANKET_TEST_URL || "http://localhost:5173";
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
for (const width of arg("width", "1440,390").split(",").map(Number)) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce", isMobile: width < 700 });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(l => localStorage.setItem("sanket-lang", l), arg("lang", "en"));
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  console.log(`\n# ${width}px: ${violations.length} rule(s)`);
  for (const v of violations) {
    console.log(`\n${v.impact} ${v.id}: ${v.help}`);
    for (const n of v.nodes) {
      const d = n.any[0]?.data;
      const contrast = d?.contrastRatio ? ` ${d.fgColor} on ${d.bgColor} = ${d.contrastRatio}:1 (${d.fontSize}, ${d.fontWeight})` : "";
      console.log(`  ${n.target.join(" ")}${contrast}`);
    }
  }
  await context.close();
}
await browser.close();
