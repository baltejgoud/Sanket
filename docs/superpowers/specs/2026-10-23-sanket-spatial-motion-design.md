# SANKET: Projection, Motion and Spatial Pass

Design specification · 23 October 2026 · builds on `2026-10-19-sanket-stock-field-design.md`

## 1. Goal

Keep the Stock Field story (unbalanced → signal → forecast → decide → in stock) and raise the whole site
on five fronts the owner asked for: intuitive navigation and hierarchy, access for everyone, measured
performance, world-class motion (kinetic type, skeuomorphic motion, micro-interactions), and spatial
technology (projection mapping, a navigable warehouse, "place it on your desk"). Business value comes
from shorter paths to the instruments and contact messages that carry what the visitor learned.

Selected direction (owner, 23 Oct): **evolve the Stock Field into a projection surface**, plus a
navigable 3D warehouse with WebXR placement. Rejected: a spatial-first rebuild (discards the approved
design, hurts accessibility and phones) and polish-only (misses the brief).

## 2. Audit findings this pass answers

| Area | Finding |
| --- | --- |
| Accessibility | The field breathes and pulses indefinitely; no control pauses it (WCAG 2.2.2). No automated WCAG audit has ever run; focus can hide under the sticky header (2.4.11). |
| Navigation | Five header links for ~17,500 px of page; no direct route to the sandbox, ROI calculator or connector search; the phone's call to action disappears after the hero. |
| Motion | Mostly fade-ups; numbers snap; controls feel flat. |
| Spatial | The field sits behind the copy but never carries a message itself. |
| Business | WhatsApp and email messages ignore what the visitor just did. |

## 3. Phase 0: baseline (done)

The in-progress performance pass (frame governor, async shader warm-up, Archivo preload, verb font
pre-build, `npm run perf`) is committed on its own (`95c153f`) so this pass can be compared against it.
Build at baseline: initial JS 143.7 kB gzip (index 47.4 + motion 50.8 + react 45.4), CSS 11.7 kB gzip,
StockField chunk 138.7 kB gzip (lazy).

## 4. Phase 1: foundations

### 4.1 Motion preference (WCAG 2.2.2)
- `src/lib/prefs.ts`: an external store with `motion: "full" | "calm"`, persisted in
  `localStorage["sanket-motion"]`, defaulting to `"calm"` when `prefers-reduced-motion: reduce`.
  `useMotion()` hook; `isCalm()` for imperative code; sets `html.is-calm`.
- Header button (icon + visually hidden label, `aria-pressed`): "Pause motion" / "Play motion".
- Calm means: the field renders still frames (as reduced motion does today, but switchable live via
  `StockField.setStill()` rather than a re-boot); the Signal chapter stops cycling; infinite CSS
  animations pause (`html.is-calm *` → `animation-play-state: paused` on the loops that exist: readout
  ping, scroll cue, calibrated dot); cursor smoothing and magnetic pull switch off; Lenis stays off.
- Reveal transitions (one-shot, under 1 s) remain in calm mode; system reduced motion still removes them.

### 4.2 Command palette
- `src/components/Palette.tsx`, lazy (`React.lazy`), opened by ⌘K / Ctrl+K, by `/` when focus is not
  in a text field, and by a "Jump to" header button (shows the shortcut as `<kbd>`).
- Native `<dialog>` (modal: the page is inert, focus contained, Escape closes, focus returns).
  Input is an ARIA 1.2 combobox (`aria-expanded`, `aria-controls`, `aria-activedescendant`) over a
  `listbox`; arrows/Home/End move, Enter runs, results grouped (Chapters · Tools · Actions) with group
  labels; a polite status reports the result count.
- Commands (`src/lib/commands.ts`, pure): every chapter and sub-chapter; tools (forecast sandbox,
  ROI calculator, connector search — focuses its input, public failures); actions (English / हिन्दी /
  తెలుగు, pause/play motion, explore the warehouse, WhatsApp, email, copy email address).
