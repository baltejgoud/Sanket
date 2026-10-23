// Regression check for the Stock Field experience.
// Run against a dev or preview server:  SANKET_TEST_URL=http://localhost:5173 node scripts/check-site.mjs
import { chromium } from "playwright";
import fs from "node:fs";

const baseUrl = process.env.SANKET_TEST_URL || "http://localhost:5173";
const out = "qa/stock-field";
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const errors = [];
const passed = [];
const ok = name => passed.push(name);
const fail = msg => {
  throw Error(msg);
};

async function open(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce", ...options });
  const page = await context.newPage();
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => m.type() === "error" && errors.push(m.text()));
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  return { context, page };
}

// ---------- Desktop, reduced motion: content, instruments, arithmetic ----------
{
  const { context, page } = await open();
  const h1 = await page.locator("h1").innerText();
  if (!/Stock what sells\.\s*Skip what doesn't\./.test(h1.replace(/\n/g, " "))) fail("Hero headline changed: " + h1);
  if ((await page.locator("h1").count()) !== 1) fail("Exactly one h1 expected");
  ok("hero headline, single h1");

  // The Archivo preload must be a file Google Fonts' CSS still serves, or it is a wasted download.
  const preload = await page.evaluate(async () => {
    const href = document.querySelector('link[rel="preload"][as="font"]')?.getAttribute("href");
    const css = document.querySelector('link[rel="stylesheet"][href*="fonts.googleapis.com"]')?.getAttribute("href");
    if (!href || !css) return "missing";
    try {
      return (await fetch(css).then(r => r.text())).includes(href) ? "ok" : "stale: " + href;
    } catch {
      return "offline";
    }
  });
  if (preload !== "ok" && preload !== "offline") fail("Archivo font preload " + preload);
  ok(preload === "ok" ? "Archivo preload matches Google Fonts CSS" : "Archivo preload (not verified: Google Fonts unreachable)");

  // The field renders still frames under reduced motion (or falls back to the poster).
  await page.waitForSelector(".stage.is-ready canvas, .stage-poster", { timeout: 15000 });
  ok("field stage ready (WebGL or poster)");

  // Every in-page link lands somewhere, including the earlier anchors.
  const hrefs = await page.locator('a[href^="#"]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute("href")))]);
  for (const id of [...hrefs, "#how", "#film", "#command", "#platform", "#journey", "#intelligence", "#problems", "#stories", "#roi", "#security", "#contact", "#industries"]) {
    if (id === "#" || !(await page.locator(id).count())) fail("Broken anchor: " + id);
  }
  ok(`anchors resolve (${hrefs.length} links + legacy ids)`);

  // Problems: selecting a tab updates the panel.
  await page.getByRole("tab", { name: /Warehouse full of slow stock/ }).click();
  await page.getByText("The warehouse is full of what nobody wants.").waitFor();
  await page.keyboard.press("ArrowRight");
  await page.getByText("The forecast lives in one person's spreadsheet.").waitFor();
  ok("problem tabs, including arrow keys");

  // Sandbox: scenario drives the reorder decision.
  const qty = () => page.locator(".decision-qty strong").innerText();
  if ((await qty()) !== "1,240") fail("Baseline reorder should be 1,240, got " + (await qty()));
  await page.getByRole("button", { name: /Viral spike/ }).click();
  if ((await qty()) !== "2,170") fail("Viral spike reorder should be 2,170, got " + (await qty()));
  await page.getByRole("combobox", { name: "Forecast horizon" }).selectOption("26");
  await page.locator(".chart svg text", { hasText: "W26" }).waitFor();
  await page.getByRole("button", { name: "Reset forecast" }).click();
  await page.getByRole("combobox", { name: "Forecast horizon" }).selectOption("13");
  if ((await qty()) !== "1,240") fail("Reset should restore 1,240");
  await page.getByRole("slider", { name: "Demand adjustment" }).fill("200");
  if ((await qty()) === "1,240") fail("Demand slider did not change the decision");
  ok("sandbox scenarios, horizon, reset, slider → decision");

  // Industries accordion.
  await page.getByRole("button", { name: /Pharma/ }).click();
  await page.getByText("Every decision. Fully traceable.").first().waitFor();
  if ((await page.getByRole("button", { name: /Pharma/ }).getAttribute("aria-expanded")) !== "true") fail("Pharma did not expand");
  ok("industry accordion");

  // Connector search and setup details.
  await page.getByRole("textbox", { name: "Search connectors" }).fill("tally");
  if ((await page.locator(".catalog-col li").count()) !== 1) fail("Connector search should leave one result");
  await page.getByRole("button", { name: /Tally Prime/ }).click();
  await page.locator(".connector-detail", { hasText: "XML / HTTP bridge" }).waitFor();
  await page.getByRole("textbox", { name: "Search connectors" }).fill("zzz");
  await page.getByText("No matching integrations.").waitFor();
  await page.getByRole("textbox", { name: "Search connectors" }).fill("");
  ok("connector search, details, empty state");

  // ROI arithmetic: currency scenarios are separate examples, not conversions.
  const total = () => page.getByTestId("roi-total").innerText();
  if ((await total()) !== "₹5,60,000") fail("INR small business should be ₹5,60,000, got " + (await total()));
  await page.getByRole("button", { name: "$ USD", exact: true }).click();
  await page.getByRole("button", { name: "Enterprise", exact: true }).click();
  if ((await total()) !== "$1,120,000") fail("USD enterprise should be $1,120,000, got " + (await total()));
  await page.getByRole("spinbutton", { name: "Annual revenue", exact: true }).fill("200000000");
  await page.getByRole("spinbutton", { name: "Annual revenue", exact: true }).press("Enter");
  if ((await total()) !== "$1,420,000") fail("Revenue change should give $1,420,000, got " + (await total()));
  await page.locator("#roi").screenshot({ path: `${out}/roi.png` });
  ok("ROI ₹5,60,000 / $1,120,000 / $1,420,000");

  // Public stories: filter and sources.
  if ((await page.locator(".ledger-entry").count()) !== 6) fail("Six stories expected");
  await page.locator(".ledger").getByRole("button", { name: "India", exact: true }).click();
  if ((await page.locator(".ledger-entry").count()) !== 3) fail("India filter should leave three");
  await page.locator(".ledger").getByRole("button", { name: "All", exact: true }).click();
  await page.locator(".ledger-entry summary").first().click();
  if (!(await page.locator(".ledger-entry[open] .ledger-sources a").count())) fail("Story sources missing");
  ok("stories filter and sources");

  // Direct contact only; no pricing.
  const contact = await page.locator("a[href^='https://wa.me/'], a[href^='mailto:']").evaluateAll(els => els.map(e => e.getAttribute("href")));
  if (!contact.some(h => h.startsWith("https://wa.me/917993969656")) || !contact.some(h => h.startsWith("mailto:baltej.panagatla@gmail.com")))
    fail("Direct WhatsApp / email links missing");
  const body = await page.locator("body").innerText();
  if (/pricing|per month|\/mo\b/i.test(body)) fail("Pricing content found");
  ok("direct contact, no pricing");

  // Languages persist and set <html lang>.
  await page.getByRole("button", { name: "हिन्दी" }).first().click();
  await page.getByText("जो बिकता है, वही रखें।").first().waitFor();
  if ((await page.evaluate(() => document.documentElement.lang)) !== "hi") fail("Hindi lang attribute");
  await page.getByRole("button", { name: "తెలుగు" }).first().click();
  await page.reload({ waitUntil: "networkidle" });
  await page.getByText("అమ్ముడయ్యేదే నిల్వ చేయండి.").first().waitFor();
  await page.getByRole("button", { name: "English" }).first().click();
  ok("Hindi / Telugu switch and persist");
  await context.close();
}

// ---------- Motion on: the decide sequence is scrubbed by scroll ----------
{
  const { context, page } = await open({ reducedMotion: "no-preference" });
  await page.waitForTimeout(1500);
  const verbAt = async frac => {
    await page.evaluate(f => {
      const el = document.getElementById("decide");
      const y = el.offsetTop + (el.offsetHeight - innerHeight) * f;
      window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
    }, frac);
    await page.waitForTimeout(700);
    return page.locator(".verb.is-active").innerText();
  };
  const seen = [await verbAt(0.1), await verbAt(0.4), await verbAt(0.66), await verbAt(0.95)];
  if (seen.join("|") !== "Order.|Move.|Mark down.|Adapt.") fail("Decide sequence: " + seen.join("|"));
  await page.screenshot({ path: `${out}/decide.png` });
  ok("decide scrub: Order → Move → Mark down → Adapt");
  await context.close();
}

// ---------- Phone: overflow, index dialog, focus return ----------
for (const [width, height] of [
  [320, 640],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [844, 390],
]) {
  const { context, page } = await open({ viewport: { width, height }, hasTouch: width < 900, isMobile: width < 700 });
  const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (over > 0) fail(`${width}px horizontal overflow: ${over}px`);
  if (width === 390) {
    await page.screenshot({ path: `${out}/mobile.png` });
    const menu = page.getByRole("button", { name: "Open menu" });
    await menu.click();
    await page.getByRole("dialog").waitFor();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    if (await page.getByRole("dialog").isVisible()) fail("Escape did not close the index");
    if (!(await menu.evaluate(el => el === document.activeElement))) fail("Focus did not return to the menu button");
    await menu.click();
    await page.getByRole("dialog").getByRole("link", { name: /Decide/ }).click();
    await page.waitForTimeout(400);
    if (await page.getByRole("dialog").isVisible()) fail("Index did not close after navigation");
  }
  await context.close();
}
ok("no overflow at 320 / 390 / 768 / 1024 / landscape; phone index dialog");

await browser.close();
if (errors.length) fail("Runtime errors: " + errors.join("; "));
console.log("PASS\n- " + passed.join("\n- "));
