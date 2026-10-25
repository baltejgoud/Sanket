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

  const pad = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop));
  if (!(pad >= 64)) fail("scroll-padding-top should clear the sticky header, got " + pad);
  ok("scroll padding clears the sticky header (WCAG 2.4.11)");

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
  await page.locator(".industry-list").getByRole("button", { name: /Pharma/ }).click();
  await page.getByText("Every decision. Fully traceable.").first().waitFor();
  if ((await page.locator(".industry-list").getByRole("button", { name: /Pharma/ }).getAttribute("aria-expanded")) !== "true") fail("Pharma did not expand");
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
  if (!(await page.getByTestId("roi-total").locator(".odo-face").count())) fail("ROI total should be a mechanical counter");
  if ((await page.locator(".decision-qty .odo-board").count()) !== 1) fail("Reorder quantity should be a board counter");
  if ((await page.locator(".ledger-stat .odo").count()) !== 6) fail("Story figures should be counters");
  ok("mechanical counters keep exact text");
  await page.locator("#roi").screenshot({ path: `${out}/roi.png` });
  ok("ROI ₹5,60,000 / $1,120,000 / $1,420,000");

  // Contact carries what the visitor explored (Pharma is open, ROI and sandbox were used), and each item can be removed.
  const wa = async () => decodeURIComponent(await page.locator("#contact a[href^='https://wa.me/']").first().getAttribute("href"));
  await page.locator("#contact .context-chips li").nth(2).waitFor();
  const waText = await wa();
  if (!/Pharma/.test(waText) || !/\$1,420,000/.test(waText) || !/Baseline/.test(waText)) fail("WhatsApp message lacks context: " + waText);
  if (!/Pharma/.test(decodeURIComponent(await page.locator("#contact a[href^='mailto:']").first().getAttribute("href")))) fail("Email lacks context");
  await page.locator("#contact .context-chips").getByRole("button", { name: /Remove.*Pharma/ }).click();
  if (/Pharma/.test(await wa())) fail("Removed chip still in the message");
  ok("contact message carries removable context");

  // Detents: a revenue slider value close to the preset snaps to it; pressed segments carry a puck.
  await page.getByRole("button", { name: "₹ INR", exact: true }).click();
  await page.getByRole("button", { name: "Small business", exact: true }).click();
  await page.getByRole("slider", { name: "Annual revenue slider" }).fill("52500000");
  if ((await total()) !== "₹5,60,000") fail("Revenue slider should snap to the preset, got " + (await total()));
  await page.getByRole("slider", { name: "Annual revenue slider" }).fill(String(1e8));
  if ((await total()) === "₹5,60,000") fail("Revenue slider far from a detent should move freely");
  const puck = await page.locator(".roi-controls .seg").first().evaluate(el => [el.classList.contains("has-puck"), el.style.getPropertyValue("--w")]);
  if (!puck[0] || !parseFloat(puck[1])) fail("Segment puck not positioned: " + puck);
  ok("slider detents and segment puck");

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

  await page.getByRole("button", { name: "Copy email address" }).click();
  await page.locator(".toast").waitFor();
  ok("copying the address confirms with a toast");

  // Languages persist and set <html lang>.
  await page.getByRole("button", { name: "हिन्दी" }).first().click();
  await page.getByText("जो बिकता है, वही रखें।").first().waitFor();
  if ((await page.evaluate(() => document.documentElement.lang)) !== "hi") fail("Hindi lang attribute");
  await page.getByRole("button", { name: "తెలుగు" }).first().click();
  await page.reload({ waitUntil: "networkidle" });
  await page.getByText("అమ్ముడయ్యేదే నిల్వ చేయండి.").first().waitFor();
  await page.getByRole("button", { name: "English" }).first().click();
  ok("Hindi / Telugu switch and persist");

  // Motion control (WCAG 2.2.2): reduced motion starts calm; the toggle persists.
  const pause = page.getByRole("button", { name: /Play motion|Pause motion/ }).first();
  if ((await pause.getAttribute("aria-pressed")) !== "true") fail("Reduced motion should start calm");
  await pause.click();
  if (await page.evaluate(() => document.documentElement.classList.contains("is-calm"))) fail("Play motion did not leave calm mode");
  await page.reload({ waitUntil: "networkidle" });
  if ((await page.getByRole("button", { name: /Play motion|Pause motion/ }).first().getAttribute("aria-pressed")) !== "false") fail("Motion choice did not persist");
  await page.getByRole("button", { name: /Pause motion/ }).first().click();
  ok("motion pause control, persisted");

  // Command palette: shortcut, search, keyboard run, Escape returns focus.
  await page.keyboard.press("Control+k");
  const box = page.getByRole("combobox", { name: /Jump to/ });
  await box.waitFor();
  await box.fill("roi");
  await page.locator(".palette").getByRole("option", { name: /ROI calculator/ }).waitFor();
  const firstOption = await page.locator(".palette").getByRole("option").first().innerText();
  if (!/ROI/.test(firstOption)) fail("Palette: ROI should rank first for roi, got " + firstOption);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(600);
  if (await box.isVisible()) fail("Palette stayed open after running a command");
  const roiTop = await page.evaluate(() => document.getElementById("roi").getBoundingClientRect().top);
  if (Math.abs(roiTop) > 120) fail("Palette did not jump to ROI: " + roiTop);
  const jump = page.getByRole("button", { name: /Jump to/ }).first();
  await jump.click();
  await box.waitFor();
  await box.fill("hindi");
  await page.keyboard.press("Enter");
  await page.getByText("जो बिकता है, वही रखें।").first().waitFor();
  const anyBox = page.locator(".palette [role=combobox]");
  await page.keyboard.press("/");
  await anyBox.waitFor();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  if (await anyBox.isVisible()) fail("Palette: Escape did not close");
  await page.getByRole("button", { name: "English" }).first().click();
  await jump.click();
  await box.waitFor();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  if (!(await jump.evaluate(el => el === document.activeElement))) fail("Palette: focus did not return");
  ok("command palette: ⌘K and /, search, Enter, language action, Escape");
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

  // The current chapter's header link fills with reading progress.
  const read = await page.evaluate(async () => {
    const el = document.getElementById("decide");
    const y = el.offsetTop + el.offsetHeight / 2 - innerHeight * 0.45;
    window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
    await new Promise(r => setTimeout(r, 200));
    // Lenis can drop an immediate scroll that lands right after another; make sure we arrived.
    if (Math.abs(scrollY - y) > 2) scrollTo(0, y);
    await new Promise(r => setTimeout(r, 500));
    const a = document.querySelector('.chapter-nav a[aria-current]');
    return a ? [a.getAttribute("href"), parseFloat(a.style.getPropertyValue("--read"))] : null;
  });
  if (!read || read[0] !== "#decide" || !(read[1] > 0.3 && read[1] < 0.7)) fail("Header reading progress: " + JSON.stringify(read));
  ok("header link fills with reading progress");

  // Panels catch a sheen that follows the pointer (fine pointers, full motion).
  await page.evaluate(() => {
    const y = document.getElementById("problems").offsetTop;
    window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
  });
  await page.waitForTimeout(600);
  await page.locator(".problem-panel").hover({ position: { x: 40, y: 40 } });
  await page.waitForTimeout(300);
  const sheen = await page.locator(".problem-panel").evaluate(el => [el.classList.contains("sheen"), el.style.getPropertyValue("--mx")]);
  if (!sheen[0] || !sheen[1]) fail("Panel sheen not tracking the pointer: " + sheen);
  ok("panel sheen follows the pointer");

  // The projector follows the story: signal names, decide floor markings, "in stock" on the level field.
  // (Software WebGL renders a few frames a second, so wait for each slide rather than sleeping.)
  const slideAt = async (id, want) => {
    await page.evaluate(i => {
      const y = document.getElementById(i).offsetTop + 40;
      window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
    }, id);
    await page.waitForFunction(w => document.querySelector(".stage")?.dataset.slide === w, want, { timeout: 8000 }).catch(() => {});
    return page.locator(".stage").getAttribute("data-slide");
  };
  const slides = [
    await slideAt("top", "instock-faint"),
    await slideAt("signal", "signals"),
    await slideAt("decide", "decide"),
    await slideAt("contact", "instock"),
  ];
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "qa/spatial/projection-level.png" });
  if (slides.join("|") !== "instock-faint|signals|decide|instock") fail("Projector slides: " + slides.join("|"));
  ok("projector slides follow the story");

  // Explore mode: open from the hero, inspect by keyboard, scrub the timeline, Escape returns focus.
  await page.evaluate(() => (window.__lenis ? window.__lenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0)));
  await page.waitForTimeout(400);
  const exploreBtn = page.getByRole("button", { name: /Explore the warehouse/ });
  await exploreBtn.click();
  const dlg = page.getByRole("dialog", { name: /Explore the warehouse/ });
  await dlg.waitFor();
  const view = dlg.getByRole("application");
  if (!(await view.evaluate(el => el === document.activeElement))) fail("Explore: the viewport should take focus");
  await page.waitForTimeout(800);
  await page.keyboard.press("n");
  await dlg.locator(".explore-readout", { hasText: /SKU-\d+/ }).waitFor();
  if (!/SKU-\d+/.test(await dlg.getByRole("status").innerText())) fail("Explore: the selection was not announced");
  await page.keyboard.press("ArrowLeft");
  await dlg.getByRole("slider", { name: /Timeline/ }).fill("1");
  await page.keyboard.press("n");
  await page.waitForTimeout(300);
  if (!/No stockouts left/.test(await dlg.getByRole("status").innerText())) fail("Explore: at In stock there should be no stockouts");
  // No WebXR or Quick Look in headless Chromium: the placement controls must not appear.
  await page.waitForTimeout(300);
  if (await dlg.getByRole("button", { name: /Place on your desk|View in space/ }).count()) fail("XR buttons shown without WebXR support");
  if (await dlg.locator('a[rel="ar"]').count()) fail("Quick Look link shown outside Safari");
  await page.screenshot({ path: "qa/spatial/explore.png" });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  if (await dlg.isVisible()) fail("Escape did not close explore mode");
  if (!(await exploreBtn.evaluate(el => el === document.activeElement))) fail("Focus did not return from explore mode");
  if (await page.evaluate(() => document.documentElement.classList.contains("is-exploring"))) fail("Explore left the page hidden");
  ok("explore mode: hero entry, keyboard inspect and announce, timeline, Escape and focus return");

  // The contact title's letters start uneven and level as the chapter arrives.
  await page.evaluate(() => {
    const y = document.getElementById("contact").offsetTop - innerHeight * 0.9;
    window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
  });
  await page.waitForTimeout(700);
  const spreadAt = () => page.locator(".level-line .lc").evaluateAll(els => Math.max(...els.map(e => Math.abs(new DOMMatrix(getComputedStyle(e).transform).m42))));
  const before = await spreadAt();
  await page.evaluate(() => {
    const y = document.getElementById("contact").offsetTop;
    window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
  });
  await page.waitForTimeout(900);
  const after = await spreadAt();
  if (!(before > 4) || after > 1) fail(`Contact title should level: spread ${before} → ${after}`);
  ok("contact title levels on arrival");
  await context.close();
}

