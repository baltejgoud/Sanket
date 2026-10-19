// Renders the static fallback for visitors without WebGL (or with data saving on)
// from the real Stock Field scene, so the fallback always matches the live hero.
// usage: SANKET_TEST_URL=http://localhost:5173 node scripts/render-field-poster.mjs
import { chromium } from "playwright";

const base = process.env.SANKET_TEST_URL || "http://localhost:5173";
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
await page.goto(`${base}/?poster`, { waitUntil: "networkidle" });
await page.waitForSelector(".stage.is-ready canvas", { timeout: 20000 });
await page.waitForTimeout(1500);
await page.locator(".stage").screenshot({ path: "public/assets/stock-field.jpg", type: "jpeg", quality: 80 });
await browser.close();
console.log("wrote public/assets/stock-field.jpg");
