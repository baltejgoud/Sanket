import { chromium } from "playwright";
import fs from "node:fs";
const baseUrl = process.env.SANKET_TEST_URL || "http://localhost:5173";
fs.mkdirSync("qa", { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.screenshot({ path: "qa/desktop.png", fullPage: false });

// Reduced-motion visitors get artwork and functional study controls without WebGL.
if (!(await page.locator(".cinema-art img").evaluate(el => el.complete && el.naturalWidth > 0)))
  throw Error("Forecast artwork missing");
if (await page.locator(".forecast-surface canvas").count()) throw Error("WebGL loaded under reduced motion");
await page.getByRole("button", {name:"03 Make your move",exact:true}).click();
if (!(await page.locator(".cinema-stage-caption p").innerText()).includes("Turn the forecast")) throw Error("Forecast study state failed");
await page.getByRole("button", {name:"02 See the possibilities",exact:true}).click();

// Forecast sandbox and industry workspace
await page.getByRole("button", { name: "Viral spike", exact: false }).first().click();
if (
  (await page
    .getByRole("button", { name: "Viral spike", exact: false })
    .first()
    .getAttribute("aria-pressed")) !== "true"
)
  throw Error("Scenario state missing");
await page.getByRole("tab", { name: "Pharma", exact: true }).click();
await page.getByText("Every decision. Fully traceable.").waitFor();
await page.getByRole("tab", { name: "Apparel", exact: true }).click();

// ROI arithmetic: currency scenarios are separate examples, not FX conversions.
await page.getByRole("button", { name: "$ USD", exact: true }).click();
await page.getByRole("button", { name: "Enterprise", exact: true }).click();
await page.locator("#roi").scrollIntoViewIfNeeded();
await page.screenshot({ path: "qa/roi.png" });
const resultBefore = await page.locator(".roi-result h3").innerText();
if (resultBefore !== "$1,120,000")
  throw Error("ROI baseline incorrect: " + resultBefore);
await page.getByRole("spinbutton", { name: "Annual revenue", exact: true }).fill("200000000");
await page.getByRole("spinbutton", { name: "Annual revenue", exact: true }).press("Tab");

await page.waitForTimeout(100);
if ((await page.locator(".roi-result h3").innerText()) !== "$1,420,000")
  throw Error("ROI revenue response incorrect");

await page.getByRole("button", {name:"₹ INR",exact:true}).click();
await page.getByRole("button", {name:"Small business",exact:true}).click();
if ((await page.getByTestId("roi-total").innerText()) !== "₹5,60,000") throw Error("INR example incorrect");
if (await page.locator(".floating-contact").count()) throw Error("Redundant floating contact remains");
const sectionOrder=await page.locator("main section[id]").evaluateAll(els=>els.map(el=>el.id));
if (!(sectionOrder.indexOf("how") > sectionOrder.indexOf("problems") && sectionOrder.indexOf("command") > sectionOrder.indexOf("how") && sectionOrder.indexOf("roi") > sectionOrder.indexOf("industries"))) throw Error("Narrative order changed");
if (!(await page.locator(".cinema-logo").innerText()).includes("SANKET")) throw Error("SANKET identity missing");
for (const anchor of await page.locator(".cinema-nav a, .cinema-hero a").all()) {
  const target=await anchor.getAttribute("href");
  if (!target || !(await page.locator(target).count())) throw Error("Broken navigation: " + target);
}
// No pricing anywhere
if (
  (await page.locator("#pricing, .price-card, .valuation").count()) ||
  (await page.getByText(/\$499|\/month|annual fee/).count())
)
  throw Error("Pricing content still present");

// Direct contact links only
const contactHrefs = await page
  .locator("a[href^='https://wa.me/'], a[href^='mailto:']")
  .evaluateAll((els) => els.map((e) => e.getAttribute("href")));
if (
  !contactHrefs.some((h) => h.startsWith("https://wa.me/917993969656")) ||
  !contactHrefs.some((h) => h.startsWith("mailto:baltej.panagatla@gmail.com"))
)
  throw Error("Direct WhatsApp / email links missing");
if (await page.getByRole("dialog").count()) throw Error("Unexpected dialog");

// Problems picker and stories filter
await page.getByRole("tab", { name: "Warehouse full of slow stock" }).click();
await page.getByText("The warehouse is full of what nobody wants.").waitFor();
if ((await page.locator(".story").count()) !== 6) throw Error("Stories missing");
await page.locator(".story-filter").getByRole("button", { name: "India", exact: true }).click();
if ((await page.locator(".story").count()) !== 3) throw Error("India filter failed");
await page.locator(".story-filter").getByRole("button", { name: "All", exact: true }).click();

await page.locator(".story-expand summary").first().click();
if (!(await page.locator(".story-expand[open] .story-sources a").count())) throw Error("Story sources inaccessible");
// Connector search
await page.getByRole("button", { name: "India ERP", exact: true }).click();
await page.getByRole("textbox", { name: "Search connectors" }).fill("Tally");
if ((await page.locator(".connector-grid button").count()) !== 1)
  throw Error("Connector search failed");

// Languages: Hindi and Telugu switch the buyer copy and persist
await page.getByRole("button", { name: "हिन्दी" }).click();
await page.getByText("जो बिकता है, वही रखें।").waitFor();
if ((await page.evaluate(() => document.documentElement.lang)) !== "hi")
  throw Error("Hindi lang attribute not set");
await page.screenshot({ path: "qa/desktop-hindi.png" });
await page.getByRole("button", { name: "తెలుగు" }).click();
await page.locator("h1").filter({hasText:"స్పష్టమైన భవిష్యత్తు,"}).waitFor();
await page.reload({ waitUntil: "networkidle" });
await page.locator("h1").filter({hasText:"స్పష్టమైన భవిష్యత్తు,"}).waitFor();
await page.screenshot({ path: "qa/desktop-telugu.png" });
await page.getByRole("button", { name: "English" }).click();

// Responsive
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.screenshot({ path: "qa/mobile.png" });
if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth))
  throw Error("Mobile horizontal overflow");
await page.getByRole("button", { name: "Open navigation", exact: true }).click();
await page.getByRole("dialog").getByRole("link", { name: /Industries/ }).click();
await page.locator("#industry-panel").waitFor({state:"visible"});
if (await page.getByRole("dialog").count()) throw Error("Mobile navigation did not close");
if (!(await page.locator(".cinema-header").isVisible())) throw Error("Mobile navigation missing");
await page.locator(".workspace-panel").screenshot({ path: "qa/mobile-workspace.png" });
for (const [w, h, label] of [
  [768, 1024, "Tablet"],
  [375, 812, "375px"],
  [812, 375, "Landscape"],
]) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
    throw Error(label + " overflow");
}

// Motion on: desktop gets the interactive scene and a working pause control.
await page.emulateMedia({ reducedMotion: "no-preference" });
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.locator(".forecast-surface canvas").waitFor();
await page.getByRole("button", {name:"Pause scene motion",exact:true}).click();
if (!(await page.getByRole("button", {name:"Resume scene motion",exact:true}).isVisible())) throw Error("Scene pause failed");
if (errors.length) throw Error("Runtime errors: " + errors.join("; "));
console.log(
  "PASS: forecast study, forecast scenarios, industry workspace, ROI arithmetic, direct contact, problems, stories, languages, connector search, mobile navigation, responsive overflow and scene pause.",
);
await browser.close();