// ---------- WCAG 2.2 A/AA audit (axe): serious and critical issues fail ----------
{
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  const report = [];
  for (const [lang, width] of [
    ["en", 1440],
    ["hi", 1440],
    ["te", 1440],
    ["en", 390],
  ]) {
    const { context, page } = await open({ viewport: { width, height: 900 }, isMobile: width < 700, hasTouch: width < 700 });
    await page.evaluate(l => localStorage.setItem("sanket-lang", l), lang);
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const scan = async (state, include) => {
      const builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]);
      const { violations } = await (include ? builder.include(include) : builder).analyze();
      for (const v of violations) report.push(`${lang}@${width}${state} ${v.impact} ${v.id} ×${v.nodes.length}: ${v.nodes.slice(0, 3).map(n => n.target.join(" ")).join(" | ")}`);
    };
    await scan("");
    // Dialogs too: the palette everywhere, the index on phones.
    await page.keyboard.press("Control+k");
    await page.locator(".palette [role=combobox]").waitFor();
    await scan(" palette", ".palette");
    await page.keyboard.press("Escape");
    const explorable = page.locator('.hero-explore[data-ready="true"]');
    if (lang === "en" && width === 1440 && (await explorable.waitFor({ timeout: 20000 }).then(() => true, () => false))) {
      await explorable.click();
      await page.locator(".explore[open]").waitFor();
      await scan(" explore", ".explore");
      await page.keyboard.press("Escape");
    }
    if (width < 700) {
      await page.locator(".menu-button").click();
      await page.locator(".site-index").waitFor();
      await scan(" index", ".site-index");
      await page.keyboard.press("Escape");
    }
    await context.close();
  }
  const bad = report.filter(r => / (serious|critical) /.test(r));
  report.filter(r => !bad.includes(r)).forEach(r => console.log("axe (moderate/minor): " + r));
  if (bad.length) fail("axe:\n  " + bad.join("\n  "));
  ok("axe: no serious or critical WCAG 2.2 A/AA issues (en, hi, te at 1440; en at 390)");
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
    // Dock: hidden on the hero, shown mid-page, hidden again at Contact.
    const dock = page.locator(".dock");
    if (await dock.isVisible()) fail("Dock visible on the hero");
    await page.evaluate(() => scrollTo(0, document.getElementById("forecast").offsetTop));
    await page.waitForTimeout(500);
    if (!(await dock.isVisible())) fail("Dock hidden mid-page");
    if (!/wa\.me/.test(await dock.getByRole("link").first().getAttribute("href"))) fail("Dock should link to WhatsApp");
    await page.evaluate(() => scrollTo(0, document.getElementById("contact").offsetTop));
    await page.waitForTimeout(500);
    if (await dock.isVisible()) fail("Dock should hide at Contact");
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(300);
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

