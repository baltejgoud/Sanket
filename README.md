# SANKET / PRISMA · Enterprise 2.4

Responsive interactive product website with the original 12-second hero loop and a new 20-second product walkthrough.

## Run

```powershell
npm install
npm run dev
```

Open http://localhost:5173. `npm run build` produces the static deployment in `dist/`; `npm run preview` serves that build.

React 18.3.1, TypeScript 5.6, Vite 5.4, Tailwind 3.4, Framer Motion, Recharts 2.13, Lucide, GSAP ScrollTrigger, and Lenis. The site respects reduced motion, includes keyboard controls, and supports phone, tablet, and desktop layouts.

## Working interactions

- **Hero motion graphic:** a silent 12-second seamless loop (`public/assets/hero-loop.mp4`, 720×720, ~300 KB) shows signals flowing into SANKET, a forecast with its range, a reorder decision and fewer stockouts. Visitors who prefer reduced motion see the poster frame instead.
- **Product journey:** Sound familiar? → real-world industry stories → How it works → the new film → interactive demo. Each story expands to reveal its full account and sources. The header wordmark shows SANKET only.
- **Industry examples:** an interactive "Sound familiar?" problem picker; six sourced real-world inventory failures with an All / India / Global filter (India car dealers 2024, Remdesivir 2021, BS-IV 2020, Nike 2001, H&M 2018, Target Canada 2015); and a three-step "How it works".
- **Languages:** English, Hindi and Telugu via the header switcher. The choice is remembered in the browser and sets `<html lang>`. Buyer-facing copy and section headings are translated (`src/i18n.ts`); the interactive demo panels and industry details stay in English; the revised calculator and film-section copy are translated.
- Forecast sandbox with baseline / price-cut / viral-spike scenarios and 13 / 26 / 52-week horizons, five industry workspaces, four decision engines and a searchable connector catalog.
- **ROI:** INR/USD sample businesses with Small business, Growing business and Enterprise presets. Currency changes load separate scenarios, not exchange-rate conversions. Default INR small business: ₹5,60,000. USD Enterprise: carrying $500,000 + stockout recovery $300,000 + freight $140,000 + markdowns $180,000 = $1,120,000. Sliders update immediately; typed amounts commit on blur or Enter. Freight and markdown assumptions are editable. Exact totals update without rolling digits; contribution bars animate.
- **Contact:** no booking form. Every call to action is a direct WhatsApp (wa.me) or email (mailto) link with a pre-written message in the visitor's language. The site publishes no pricing.


## Approved design and motion update

The hero retains its original copy, layout and video assets. Below it, the demo has a dark frame, the three-step explanation uses connected progress lines, story content is condensed, technical terms live in expandable details, and contact actions are consolidated in the header/hero/contact section. Industry/problem tabs have animated selection indicators and keyboard arrow navigation. Forecast changes drive the visible reorder recommendation. A native stock-transfer illustration plays once and offers replay; it does not load another video.

The new Brag film is `brag-output-2026-10-14-162835/brag.mp4`. Editable source and five scenes live in its `composition/` folder. Web delivery files are `public/assets/order-film.mp4`, `order-film-poster.jpg` and `order-film.vtt`. It loads only on play, has native controls, and pauses offscreen or when the page is hidden. No music or narration; two sparse existing CC0 UI accents. Examples are labeled illustrative. The original 25-second film remains archived.

```powershell
npm run film:render
```

This checks and renders the new film, extracts its settled product frame, bakes that poster as frame zero, installs the web assets and verifies the video metadata. It does not overwrite the hero loop. Native motion respects reduced-motion preferences; the click-to-play film remains user controlled. New film-section and calculator copy supports English, Hindi and Telugu. The film itself is in English, as labeled.

## Hero motion graphic

The HyperFrames project lives in `hero-loop/` (`index.html` is the composition, `BRIEF.md` the intent). Edit it in Studio with `cd hero-loop && npm run dev`, then re-render and publish the web copies:

```powershell
npm run hero:render
```

## Film / Brag pipeline (archived)

The original 25-second film is no longer shown on the site; its files were moved to `archive/old-site-assets/` along with the old hero and warehouse images. Running `npm run video:render` copies the film back into `public/assets`.


The requested source repository is checked out at `tools/brag` from https://github.com/latent-spaces/brag. The owning Brag plan and composition brief live in `brag-output`. Its editable HyperFrames composition is at `brag-output/composition/index.html`, with local GSAP, Manrope, source-site screenshot, artwork, and two CC0 Kenney sound accents.

```powershell
# Node 22+, FFmpeg and FFprobe on PATH
npm run video:render
```

This runs the pinned HyperFrames 0.8.156 check and render, extracts the settled poster, replaces only frame zero with that poster, and copies the completed assets into `public/assets`. Exact timing: 0–5 macro problem, 5–12 forecasting intelligence, 12–19 decisions, 19–25 enterprise impact and security. Output is 1920 × 1080 at 30 fps, 750 frames, exactly 25 seconds. Music is intentionally absent; two sparse sound accents support the visual arrivals. The bundled Brag music wasn't used because its README does not document exact public redistribution terms.

To review or edit in HyperFrames Studio:

```powershell
cd brag-output/composition
npx hyperframes@0.8.156 preview --background
```

`brag-output/brag.mp4`, `brag-output/brag.jpg`, and `brag-output/share-copy.txt` are the delivery artifacts. Manrope is from the Google Fonts repository under its OFL license. Kenney SFX are CC0; upstream Brag is MIT.

## Validation

```powershell
# With the Vite dev server running
node scripts/check-site.mjs
```

Checks the hero loop, scenarios, industry switching, the exact ROI baseline and a changed revenue scenario, absence of pricing content, direct contact links, the problem picker, the stories filter, Hindi and Telugu switching, connector search, mobile navigation, horizontal overflow, and browser errors. Screenshots are saved in `qa/`. HyperFrames check verified runtime, layout, and 99/99 text contrast checks; the composition retains five non-blocking suggestions to split its four scenes into sub-compositions.

## Integration boundary

This is a complete interactive frontend, not a deployed forecasting backend. Recharts quantiles and scenario updates are deterministic sandbox simulations; no SLSQP solver or model weights execute in the browser. Signal streams, models, connector adapters, database RLS, authentication, and GxP controls are product architecture demonstrations. Compliance certification, live telemetry, performance targets, competitor capabilities, and market figures are not independently verified. No production service credentials were provided or requested.

The brief's label “11 models” is retained as “11 core models”; the named catalog additionally includes classical estimators and a seasonal benchmark. Its enumerated variants exceed eleven and are displayed by family rather than presented as an exact implemented model count.

## Assets and prompts

The built-in image tool produced both final assets; prompt records are in `ASSETS.md`. Artwork is copied into the workspace and never referenced from a temporary location.
