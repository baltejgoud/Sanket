# SANKET — The Stock Field

Design specification · 19 October 2026

## 1. Audit

### What SANKET is

SANKET (sub-brand PRISMA) is demand forecasting and inventory decision support for retailers, brands and distributors. It reads sales and outside signals, forecasts every product every week as a range, and recommends what to **order**, **move** (transfer) or **mark down**. Its audience is practical operators, many of them Indian businesses running Tally, Busy, Marg, Zoho or Vyapar, alongside SAP, Shopify and spreadsheets. The site is trilingual (English, Hindi, Telugu). It converts through direct WhatsApp and email links; there is no form, booking flow or pricing.

The name matters. *Sanket* (संकेत / సంకేతం) means **a signal, a sign of what comes next**. No previous version of the site uses this.

### Sources inspected

- **Live production** (`sanket-swart.vercel.app`, matches `HEAD`): white and blue page with the headline "Stock what sells. Skip what doesn't.", a node diagram, about 10,100 px tall, nine anchored sections.
- **Uncommitted local pass** (from an earlier agent run today): a dark hero with a Three.js "probability ribbon", followed by the same twelve product sections reskinned in ivory and coral. About 13,000 px tall. It is archived in `archive/cinematic-pass-20261019/` before this redesign replaces it.

### Content inventory (all retained)

Hero promise · six inventory problems with costs and fixes · how it works in three steps · 20-second product film · forecast sandbox (3 scenarios, 13/26/52-week horizons, drag and slider adjustment, reorder decision) · five industry workspaces · four decision engines · stock-transfer example · 28 integrations in three categories with search · INR/USD ROI calculator with exact formula · six sourced public industry failures with region filter · four security commitments · WhatsApp and email contact · English, Hindi and Telugu.

### Weaknesses

| Area | Finding |
| --- | --- |
| Identity | Neither version uses the name's meaning. The live site reads as a generic SaaS page; the local pass has a distinctive hero but the identity stops at the first fold. |
| Storytelling | Twelve sections receive equal visual weight. The narrative (signal → forecast → decision) exists in the copy but not in the experience. |
| 3D | The ribbon expresses forecast uncertainty only. It can't show the product's real outputs (order, move, mark down) and it doesn't appear after the hero. |
| Composition | Below the fold: icon lists, card grids, chips and tabs. These are interchangeable template patterns. |
| Code | Six layered stylesheets (about 3,600 lines) override one another; `App.tsx` is 1,272 lines; Framer Motion and GSAP overlap; Recharts brings a generic chart look and about 150 KB. |
| Motion | Generic fade-ups; no scroll-directed sequence; no motion language. |

### Preserve

The plain-spoken voice; the line "Stock what sells. Skip what doesn't."; every working instrument (sandbox, industries, engines, catalog, ROI, stories); the honesty labels ("illustrative", "not SANKET customer results", source links); trilingual copy; direct contact; skip link, keyboard tabs, reduced-motion support.

## 2. Three directions

### A — Cinematic Intelligence: *The Stock Field*

**Concept.** Inventory made visible as a living landscape. Every column in a field of about 1,300 is one product at one location; its height is units on hand. The visitor's scroll directs one continuous scene: an **unbalanced** field (overstock towers beside glowing empty pits) → **signals** ripple through it → **forecast** bands rise above each column → units physically **move** (transfers arc from surplus to shortage, orders drop into pits, markdowns shrink dead stock) → the field settles **level**: *in stock*.

- Personality: nocturnal, industrial, precise, calm under pressure.
- Palette: warehouse ink, bone, concrete; **signal orange** (hi-vis, the colour of logistics) for stockouts, signals and action; cool **forecast mint** used only for the uncertainty band.
- Type: Archivo variable (width 62–125, weight 100–900) for display and text. Its width axis mirrors stock levels (letters widen and thicken under "demand"). Instrument Serif italic for human words, IBM Plex Mono for readouts, Tiro Devanagari Hindi / Tiro Telugu for Indic display.
- Signature interaction: the field is an instrument. Hover reads out the cell under the pointer; clicking **sends a signal** (a demand wave that propagates outward). Selecting an inventory problem moves the camera to that phenomenon.
- Motion: scroll-scrubbed state changes, damped camera moves, staggered settling that ripples outward.
- Distinction: it shows the thing customers actually manage, stock, and the three things SANKET does to it. It is not an "AI" visual.

### B — Future Editorial: *The Signal Ledger*

