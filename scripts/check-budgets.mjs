// Bundle budgets on a production build: what the first paint downloads (the entry script, the
// chunks it preloads and the stylesheet), gzipped, plus a ceiling on the lazy 3D engine chunk.
// usage: npm run build && node scripts/check-budgets.mjs [--dist=dist]
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const arg = (name, def) => process.argv.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? def;
const dist = path.resolve(arg("dist", "dist"));
const BUDGETS = { initialJs: 150, mainCss: 14, engineJs: 175 }; // kB gzip
const html = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const gz = file => zlib.gzipSync(fs.readFileSync(path.join(dist, file)), { level: 9 }).length / 1024;
const refs = re => [...html.matchAll(re)].map(m => m[1].replace(/^\//, ""));
const js = [...refs(/<script[^>]+src="([^"]+\.js)"/g), ...refs(/<link rel="modulepreload"[^>]+href="([^"]+)"/g)];
const css = refs(/<link rel="stylesheet"[^>]+href="([^"]+\.css)"/g);
const engine = fs.readdirSync(path.join(dist, "assets")).filter(f => /^engine-.*\.js$/.test(f)).map(f => `assets/${f}`);
const sum = files => files.reduce((a, f) => a + gz(f), 0);
const rows = [
  ["initial JS", sum(js), BUDGETS.initialJs, js],
  ["main CSS", sum(css), BUDGETS.mainCss, css],
  ["engine chunk (lazy)", sum(engine), BUDGETS.engineJs, engine],
];
let failed = false;
for (const [name, kb, budget, files] of rows) {
  const ok = kb <= budget;
  failed ||= !ok;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${kb.toFixed(2)} kB gzip (budget ${budget}) — ${files.join(", ")}`);
}
const fonts = /fonts\.(googleapis|gstatic)\.com/.test(html);
if (fonts) { failed = true; console.log("FAIL index.html still requests Google Fonts; fonts are self-hosted"); }
process.exit(failed ? 1 : 0);
