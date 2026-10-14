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

// Hero motion graphic: poster image under reduced motion, looping video otherwise
if (!(await page.locator(".hero-video img[src='/assets/hero-loop-poster.jpg']").count()))
  throw Error("Reduced-motion hero poster missing");

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
const sectionOrder=await page.locator("main>section").evaluateAll(els=>els.map(el=>el.id));
if (!(sectionOrder.indexOf("stories") === sectionOrder.indexOf("problems") + 1 && sectionOrder.indexOf("how") === sectionOrder.indexOf("stories") + 1)) throw Error("Expected problems, stories, then how it works");
if ((await page.locator("header .logo").innerText()) !== "SANKET" || await page.locator("header .logo svg, header .prisma").count()) throw Error("Header must show SANKET only");
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
await page.getByText("అమ్ముడయ్యేదే నిల్వ చేయండి.").waitFor();
await page.reload({ waitUntil: "networkidle" });
await page.getByText("అమ్ముడయ్యేదే నిల్వ చేయండి.").waitFor();
await page.screenshot({ path: "qa/desktop-telugu.png" });
await page.getByRole("button", { name: "English" }).click();

// Responsive
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.screenshot({ path: "qa/mobile.png" });
if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth))
  throw Error("Mobile horizontal overflow");
await page.getByRole("button", { name: "Open menu", exact: true }).click();
await page.getByRole("link", { name: "Industries", exact: true }).click();
if (await page.getByRole("button", { name: "Close menu", exact: true }).count())
  throw Error("Menu did not close");
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

// Motion on: the hero loop actually plays
await page.emulateMedia({ reducedMotion: "no-preference" });
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.waitForFunction(() => {
  const v = document.querySelector(".hero-video video");
  return v && v.duration > 11.9 && v.duration < 12.1 && v.loop && v.muted;
});
if (errors.length) throw Error("Runtime errors: " + errors.join("; "));
console.log(
  "PASS: hero loop, forecast, workspace, ROI arithmetic, no pricing, direct contact, problems, stories + India filter, Hindi/Telugu, connector search, mobile menu, responsive overflow, runtime.",
);
await browser.close();