- Matching: case-insensitive, accent-insensitive; word-start matches rank above substring matches;
  every command also matches its English keywords in any language.

### 4.3 Wayfinding
- Header chapter links fill left-to-right with reading progress through their chapter group
  (`--read` on the active link only, written from the existing rAF scroll handler; page offsets
  measured on resize).
- `html { scroll-padding-top }` equals the header height so anchors and focused elements clear it.
- Phone dock (`src/components/Dock.tsx`, `< 700px`): appears after the hero, hides while Contact is
  on screen or a dialog is open; "Talk to us" (WhatsApp with context) and "Jump to"; respects
  `env(safe-area-inset-bottom)`; the page gains matching bottom padding so nothing is covered.

### 4.4 Context-aware contact
- `src/lib/visit.ts`: in-memory only (no storage, cookies or network), cleared on reload. Records
  the industry the visitor opened, the ROI estimate (formatted total, currency, size preset) and the
  sandbox scenario with its reorder quantity.
- `composeMessage(lang, base, context)` returns the localized WhatsApp/email body: the base greeting,
  then one line per item ("Industry: Apparel", "ROI estimate on your site: ₹5,60,000 a year (small
  business sample)", "Sandbox: viral spike, reorder 2,170").
- Contact shows the items as chips under "We'll include" with a remove button each; removing updates
  both links. Hero, dock and footer links use the same composer.

### 4.5 Audit
- `@axe-core/playwright` (dev only) runs inside `npm run check` at 1440 and 390 px, in en/hi/te, with
  WCAG 2.0–2.2 A/AA tags. Serious or critical violations fail the check; moderate ones are printed.
- Manual fixes the audit cannot see: target size ≥ 24 px (2.5.8) for rail dots, chips and close
  buttons; focus not obscured (2.4.11); every new control has a name, role and state.

## 5. Phase 2: motion system

Tokens added to `tokens.css`: `--ease-spring` (a CSS `linear()` spring, fallback `--ease-settle`),
`--ease-drop` (overshoot), `--t-roll` 700 ms.

### 5.1 Mechanical numbers
- `src/components/Odometer.tsx`: renders any string; each digit becomes a 0–9 strip that rolls to its
  value (`translateY`, `--t-roll`, `--ease-spring`, staggered right-to-left), other characters stay
  static. Digits are keyed from the right so a growing number keeps its columns. A visually hidden
  copy of the final string is the accessible text; the strips are `aria-hidden`.
- Variant `board`: digits sit in dark split-flap cells with a hairline hinge (departure-board look) for
  the sandbox decision quantity and the Decide results.
- Used for: ROI total and rows, sandbox expected demand and reorder quantity, Decide result figures,
  public-failure stats (roll up from zero once when their row first appears).
- Calm or reduced motion: no transition.

### 5.2 Skeuomorphic controls
- Sliders (`.range`): machined track with tick marks, a raised thumb with grip lines and a pressed
  state. `useDetents()` snaps within 1.5 % of a detent (ROI presets and defaults; sandbox 0) and calls
  `navigator.vibrate(6)` where it exists, only in full motion.
- Segmented toggles (`.seg`, language switch): a sliding puck positioned from the pressed button
  (`--x`, `--w` via a ResizeObserver hook), moving on `--ease-spring`.
- Buttons press in: 1 px travel, compressed shadow, inner highlight.

### 5.3 Kinetic type
- Chapter headings (`RevealHeading`): words drop into their masks like cartons and land with a short
  squash (`scaleY .94 → 1`, origin bottom). Word-level in every language, so conjuncts stay whole.
- Contact title: the Latin characters of its first line start at uneven heights (seeded offsets up to
  ±0.35 em) and level as the chapter scrolls in, ending flush when the field reads "in stock"; Indic
  scripts level by word. Transform only, scrubbed, level at once in calm or reduced motion.

### 5.4 Micro-interactions
- Copy address: icon morph plus a toast (`src/components/Toast.tsx`, `role="status"`), shared with the
  palette's copy action.
