# SANKET / PRISMA · The Stock Field

Demand-intelligence website for retailers, brands and distributors. One continuous WebGL scene, **the Stock Field**, sits behind the whole story. Every column is a product at a location, and its height is units on hand. Scrolling moves the field from unbalanced (empty pits beside overstock towers) through incoming signals, forecast bands and physical decisions (orders drop in, transfers arc across, markdowns shrink dead stock) to level: *in stock*.

*Sanket* (संकेत / సంకేతం) means "a signal; a sign of what comes next". The site is built on that meaning.

Design record: `docs/superpowers/specs/2026-10-19-sanket-stock-field-design.md` (audit, three directions, selection, architecture, visual and motion system). QA screenshots: `qa/stock-field/`. The previous uncommitted "Cinematic Intelligence" pass is archived in `archive/cinematic-pass-20261019/`.

## Run

```powershell
npm install
npm run dev          # http://localhost:5173
npm run build        # static site in dist/
npm run preview      # serve the build
npm run check        # regression check (set SANKET_TEST_URL if not on :5173)
npm run poster:render  # re-render the static fallback from the live scene
```

React 18, TypeScript, Vite, three.js (vanilla, lazy-loaded), GSAP + ScrollTrigger, Lenis, Lucide. Plain CSS design system in `src/styles/` (tokens, base, shell, chapters, story, instruments). Framer Motion, Recharts and Tailwind were removed.

## Story

| # | Chapter | Field state | What it does |
| --- | --- | --- | --- |
| 00 | Hero | Unbalanced | "Stock what sells. Skip what doesn't." Dictionary entry for संकेत. Hover reads any cell; click sends a signal wave. |
| 01 | Signal | Waves | Named signals (sell-through, weather, search trends, festivals…) take turns entering the field. |
| 01·2 | The cost of guessing | Camera focus | Six problems; each one is a real place in the field (pit, dead stock, spreadsheet patch, new row, signal edge, wrong place). |
| 02 | Forecast | Bands | Mint bands show where stock should be; the gap is the decision. Three steps, then the sandbox and 20-second film. |
| 03 | Decide | Scrubbed | Sticky sequence: Order → Move → Mark down → Adapt. Scroll drives the field; verbs widen on Archivo's width axis as each decision fills. |
| 04 | Your world | — | Industry accordion with sample workspaces; searchable integration catalog. |
| 05 | Proof | — | ROI calculator, public failures as a ledger with sources, security. |
| 06 | Invitation | Level | Direct WhatsApp and email; one last signal crosses the level field. |

## Code map

- `src/field/model.ts`: pure, seeded field data. It encodes the six problems, the decisions and the cartons that move.
- `src/field/StockField.ts`, `shaders.ts`: three.js renderer. One instanced draw each for columns, forecast bands and cartons, plus arc trails and a floor grid. Renders on demand, pauses offscreen or hidden, disposes everything, and falls back on context loss.
- `src/field/FieldStage.tsx`: capability gate (WebGL2, `saveData`, `deviceMemory`), lazy import, pointer input, readout HUD, projected labels.
- `src/field/store.ts`, `useFieldScene.ts`: chapters push targets to the field via ScrollTrigger; scroll never re-renders React.
- `src/chapters/*`: one file per chapter; `Sandbox.tsx` is the bespoke SVG forecast chart (same data model as before).
- `src/copy.ts`: new strings in English, Hindi and Telugu; existing copy stays in `src/i18n.ts`.

## Behaviour notes

- **Fallbacks.** No WebGL2, data saving on, or less than 4 GB of reported memory: the field becomes `public/assets/stock-field.jpg`, rendered from the real scene. Reduced motion: no smooth scroll, reveals or idle motion; the field still shows each chapter's state as a still frame.
- **Phones.** A 24 × 16 field at a lower pixel ratio, a full-screen index dialog (focus is contained, Escape closes it, focus returns to the button), no hover-only behaviour, and native touch scrolling.
- **Honesty.** Field readouts, the sandbox, engine results and industry telemetry are labelled illustrative. The public stories are labelled as not SANKET customer results and link their sources. No testimonials, logos, pricing or new statistics were added.