**Concept.** The bahi-khata, the red cloth-bound merchant ledger, reimagined. Ivory ruled pages, vermilion margin rules, stamped numerals and oversized trilingual type. Forecasts are drawn as ink on ruled paper, and every chapter is a ledger entry.

- Palette: ledger ivory `#F1EBDD`, binding red `#B3261E`, ink `#1A1714`, turmeric `#D9A21B`.
- Type: a condensed grotesk, a high-contrast serif, Tiro Indic and a typewriter mono.
- Signature: the wordmark rotates through SANKET / संकेत / సంకేతం; columns rule themselves as you read.
- Motion: ink draws, ruled lines, stamp impressions, page turns.
- Distinction: culturally specific and instantly recognisable. **Risk:** it reads as nostalgic rather than intelligent, and it can't demonstrate decisions physically.

### C — Living Digital System: *Signal Routes*

**Concept.** A responsive network: signal sources on the left, warehouses and stores as nodes, demand pulses routing through forecasting into order/transfer/markdown paths.

- Palette: deep olive, mineral white, chartreuse, copper.
- Signature: select a signal and watch its path resolve into a decision.
- **Risk:** node-and-pulse networks are the most familiar "tech" metaphor. A geographic map of India adds border-accuracy problems. The diagram also implies live telemetry the product site doesn't have.

### Comparison

| Criterion | Baseline ribbon | A Stock Field | B Ledger | C Routes |
| --- | --- | --- | --- | --- |
| Originality | Good; flowing-line fields are common | **High** | High | Low to medium |
| Product truth | Uncertainty only | **Order, move, mark down, made physical** | Strong voice, weak mechanism | Strong, but implies telemetry |
| Story across the page | Hero only | **One scene, five states** | Typographic | Diagram |
| Usability | Good | Good: text in clear panels over the scene | Best | Complex |
| Feasibility | Done | One instanced mesh and two small passes | Easy | Moderate |
| Emotional impact | Atmospheric | **Chaos → order payoff** | Warm | Technical |

**Selected: A — The Stock Field.** It is the only direction where one object carries the entire narrative and acts out the product's real decisions. From B it borrows the trilingual dictionary-entry signature (संकेत · *n.* a signal) and the ledger rhythm for the public-failures chapter. From C it takes one principle: interaction should mean something (a click is a signal).

## 3. Experience architecture

One page with anchor navigation, as before. Earlier anchors (`#how`, `#film`, `#command`, `#platform`, `#journey`, `#intelligence`) remain as ids on the matching new elements, so existing links still land in the right place. A fixed WebGL field sits behind the story. Dense instruments sit on opaque bone surfaces, and the field pauses while they cover the viewport.

| # | Chapter (anchor) | Field state | Objective | Desktop composition | Phone composition |
| --- | --- | --- | --- | --- | --- |
| 00 | Hero (`#top`) | Unbalanced, idle | Say what SANKET is in five seconds | Dictionary entry top-left, giant two-line headline, desc, two CTAs; live cell readout bottom-right; "send a signal" hint | Headline over the field, CTAs stacked, readout hidden |
| 01 | Signal (`#signal`) | Waves from named signal sources | Why it exists: demand moves before spreadsheets do | Statement left, signal names sweeping across, paragraph right | Stacked |
| 02 | The cost of guessing (`#problems`) | Camera visits each problem | Connect the promise to the visitor's pain | Numbered index left, detail panel right; selection moves the camera | Index as horizontal chips; detail below |
| 03 | Forecast (`#forecast`) | Forecast bands | How it works, then let them try it | Three-step rail; then the sandbox instrument on bone with the decision panel; film card | Rail stacks; instrument full width |
| 04 | Decide (`#decide`) | Order → Move → Mark down → Adapt, scrubbed | Show forecasts becoming decisions | Pinned; four huge verbs advance with scroll while the field acts each out | Not pinned; four verb blocks over the sticky field |
| 05 | Your world (`#industries`, `#integrations`) | Hidden (opaque) | Prove fit for their industry and tools | Large industry index with expanding detail; three-column searchable catalog | Accordion; catalog with category chips |
| 06 | Proof (`#roi`, `#stories`, `#security`) | Hidden | Make the case inspectable and honest | ROI instrument; public failures as a ledger table; quiet security band | Stacked |
| 07 | Invitation (`#contact`) | Level, one slow signal pulse | One unambiguous next step | Huge type, two contact rows | Stacked |

