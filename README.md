# SANKET / PRISMA · The Stock Field

Demand-intelligence website for retailers, brands and distributors. One continuous WebGL scene, **the Stock Field**, sits behind the whole story. Every column is a product at a location, and its height is units on hand. Scrolling moves the field from unbalanced (empty pits beside overstock towers) through incoming signals, forecast bands and physical decisions (orders drop in, transfers arc across, markdowns shrink dead stock) to level: *in stock*.

*Sanket* (संकेत / సంకేతం) means "a signal; a sign of what comes next". The site is built on that meaning.

Design records: `docs/superpowers/specs/2026-10-19-sanket-stock-field-design.md` (audit, three directions, selection, architecture, visual and motion system) and `docs/superpowers/specs/2026-10-23-sanket-spatial-motion-design.md` (the projection, motion and spatial pass; plan in `docs/superpowers/plans/`). QA screenshots: `qa/stock-field/`, `qa/spatial/`. The previous uncommitted "Cinematic Intelligence" pass is archived in `archive/cinematic-pass-20261019/`.

## Run

```powershell
npm install
npm run dev          # http://localhost:5173
npm run build        # static site in dist/
npm run preview      # serve the build
npm run check        # regression check incl. axe WCAG 2.2 audit (set SANKET_TEST_URL if not on :5173)
npm run a11y         # detailed axe report: every issue, element, colours and ratio
npm run perf         # lab performance: throttled loads, field frame times, interactions (A/B with --urls)
npm run poster:render  # re-render the static fallback from the live scene
npm run usdz:render  # rebuild the Quick Look model public/assets/stock-field.usdz (needs the dev server)
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
- `src/field/projection.ts`: what the projector casts per chapter (slides drawn to a canvas; decide markings per colour channel).
- `src/field/timeline.ts`, `bridge.ts`, `tilt.ts`, `usdz.ts`: explore timeline, the running field for non-stage code, device tilt, the Quick Look exporter.
- `src/explore/`: explore mode (lazy): `Explore.tsx` dialog, `xr.ts` WebXR detection and sessions, strings.
- `src/components/Palette.tsx` (lazy), `Odometer.tsx`, `Dock.tsx`, `Toast.tsx`; `src/lib/prefs.ts` (motion choice), `visit.ts` (what the visitor explored), `commands.ts`, `detents.ts`.
- `src/copy.ts`: new strings in English, Hindi and Telugu; existing copy stays in `src/i18n.ts`. Palette and explore strings live in their lazy chunks.

## Behaviour notes

- **Fallbacks.** No WebGL2, data saving on, or less than 4 GB of reported memory: the field becomes `public/assets/stock-field.jpg`, rendered from the real scene. Reduced motion: no smooth scroll, reveals or idle motion; the field still shows each chapter's state as a still frame.
- **Phones.** A 24 × 16 field at a lower pixel ratio, a full-screen index dialog (focus is contained, Escape closes it, focus returns to the button), no hover-only behaviour, and native touch scrolling.
- **Motion choice.** The header's pause button (also in the phone index and the palette) stops everything that moves on its own: idle field motion, waves, the signal cycle, loops, cursor and magnetic effects, smooth scroll. Remembered; starts paused under reduced motion. One-shot reveals still run unless the system asks for reduced motion.
- **Honesty.** Field readouts, the sandbox, engine results and industry telemetry are labelled illustrative. The public stories are labelled as not SANKET customer results and link their sources. No testimonials, logos, pricing or new statistics were added.

## Working interactions

- Forecast sandbox: baseline / price cut / viral spike, 13 / 26 / 52-week horizons, chart drag, a keyboard-accessible demand slider, and reset. The decision follows the forecast (baseline 1,240 units; viral spike 2,170).
- **ROI:** INR/USD sample businesses with Small business, Growing business and Enterprise presets. Currency changes load separate scenarios, not exchange-rate conversions. Default INR small business: ₹5,60,000. USD Enterprise: $1,120,000; with revenue at 200,000,000 it becomes $1,420,000. Typed amounts commit on blur or Enter; the formula is shown.
- Problem tabs and the industry accordion are keyboard-operable; the connector search covers all three categories and has an empty state.
- **Languages:** English, Hindi and Telugu, remembered in the browser, and `<html lang>` is set. Industry details and the film remain in English, as labelled.
- **Contact:** no forms. WhatsApp (wa.me) and email (mailto) links carry a pre-written message in the visitor's language, plus what they explored (industry opened, ROI estimate, sandbox decision), shown as removable chips. Kept in memory only: never stored or sent except inside the link the visitor presses. The email address can be copied (with a toast).

## Projection, motion and spatial (23 October 2026)

- **Navigation.** ⌘K / Ctrl+K, `/` or the header's search pill opens a palette of every chapter, tool (ROI, sandbox, connector search, stories, film) and action (language, motion, explore, WhatsApp, email, copy address, tilt). Header links fill with reading progress. Phones get a dock (Talk to us, Jump to) after the hero; it hides at Contact.
- **Projection mapping.** A top-down projector casts light onto the stock: "IN / STOCK" fractured and faint on the unbalanced hero field, crisp on the level field at Contact; signal names and ripples; a reticle on the focused problem; Decide's floor markings (+ orders, dashed routes for transfers, % markdowns) fading with each decision window. The stage mirrors the slide in `data-slide`.
- **Spatial.** Off-axis window parallax (pointer, or phone tilt on request); labels scale with depth; panels catch a pointer-following sheen and tip up to 2°.
- **Explore the warehouse** (hero or palette): fly the live field (drag, pinch, keys), scrub the timeline Unbalanced → In stock, inspect columns (N = next stockout, announced), send signals. Escape returns to the story.
- **Place it on your desk.** In explore: WebXR AR on ARCore phones (tap a surface, 40 cm wide, timeline in a DOM overlay), VR on Quest / Vision Pro (table height), Apple Quick Look on iPhone / iPad (`stock-field.usdz`). Buttons appear only with support.
- **Motion system.** Mechanical counters (ROI, sandbox, Decide board, story figures); machined sliders with detents and Android haptics; springing segment pucks; pressable buttons; headings that drop in like cartons; a contact title whose letters level as you arrive; animated disclosures and focus rings; a gliding tab indicator.

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

## Validation (23 October 2026)

- `npm run build` passes. Initial JS 148.8 kB gzip (index 52.6 + motion 50.8 + react 45.4; budget 150), CSS 13.9 kB gzip (budget 14). Lazy: field 144 kB, palette 5.6 kB (+0.9 kB CSS), explore 4.7 kB (+1.5 kB CSS), OrbitControls 4.6 kB. The Quick Look model (1.7 MB) loads only when tapped.
- `npm run check` passes against the dev server and the production preview: 29 groups, including everything below plus the pause control, palette, dock, reading progress, contact context, counters, detents, toast, projector slides, sheen, explore (keyboard, announcements, timeline, focus return), the levelling title, mocked WebXR AR / Quick Look support, the USDZ package, and axe (WCAG 2.0–2.2 A/AA; en/hi/te at 1440, en at 390; page, palette, phone index and explore dialog): no issues of any impact.
- Lab A/B against `95c153f` (`npm run perf`, hardware GPU, 2–3 runs each; `qa/perf/spatial-ab*.log`): CLS unchanged (0.005 mobile, 0.002 desktop); worst interaction median 176 ms mobile 1× and 56–104 ms desktop; hero and Decide frame times within run-to-run noise; first paint 50–90 ms later (the extra ~5 kB JS / 2 kB CSS). Runs at 4× CPU vary too much between runs to compare. The first A/B found a 0.055 mobile CLS, a whole-page re-render at field boot and doubled projector uploads; all fixed (commit `da1353e`).
- Browser review at 1440, 768 and 390 px in English, Hindi and Telugu, plus calm mode: `qa/spatial/`.
- Not verified here: placing the field with a real ARCore phone, Quest / Vision Pro or iPhone Quick Look; haptics on a physical Android phone; screen-reader walkthroughs beyond axe and the announced explore readouts.

## Validation (19 October 2026)

- `npm run build` passes (TypeScript and Vite). Initial JS is about 143 kB gzip plus 12 kB of CSS; three.js is a separate lazy chunk of about 138 kB gzip.
- `node scripts/check-site.mjs` passes against both the dev server and the production preview, with 13 groups of assertions: the hero; the field stage; every anchor, including the legacy `#how`, `#film`, `#command`, `#platform`, `#journey` and `#intelligence`; problem tabs with arrow keys; sandbox decisions (1,240 → 2,170 → reset); horizon, slider, the industry accordion, connector search, details and empty state; exact ROI values; the stories filter and sources; direct contact and no pricing; Hindi/Telugu persistence; the Order → Move → Mark down → Adapt scrub; no horizontal overflow at 320, 390, 768 and 1024 px and in phone landscape; the phone index dialog (Escape and focus return); and no console errors.
- Visual review in headless Chromium at 1440, 768 and 390 px, in all three languages and with reduced motion: `qa/stock-field/`.
- Not measured: field Core Web Vitals, physical low-power devices, screen-reader walkthroughs, or a formal WCAG 2.2 audit.

## Integration boundary

This is a complete interactive frontend, not a deployed forecasting backend. Sandbox quantiles and scenario updates are deterministic simulations; no SLSQP solver or model weights execute in the browser. Signal streams, models, connector adapters, database RLS, authentication, and GxP controls are product architecture demonstrations. Compliance certification, live telemetry, performance targets, competitor capabilities, and market figures are not independently verified. No production service credentials were provided or requested.


## Assets and prompts

Asset records are in `ASSETS.md`. The Stock Field poster is rendered from the live scene; it is not generated artwork. Artwork is copied into the workspace and never referenced from a temporary location.