- Disclosures animate open (`interpolate-size: allow-keywords` with `::details-content`; instant where
  unsupported). Problem-tab indicator glides between tabs.
- Focus rings ease in (outline-offset); link underlines draw from the left; arrow icons nudge on hover.

## 6. Phase 3: projection and spatial

### 6.1 Projection-mapped field
- A virtual projector (a `PerspectiveCamera` high above the field, looking straight down) casts a
  `CanvasTexture` onto the columns and floor. Shaders get `uProjTex`, `uProjMat` (projector
  projection × view), `uProjAmt`, `uProjColor`; the column vertex shader passes the world position.
  Light is added to top faces at full strength and to side faces at 35 %, so projected marks streak
  down tall towers exactly as real projection mapping does on uneven surfaces.
- Because the viewer sees the field obliquely, marks on columns of different heights separate. On the
  unbalanced field projected words fracture; once the field is level they read cleanly. That is the
  story's payoff.
- Slides (`src/field/projection.ts`, drawn with the page's fonts once `document.fonts` is ready, in the
  visitor's language):
  - hero: "IN STOCK" at 35 % (fractured, a promise);
  - signal: the named signals, each written near its entry point;
  - problems: a reticle ring around the focused problem;
  - forecast: off (the mint bands carry the chapter);
  - decide: floor markings computed from the model — `+` over cells being ordered, chevrons from
    transfer source to destination, `−30%` on markdown cells — each fading in with its decision window;
  - level: "IN STOCK" at full strength, crisp.
- Slide changes fade the projector out, redraw the canvas, then fade in. One texture lookup per
  fragment; the texture is 1024² on phones and 2048 × 1024 elsewhere.
- The canvas stays `aria-hidden`; every projected word already exists in HTML.

### 6.2 Window camera and depth
- Pointer parallax becomes off-axis: the camera shifts with the pointer while `setViewOffset` keeps the
  look point pinned on screen, so tall towers swing against the floor like a view through a window.
- Device tilt (`deviceorientation`) drives the same offset on phones once the visitor turns on
  "Tilt to look" (palette or explore mode; iOS asks permission on that tap). Off in calm mode.
- Projected HUD labels scale with depth. Instrument panels catch a pointer-following sheen and tilt up
  to 2° (fine pointers, full motion only).

## 7. Phase 4: navigable warehouse and placement

### 7.1 Explore mode
- `src/explore/Explore.tsx` (lazy), a full-screen modal `<dialog>` over the existing stage canvas (no
  second WebGL context). Opened from the hero ("Explore the warehouse"), the palette, or `#explore`.
  Hidden when the stage is a poster.
- `StockField.setExplore(on)` hands the camera to `OrbitControls` (three addons, inside the lazy field
  chunk): drag or one finger orbits, wheel or pinch zooms, right-drag or two fingers pans.
- Keyboard: the viewport is a focusable `role="application"` with written instructions; arrows orbit,
  `+`/`−` zoom, W A S D pan, `N` jumps to the next stockout and announces its readout, Enter sends a
  signal from the selected cell.
- Panel: a timeline slider (Unbalanced → Signal → Forecast → Decide → In stock, mapped to the store's
  targets and decide scrub), the readout for the selected/hovered cell (polite live region), Send a
  signal, Tilt to look (touch), placement buttons (7.2), Close. Escape exits and restores the story
  camera.

### 7.2 Place it on your desk
- `src/explore/xr.ts`, loaded only when used. Buttons appear only after feature detection:
  - **Android Chrome (ARCore):** `immersive-ar` with `hit-test` and `dom-overlay`. A reticle tracks
    surfaces; a tap places the field 40 cm wide; the timeline slider and Exit live in the DOM overlay.
  - **Quest / Vision Pro:** `immersive-vr` with `local-floor`; the field floats at table height 80 cm
    ahead, about 1 m wide; select (trigger or pinch) sends a signal; the timeline plays itself.
  - **iPhone / iPad:** no WebXR, so the button is an `<a rel="ar">` to
    `public/assets/stock-field.usdz` (Apple Quick Look). The file is generated from the real model by
    `npm run usdz:render` (Playwright drives the page's own exporter, three's `USDZExporter`; cells
    grouped by material, unbalanced state, 0.45 m wide).
- In XR the field meshes live in one group that is scaled and placed; the field's own rAF loop hands
  over to `renderer.setAnimationLoop`; the clear alpha is 0 in AR; the floor grid is hidden; the loop
  and story camera return on session end.

## 8. Budgets and verification

| Budget | Target |
| --- | --- |
| Initial JS (gzip) | ≤ 150 kB; palette, explore, XR and USDZ code all lazy |
| CSS (gzip) | ≤ 14 kB |
| LCP element | Hero headline text (unchanged) |
| CLS | < 0.05 |
| Worst interaction (lab) | < 200 ms |
| Field frame time | Within 10 % of the `95c153f` baseline in `npm run perf` A/B |

Every phase: `npm run build`; `npm run check` extended first with that phase's assertions (motion
toggle, palette keyboard flow, dock, contact context and chip removal, odometer final text, detents,
explore open/keyboard/close, XR buttons hidden without support, axe); browser review at 1440, 768 and
390 px in en/hi/te with full, calm and reduced motion; screenshots in `qa/spatial/`.