// Placement controls with (mocked) support: an ARCore phone gets "Place on your desk"; a refused
// session is reported and explore keeps working. An iPhone gets a Quick Look link to the model.
for (const device of ["webxr-ar", "quicklook"]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await context.addInitScript(d => {
    if (d === "webxr-ar") {
      Object.defineProperty(navigator, "xr", {
        value: { isSessionSupported: async m => m === "immersive-ar", requestSession: async () => Promise.reject(new DOMException("No device", "NotSupportedError")) },
      });
    } else {
      const supports = DOMTokenList.prototype.supports;
      DOMTokenList.prototype.supports = function (t) {
        return t === "ar" || supports.call(this, t);
      };
    }
  }, device);
  const page = await context.newPage();
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.locator('.hero-explore[data-ready="true"]').click();
  const dlg = page.locator(".explore[open]");
  await dlg.waitFor();
  if (device === "webxr-ar") {
    await dlg.getByRole("button", { name: "Place on your desk" }).click();
    await dlg.getByRole("status").filter({ hasText: /Couldn’t start AR or VR/ }).waitFor();
  } else {
    const link = dlg.locator('a[rel="ar"][href="/assets/stock-field.usdz"]');
    await link.waitFor({ timeout: 5000 }).catch(() => {}); // feature detection is async
    if ((await link.count()) !== 1 || (await link.locator("img").count()) !== 1) fail("Quick Look needs one rel=ar link wrapping an img");
  }
  await context.close();
}
ok("placement: WebXR AR button (refusal reported), Quick Look link to the USDZ");

// The Quick Look model (iPhone/iPad "View in AR") is a real USDZ package: a zip whose first file is the scene.
{
  const usdz = fs.readFileSync("public/assets/stock-field.usdz");
  if (usdz.subarray(0, 2).toString() !== "PK" || !usdz.includes(Buffer.from("model.usda"))) fail("public/assets/stock-field.usdz is not a USDZ package");
  if (!usdz.includes(Buffer.from("metersPerUnit = 1"))) fail("USDZ should be authored in metres");
  ok(`Quick Look model stock-field.usdz (${(usdz.length / 1024).toFixed(0)} kB)`);
}

await browser.close();
if (errors.length) fail("Runtime errors: " + errors.join("; "));
console.log("PASS\n- " + passed.join("\n- "));