**Navigation.** Fixed header: wordmark (left), five chapter links with an active underline (centre), language switch and "Talk to us" (right). On desktop a vertical state rail on the right edge reads UNBALANCED · SIGNAL · FORECAST · DECIDE · IN STOCK and doubles as a scroll progress indicator. Phones get a full-screen index dialog (native `<dialog>`: focus is contained, Escape closes it, focus returns to the opener).

## 4. Visual system

### Colour tokens

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#0B0C0A` | Night background |
| `--ink-2` | `#141613` | Raised dark surfaces |
| `--line-dark` | `#2A2D28` | Rules on dark |
| `--concrete` | `#8D9088` | Secondary text on dark (6.0:1 on ink) |
| `--bone` | `#ECE8DF` | Primary text on dark; light surfaces |
| `--bone-2` | `#E2DDD1` | Light raised surface |
| `--graphite` | `#1B1D1A` | Text on bone |
| `--signal` | `#FF5A1F` | Signals, stockouts, CTAs on dark |
| `--signal-ink` | `#A83A0D` | Accent text on bone (5.2:1) |
| `--forecast` | `#9FD8C9` | Forecast range only |

Contrast pairs used for text are at least 4.5:1. Orange is never used for body text on bone.

### Typography

- Display: Archivo variable. Statements at `wdth 112–125`, `wght 700–800`, `clamp()` from 2.9 rem to 10.5 rem, tracking −0.035em, line-height 0.86.
- Text: Archivo `wdth 100`, `wght 400/500`, 1.0625 rem, line-height 1.55, measure ≤ 62ch.
- Human accent: Instrument Serif italic (Latin only).
- Data: IBM Plex Mono 400/500, uppercase labels at 0.6875 rem, tracking 0.14em.
- Hindi and Telugu: Tiro Devanagari Hindi / Tiro Telugu for display, Noto Sans Devanagari / Noto Sans Telugu for text, line-height raised to 1.15 (display) and 1.7 (text).

### Composition

A 12-column grid with 24 px gutters; content aligns to a 4-column left margin rule on desktop. Chapters alternate between full-bleed scene chapters (dark, type over the field) and instrument chapters (bone, ruled). Every chapter carries a mono "chapter plate" (`02 / THE COST OF GUESSING — FIELD STATE: SIGNAL`) and hairline rules.

## 5. Motion system

| Token | Value | Use |
| --- | --- | --- |
| `--ease-settle` | `cubic-bezier(.16,1,.3,1)` | Entrances, reveals |
| `--ease-move` | `cubic-bezier(.65,0,.35,1)` | State morphs, panels |
| `--t-micro` | 180 ms | Hover, press |
| `--t-ui` | 360 ms | Tabs, panels |
| `--t-reveal` | 900 ms | Line and word reveals |
| Scene damping | `1 − e^(−4.5·dt)` per frame | Field state and camera |
| Magnetic spring | GSAP `quickTo`, 0.45 s, `power3` | Buttons |

Choreography:

1. **Entry:** the HTML headline is visible immediately (no loader). Lines rise from masks over 0.9 s with a 0.08 s stagger. The field columns grow from zero, rippling outward from the hero's focal point over about 1.6 s.
2. **Headline:** in English, characters near the pointer widen and thicken (Archivo `wdth`/`wght`), as if demand were pulling on them. Indic scripts reveal by word only, to protect conjuncts.
3. **Scroll:** ScrollTrigger sets the target field state per chapter. The Decide chapter is scrubbed, so the visitor directs the decision sequence. Lenis smooths wheel input only; native touch scrolling stays native.
4. **Interaction:** a custom cursor (fine pointers only) shows contextual labels ("Send a signal", "Drag", "Play"). Buttons are magnetic. Underlines draw from the left.

`prefers-reduced-motion`: no smooth scroll, no reveals, no cursor effects, no idle motion. The field still renders each chapter's state as a still frame.

## 6. The field: technical design