**Cannot be verified here:** real AR/VR placement (needs an ARCore phone, an iPhone for Quick Look, or
a headset). Feature detection, fallbacks, the USDZ file's validity and the XR code path up to session
request are verified; the owner tests placement on a device.

## 9. Out of scope

New copy beyond labels for new controls; analytics or tracking; a backend; changes to the ROI formula,
sandbox model or field model data; audio.

## 10. Implementation record

Built as specified in phases 0–4 (commits `95c153f` … `dcf388d`), with these decisions made during the build:

- **Pause control naming.** The button keeps one name, "Pause motion", and `aria-pressed` carries the state (ARIA guidance: a toggle's name should not change with its state). Only the icon swaps.
- **Header room.** With the search pill and pause button, the five chapter links need ~1200 px; below that they fold into the index dialog (was 1100 px). The search pill shows its shortcut, with "Jump to" kept as its accessible name.
- **Budgets.** Palette and explore strings and CSS ship in their lazy chunks (`paletteCopy.ts`, `exploreCopy.ts`, `palette.css`, `explore.css`), OrbitControls is its own chunk, and the USDZ exporter is never shipped (the script imports it from the dev server). Result: initial JS 148.6 kB gzip, CSS 13.8 kB gzip.
- **Contrast.** The first axe run found 14 contrast failures, all fixed: forecast-ink text (4.42 → 5.16:1), muted text in the dark industry card (1.95 → 5.24:1), 11 px range limits / footnote / legal line (4.0 → 5.2:1 via `--concrete-dim`).
- **Projector geometry.** A parallel top-down projector rather than a perspective one, so Decide's markings land exactly on their cells; the fracture comes from the oblique story camera, which separates marks on columns of different heights. The floor takes a 50 % spill, which carries most of the legibility between columns. "IN / STOCK" is a stacked block just right of centre, where the story's copy leaves the field open.
- **Decide markings** use one colour channel per decision so each set fades with its own window from one texture.
- **Counters** render their glyphs with CSS, so the element's text stays exactly the value; existing checks that read numbers with `innerText` were unchanged.
- **Explore** reuses the stage canvas (no second WebGL context); the page is hidden with `html.is-exploring` and un-hidden before focus returns (a hidden element cannot take focus). N works anywhere in the dialog; the flight keys belong to the viewport.
- **Context-aware contact** compares instruments with their initial values instead of skipping the first effect, which StrictMode runs twice in development.
- **Test harness.** Software WebGL renders a few frames a second, so projector checks wait for each slide; the reading-progress check confirms its scroll landed (Lenis can drop an immediate scroll that follows another).

Not verified here: real AR/VR placement on devices, haptics on a physical Android phone, screen-reader walkthroughs beyond axe and the announced explore readouts.
