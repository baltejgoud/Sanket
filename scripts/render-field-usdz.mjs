// Builds the Quick Look model (iPhone/iPad "View in AR") from the real field model:
// public/assets/stock-field.usdz. The exporter (src/field/usdz.ts) runs in a browser page served
// by the Vite dev server, so the model, three.js and the exporter are exactly the site's own.
// usage: SANKET_TEST_URL=http://localhost:5173 node scripts/render-field-usdz.mjs   (dev server, not preview)
import { chromium } from "playwright";
import fs from "node:fs";

const base = process.env.SANKET_TEST_URL || "http://localhost:5173";
const browser = await chromium.launch();
const page = await browser.newPage();
const run = () =>
  page.evaluate(async () => {
    const { exportFieldUsdz } = await import("/src/field/usdz.ts");
    const bytes = await exportFieldUsdz();
    let s = "";
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(s);
  });
// The first import can make Vite pre-bundle the three.js add-ons and reload the page; try again.
let b64 = "";
for (let attempt = 0; !b64 && attempt < 3; attempt++) {
  await page.goto(base, { waitUntil: "networkidle" });
  b64 = await run().catch(e => (attempt === 2 ? Promise.reject(e) : ""));
}
await browser.close();
const buf = Buffer.from(b64, "base64");
if (buf.subarray(0, 2).toString() !== "PK") throw Error("exporter did not return a USDZ (zip) package");
fs.writeFileSync("public/assets/stock-field.usdz", buf);
console.log(`wrote public/assets/stock-field.usdz (${(buf.length / 1024).toFixed(0)} kB)`);