## Working interactions

- Forecast sandbox: baseline / price cut / viral spike, 13 / 26 / 52-week horizons, chart drag, a keyboard-accessible demand slider, and reset. The decision follows the forecast (baseline 1,240 units; viral spike 2,170).
- **ROI:** INR/USD sample businesses with Small business, Growing business and Enterprise presets. Currency changes load separate scenarios, not exchange-rate conversions. Default INR small business: ₹5,60,000. USD Enterprise: $1,120,000; with revenue at 200,000,000 it becomes $1,420,000. Typed amounts commit on blur or Enter; the formula is shown.
- Problem tabs and the industry accordion are keyboard-operable; the connector search covers all three categories and has an empty state.
- **Languages:** English, Hindi and Telugu, remembered in the browser, and `<html lang>` is set. Industry details and the film remain in English, as labelled.
- **Contact:** no forms. WhatsApp (wa.me) and email (mailto) links carry a pre-written message in the visitor's language; the email address can be copied.

## Retained product film

The new Brag film is `brag-output-2026-10-14-162835/brag.mp4`. Editable source and five scenes live in its `composition/` folder. Web delivery files are `public/assets/order-film.mp4`, `order-film-poster.jpg` and `order-film.vtt`. It loads only on play, has native controls, and pauses offscreen or when the page is hidden. No music or narration; two sparse existing CC0 UI accents. Examples are labeled illustrative. The original 25-second film remains archived.

```powershell
npm run film:render
```

This checks and renders the new film, extracts its settled product frame, bakes that poster as frame zero, installs the web assets and verifies the video metadata. It does not overwrite the hero loop. Native motion respects reduced-motion preferences; the click-to-play film remains user controlled. New film-section and calculator copy supports English, Hindi and Telugu. The film itself is in English, as labeled.

## Hero motion graphic (not displayed)

The earlier hero loop is no longer shown on the site. The HyperFrames project lives in `hero-loop/` (`index.html` is the composition, `BRIEF.md` the intent). Edit it in Studio with `cd hero-loop && npm run dev`, then re-render and publish the web copies:

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

## Validation (19 October 2026)

- `npm run build` passes (TypeScript and Vite). Initial JS is about 143 kB gzip plus 12 kB of CSS; three.js is a separate lazy chunk of about 138 kB gzip.
- `node scripts/check-site.mjs` passes against both the dev server and the production preview, with 13 groups of assertions: the hero; the field stage; every anchor, including the legacy `#how`, `#film`, `#command`, `#platform`, `#journey` and `#intelligence`; problem tabs with arrow keys; sandbox decisions (1,240 → 2,170 → reset); horizon, slider, the industry accordion, connector search, details and empty state; exact ROI values; the stories filter and sources; direct contact and no pricing; Hindi/Telugu persistence; the Order → Move → Mark down → Adapt scrub; no horizontal overflow at 320, 390, 768 and 1024 px and in phone landscape; the phone index dialog (Escape and focus return); and no console errors.
- Visual review in headless Chromium at 1440, 768 and 390 px, in all three languages and with reduced motion: `qa/stock-field/`.
- Not measured: field Core Web Vitals, physical low-power devices, screen-reader walkthroughs, or a formal WCAG 2.2 audit.

## Integration boundary

This is a complete interactive frontend, not a deployed forecasting backend. Sandbox quantiles and scenario updates are deterministic simulations; no SLSQP solver or model weights execute in the browser. Signal streams, models, connector adapters, database RLS, authentication, and GxP controls are product architecture demonstrations. Compliance certification, live telemetry, performance targets, competitor capabilities, and market figures are not independently verified. No production service credentials were provided or requested.


## Assets and prompts

Asset records are in `ASSETS.md`. The Stock Field poster is rendered from the live scene; it is not generated artwork. Artwork is copied into the workspace and never referenced from a temporary location.