- **Module:** `src/field/` — `model.ts` (pure, seeded, testable data: stock, balanced stock, forecast band, decision kind per cell, traveller routes), `StockField.ts` (imperative Three.js renderer), `FieldStage.tsx` (React wrapper, capability gate, scroll binding, readout HUD).
- **Meshes:** (1) columns: one `InstancedMesh` of unit boxes with a custom `ShaderMaterial` (height, colour by stock ratio, top-face light, fog to ink) where all state blending happens in the vertex shader from per-instance attributes and uniforms; (2) forecast bands: a second translucent instanced mesh; (3) travellers: about 140 small instanced boxes that follow arcs (transfers) or drops (orders) driven by one uniform; (4) a shader floor grid.
- **Uniforms:** `uState` (0 unbalanced → 4 level), `uDecide` (0–1 scrub), `uTime`, up to four `uWaves` (origin, start time), `uPointer`, `uFocus` (problem spotlight), `uIntro`.
- **Counts:** desktop 48 × 28 (1,344); tablet 36 × 22; phone 24 × 16. Pixel ratio capped at 1.75 (desktop) and 1.5 (phone).
- **Lifecycle:** render on demand; stop when hidden, offscreen, or covered by opaque chapters; dispose everything on unmount; fall back on `webglcontextlost`.
- **Gate:** WebGL is skipped for `saveData`, `deviceMemory < 4`, or no WebGL2/WebGL. Those visitors get `public/assets/stock-field.jpg`, rendered from the real scene with Playwright (`scripts/render-field-poster.mjs`).
- **Honesty:** the field is labelled "Illustrative stock field · 1,344 product–location pairs". Readout values are generated and labelled as an example.

## 7. Instruments

- **Forecast sandbox:** a bespoke SVG chart replaces Recharts. It keeps the same data model, scenarios, horizons, drag and slider adjustment, reset, reorder decision and technical disclosure, and adds keyboard support on the chart.
- **ROI:** the formula and values are unchanged (USD Enterprise `$1,120,000`; revenue 200M → `$1,420,000`; INR Small `₹5,60,000`); only the presentation changes. Framer Motion is removed.
- **Industries, engines, catalog, stories:** same data and behaviour, new compositions.

Dependencies after the rebuild: React, Three, GSAP (+ScrollTrigger, SplitText), Lenis, Lucide. Framer Motion and Recharts are removed.

## 8. Accessibility and performance targets

Semantic landmarks and a single `h1`; every interactive element is reachable by keyboard with a visible focus ring; tabs follow the ARIA tab pattern with arrow keys; the canvas is `aria-hidden` and has a text equivalent (the chapter copy says what the field shows); live regions for decisions; target sizes ≥ 44 px on touch; no horizontal overflow from 320 px; LCP is HTML text; three.js is a lazy chunk loaded after first paint; fonts are `display=swap` with preconnect.

## 9. Implementation plan

1. Archive the in-progress cinematic pass; remove superseded sources.
2. Tokens, base styles, fonts.
3. Field model + renderer + stage; capability gate; poster script.
4. Shell: header, index dialog, state rail, cursor, magnetic, reveal helpers, Lenis/ScrollTrigger wiring.
5. Chapters 00–02 (hero, signal, problems) with field states and focus.
6. Chapter 03 (steps, SVG sandbox, film) and 04 (pinned decide sequence).
7. Chapters 05–07 (industries, catalog, ROI, ledger, security, invitation, footer).
8. Copy for new strings in en/hi/te.
9. Browser QA at 1440, 1024, 768, 390 and 320 px; reduced motion; languages; check script; build.

## 10. Verification

`npm run build` passes; `node scripts/check-site.mjs` passes against the dev server (instruments, ROI values, languages, anchors, overflow, console errors, reduced-motion WebGL behaviour); in-app browser review of each chapter at desktop and phone widths, with screenshots in `qa/stock-field/`.

## 11. Implementation record

Built as specified, with these decisions made during the browser review:

- **Hero camera raised.** From a low angle, stockout pits hide behind their neighbours. A higher three-quarter view reads pits as glowing holes, and the mismatch field was made spatially coherent so the unbalance is visible in the first frame.
- **Finale camera.** The first grazing angle hid the order of the levelled field in haze. The final shot is high and wide, and one signal ring crosses the calm field.
- **Columns** are 0.5 wide (not 0.64) with a 0.8 height scale, so the floor grid shows and the field reads as precise rather than as rubble.
- **Named signals drive the waves** in chapter 01, so the highlighted signal and the wave entering the field are the same event.
- **The state rail follows the active chapter.** Between Decide and In stock it shows Decide as completed, rather than claiming a field state the visitor can't see.
- **Indic labels** use the text face with no tracking or case transform, because IBM Plex Mono has no Devanagari or Telugu.

Verification: see README → Validation. Screenshots: `qa/stock-field/`.
