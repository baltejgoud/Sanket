# SANKET Projection, Motion and Spatial Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a motion pause control, ⌘K palette, phone dock, context-aware contact, an axe audit, mechanical numbers, skeuomorphic controls, kinetic type, a projection-mapped field, a window camera, an explore mode and WebXR / Quick Look placement to the Stock Field site.

**Architecture:** React 18 chapters push targets to an external `fieldStore`; a vanilla three.js renderer (`StockField`) eases toward them. New cross-cutting state lives in small external stores (`prefs`, `visit`) read with `useSyncExternalStore`, so scroll never re-renders React. Everything heavy (palette, explore, XR, USDZ) is a lazy chunk.

**Tech Stack:** React 18.3, TypeScript 5.6, Vite 5.4, three 0.186 (+ addons OrbitControls, USDZExporter), GSAP 3 + ScrollTrigger, Lenis, Playwright (checks), `@axe-core/playwright` (dev).

**Spec:** `docs/superpowers/specs/2026-10-23-sanket-spatial-motion-design.md`

## Global Constraints

- Initial JS ≤ 150 kB gzip; CSS ≤ 14 kB gzip; palette, explore, XR and USDZ code lazy.
- LCP stays the hero headline text; CLS < 0.05; worst lab interaction < 200 ms; field frame time within 10 % of `95c153f`.
- Every new user-facing string exists in `en`, `hi` and `te` (`src/copy.ts`); Indic text animates by word, never by character.
- No storage of visitor context, no tracking, no network calls added; contact stays WhatsApp + email links.
- `prefers-reduced-motion: reduce` → no transitions, no smooth scroll; "calm" mode → no looping or ambient motion.
- Tests are assertions in `scripts/check-site.mjs` (the project's regression harness). Run against the dev server: `SANKET_TEST_URL=http://localhost:5174 node scripts/check-site.mjs` (port from `.claude/launch.json` / preview_start).
- Match surrounding code: terse why-comments, plain CSS in `src/styles/`, hooks in `src/lib/`.

## File map

| File | Responsibility |
| --- | --- |
| `src/lib/prefs.ts` (new) | Motion preference store: `full` / `calm`, persisted, `html.is-calm` |
| `src/lib/visit.ts` (new) | In-memory visitor context + `composeMessage()` |
| `src/lib/commands.ts` (new) | Pure command list + `rankCommands()` |
| `src/lib/detents.ts` (new) | `snapToDetent()` + `useSegPuck()` |
| `src/components/Palette.tsx` (new, lazy) | ⌘K dialog, combobox + listbox |
| `src/components/Dock.tsx` (new) | Phone dock after the hero |
| `src/components/Odometer.tsx` (new) | Rolling digits, `board` variant |
| `src/components/Toast.tsx` (new) | `toast(message)` + `<Toaster/>` status region |
| `src/field/projection.ts` (new) | Projector slides drawn to a canvas |
| `src/explore/Explore.tsx` (new, lazy) | Explore dialog, timeline, readout, buttons |
| `src/explore/xr.ts` (new, lazy) | AR / VR sessions |
| `scripts/render-field-usdz.mjs` (new) | Writes `public/assets/stock-field.usdz` |
| `src/field/StockField.ts` | `setStill`, projector, view offset, `setExplore`, XR hooks |
| `src/field/shaders.ts` | Projection chunk in column + floor shaders |
| `src/field/FieldStage.tsx` | Calm wiring, projection copy, explore/XR bridge |
| `src/components/Header.tsx` | Pause button, Jump-to button, reading progress |
| `src/App.tsx` | Shortcuts, lazy palette/explore, dock, toaster |
| chapters | Context recording, odometers, detents, kinetic type |
| `src/copy.ts` | New strings ×3 languages |
| `src/styles/*.css` | Styles for all of the above |
| `scripts/check-site.mjs` | New assertions + axe |

---

## Phase 1 — Foundations

### Task 1: Motion preference and pause control

**Files:**
- Create: `src/lib/prefs.ts`
- Modify: `src/components/Header.tsx`, `src/field/StockField.ts` (tick/update), `src/field/FieldStage.tsx`, `src/chapters/Signal.tsx`, `src/components/Cursor.tsx`, `src/lib/motion.ts` (`useMagnetic`, `useSmoothScroll` caller), `src/App.tsx`, `src/copy.ts`, `src/styles/shell.css`, `scripts/check-site.mjs`

**Interfaces:**
- Produces: `prefs.get(): { motion: "full" | "calm" }`, `prefs.setMotion(m)`, `prefs.subscribe(fn)`, `useMotion(): "full" | "calm"`, `isCalm(): boolean`; `StockField.setStill(still: boolean): void`; copy `nav.pause`, `nav.play`.

- [ ] **Step 1: Failing check** — add after the language block in the reduced-motion desktop group:

```js
  // Motion control (WCAG 2.2.2): reduced motion starts calm; the toggle persists.
  const pause = page.getByRole("button", { name: /Play motion|Pause motion/ }).first();
  if ((await pause.getAttribute("aria-pressed")) !== "true") fail("Reduced motion should start calm");
  await pause.click();
  if ((await page.evaluate(() => document.documentElement.classList.contains("is-calm")))) fail("Play motion did not leave calm mode");
  await page.reload({ waitUntil: "networkidle" });
  if ((await page.getByRole("button", { name: /Play motion|Pause motion/ }).first().getAttribute("aria-pressed")) !== "false") fail("Motion choice did not persist");
  await page.getByRole("button", { name: /Pause motion/ }).first().click();
  ok("motion pause control, persisted");
```

- [ ] **Step 2:** Run the check; expect `FAIL ... getByRole ... Pause motion` timeout.
- [ ] **Step 3: Implement `src/lib/prefs.ts`:**

```ts
import { useSyncExternalStore } from "react";

export type Motion = "full" | "calm";
const KEY = "sanket-motion";
const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function read(): Motion {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "full" || v === "calm") return v;
  } catch {
    // storage unavailable
  }
  return reduced() ? "calm" : "full";
}

let motion: Motion = typeof window === "undefined" ? "full" : read();
const listeners = new Set<() => void>();
const apply = () => document.documentElement.classList.toggle("is-calm", motion === "calm");
if (typeof document !== "undefined") apply();

export const prefs = {
  get: () => motion,
  setMotion(next: Motion) {
    if (next === motion) return;
    motion = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // the choice just won't persist
    }
    apply();
    listeners.forEach(l => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => void listeners.delete(l);
  },
};
export const isCalm = () => motion === "calm";
export const useMotion = () => useSyncExternalStore(prefs.subscribe, prefs.get, () => "full" as Motion);
```

- [ ] **Step 4:** `StockField`: add `private stillPref = false; setStill(s: boolean) { this.stillPref = s; this.settling = true; this.wake(); }`; in `tick` compute `const still = this.opts.reducedMotion || !!this.opts.poster || this.stillPref;` (also skip pointer parallax when still, already handled by `still`). Set `uIntro` to 1 when still. `FieldStage` subscribes to `prefs` and calls `fieldRef.current?.setStill(isCalm())` after boot and on change.
- [ ] **Step 5:** `Signal.tsx`: the cycle effect returns early when `motion === "calm"` (add `useMotion()` to deps). `Cursor.tsx` and `useMagnetic`: bail out when `isCalm()` and re-run on change (subscribe). `App.tsx`: `useSmoothScroll(!reduced && !posterMode && motion === "full")`.
- [ ] **Step 6:** Header button in `.header-actions`, before the language switch:

```tsx
<button className="icon-toggle motion-toggle" aria-pressed={calm} onClick={() => prefs.setMotion(calm ? "full" : "calm")}>
  {calm ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
  <span className="sr-only">{calm ? c.nav.play : c.nav.pause}</span>
</button>
```

Name logic: when calm the button says "Play motion" and `aria-pressed="true"` (pressed = paused). Also add the toggle to the phone index dialog footer. CSS: `html.is-calm .readout-title i::before, html.is-calm .hero-scroll i, html.is-calm .calibrated i { animation-play-state: paused; }`.
- [ ] **Step 7:** Copy: en `pause: "Pause motion", play: "Play motion"`; hi `"गति रोकें"`, `"गति चलाएँ"`; te `"కదలిక ఆపండి"`, `"కదలిక ప్రారంభించండి"`. Extend `Copy.nav` type.
- [ ] **Step 8:** Run check → PASS for the new line and all earlier ones. `npm run build` passes.
- [ ] **Step 9:** Commit `feat: pause-motion control (WCAG 2.2.2) with a calm mode for the field`.

### Task 2: Context-aware contact

**Files:**
- Create: `src/lib/visit.ts`
- Modify: `src/lib/contact.ts`, `src/chapters/Invitation.tsx`, `src/chapters/Hero.tsx`, `src/chapters/World.tsx`, `src/chapters/Proof.tsx`, `src/chapters/Sandbox.tsx`, `src/copy.ts`, `src/styles/chapters.css`, `scripts/check-site.mjs`

**Interfaces:**
- Produces: `visit.set(key: VisitKey, item: VisitItem | null)`, `visit.remove(key)`, `useVisit(): VisitItem[]`, `type VisitKey = "industry" | "roi" | "sandbox"`, `type VisitItem = { key: VisitKey; label: string; line: string }`; `composeMessage(base: string, items: VisitItem[]): string`; `whatsappLink(message)` unchanged; new `mailLinkFor(body: string)`; hook `useContactLinks(): { wa: string; mail: string }`.

- [ ] **Step 1: Failing check** (reduced-motion desktop group, after the ROI block — ROI is INR small after reload? No: run it right after the ROI USD block, so values are known):

```js
  // Contact carries what the visitor explored, and each item can be removed.
  await page.getByRole("button", { name: /Pharma/ }).click();
  const wa = () => page.locator("#contact a[href^='https://wa.me/']").first().getAttribute("href");
  const chips = page.locator("#contact .context-chips li");
  await chips.first().waitFor();
  const waText = decodeURIComponent(await wa());
  if (!/Pharma/.test(waText) || !/\$1,420,000/.test(waText)) fail("WhatsApp message lacks context: " + waText);
  await page.locator("#contact .context-chips").getByRole("button", { name: /Remove.*Pharma/ }).click();
  if (/Pharma/.test(decodeURIComponent(await wa()))) fail("Removed chip still in the message");
  ok("contact message carries removable context");
```

- [ ] **Step 2:** Run → FAIL (no `.context-chips`).
- [ ] **Step 3: `src/lib/visit.ts`:**

```ts
import { useSyncExternalStore } from "react";

export type VisitKey = "industry" | "roi" | "sandbox";
export interface VisitItem {
  key: VisitKey;
  /** short chip text */
  label: string;
  /** the line added to the message */
  line: string;
}
const ORDER: VisitKey[] = ["industry", "roi", "sandbox"];
let items: VisitItem[] = [];
const removed = new Set<VisitKey>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

/** What the visitor explored on this page. Memory only: gone on reload, never sent anywhere but the links they press. */
export const visit = {
  get: () => items,
  set(key: VisitKey, item: Omit<VisitItem, "key"> | null) {
    const rest = items.filter(i => i.key !== key);
    const next = item && !removed.has(key) ? [...rest, { key, ...item }] : rest;
    next.sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));
    if (JSON.stringify(next) === JSON.stringify(items)) return;
    items = next;
    emit();
  },
  /** the visitor took it out; later changes to the same thing stay out too */
  remove(key: VisitKey) {
    removed.add(key);
    items = items.filter(i => i.key !== key);
    emit();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => void listeners.delete(l);
  },
};
export const useVisit = () => useSyncExternalStore(visit.subscribe, visit.get, visit.get);
export const composeMessage = (base: string, list: VisitItem[]) => (list.length ? `${base}\n\n${list.map(i => `• ${i.line}`).join("\n")}` : base);
```

- [ ] **Step 4:** `contact.ts`: keep `mailLink` export (built from `mailBody`), add `export const mailLinkFor = (body: string) => \`mailto:${EMAIL}?subject=...&body=${encodeURIComponent(body)}\``; add `useContactLinks()` in a new small section of `contact.ts` (imports `useVisit`, `useT`): `wa = whatsappLink(composeMessage(t.cta.waMessage, items))`, `mail = mailLinkFor(composeMessage(MAIL_BODY, items))` where the mail body keeps its template lines and context goes above "Thanks".
- [ ] **Step 5:** Record context:
  - `World.Industries`: effect on `open` → `visit.set("industry", open < 0 ? null : { label: ind.short, line: \`${c.ctxIndustry}: ${ind.name}\` })`.
  - `Proof.ROI`: effect on `[total, currency, size, lang]` with a 400 ms debounce → `visit.set("roi", { label: format(total), line: c.ctxRoi(format(total), c.sizes[size]) })`. Skip the initial mount so an untouched calculator adds nothing.
  - `Sandbox`: effect on `[scenario, quantity]`, skip mount → `visit.set("sandbox", { label: \`${c.scenarios[scenario]} · ${qty}\`, line: c.ctxSandbox(c.scenarios[scenario], qty) })`.
- [ ] **Step 6:** `Invitation`: use `useContactLinks()` for both rows and the footer; render under the rows when items exist:

```tsx
<div className="context fade" aria-live="polite">
  <p className="mono muted">{c.contact.include}</p>
  <ul className="context-chips">
    {items.map(i => (
      <li key={i.key}>
        <span>{i.label}</span>
        <button aria-label={`${c.contact.remove}: ${i.label}`} onClick={() => visit.remove(i.key)}><X size={14} aria-hidden="true" /></button>
      </li>
    ))}
  </ul>
</div>
```

  Hero's WhatsApp button also uses `useContactLinks().wa`.
- [ ] **Step 7:** Copy (×3): `contact.include` ("We'll include what you explored:"), `contact.remove` ("Remove"), `world.ctxIndustry` ("Industry"), `proof`-side ROI line builder `(v, size) => \`ROI estimate on your site: ${v} a year (${size} sample)\``, sandbox line builder `(s, q) => \`Sandbox: ${s}, reorder ${q} units\``. Add to `Copy` type; Hindi/Telugu translations written in the same register as existing copy.
- [ ] **Step 8:** CSS: `.context-chips` flex-wrap list; chips 32 px tall pill, mono 12 px, close button 28 px target.
- [ ] **Step 9:** Check → PASS. Commit `feat: contact messages carry what the visitor explored (removable, memory only)`.

### Task 3: Command palette

**Files:**
- Create: `src/lib/commands.ts`, `src/components/Palette.tsx`
- Modify: `src/App.tsx`, `src/components/Header.tsx`, `src/copy.ts`, `src/styles/shell.css`, `scripts/check-site.mjs`

**Interfaces:**
- Consumes: `prefs` (Task 1), `scrollToId`, `languages`, `EMAIL`, `useContactLinks` (Task 2), `toast` (Task 8 — until then the copy action announces through the palette status line).
- Produces: `type Command = { id: string; group: "chapters" | "tools" | "actions"; label: string; hint?: string; keywords: string; run: () => void }`; `rankCommands(list: Command[], query: string): Command[]`; `openPalette()` event bus in `src/lib/commands.ts` (`palette.open()`, `palette.subscribe`); `<Palette />` default export.

- [ ] **Step 1: Failing check** (desktop reduced-motion group):

```js
  // Command palette: shortcut, search, keyboard run, Escape returns focus.
  await page.keyboard.press("Control+k");
  const box = page.getByRole("combobox", { name: /Jump to/ });
  await box.waitFor();
  await box.fill("roi");
  const first = page.getByRole("option").first();
  if (!/ROI/.test(await first.innerText())) fail("Palette: ROI should rank first for 'roi'");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  if (await box.isVisible()) fail("Palette stayed open after running a command");
  const roiTop = await page.evaluate(() => document.getElementById("roi").getBoundingClientRect().top);
  if (Math.abs(roiTop) > 120) fail("Palette did not jump to ROI: " + roiTop);
  const jump = page.getByRole("button", { name: /Jump to/ }).first();
  await jump.click();
  await box.waitFor();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  if (!(await jump.evaluate(el => el === document.activeElement))) fail("Palette: focus did not return");
  ok("command palette: ⌘K, search, Enter, Escape");
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: `commands.ts`** — `rankCommands`: normalise with `s.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase()`; score 3 for label start, 2 for word start in label or keywords, 1 for substring, drop 0; stable by original order; empty query returns all. `buildCommands(ctx)` takes `{ c, t, lang, setLang, calm, explore?: () => void, links }` and returns chapters (`top`, `signal`, `problems`, `forecast`, `command`, `decide`, `industries`, `integrations`, `roi`, `stories`, `security`, `contact` with their chapter-plate labels), tools (sandbox → `command`, ROI → `roi`, connector search → scroll to `integrations` then focus `input[aria-label="Search connectors"]`, public failures → `stories`), actions (three languages, motion, explore when provided, WhatsApp `window.open(links.wa, "_blank", "noopener")`, email `location.href = links.mail`, copy email). Each has English keywords (`"roi return savings calculator money"` etc.).
- [ ] **Step 4: `Palette.tsx`** — `<dialog className="palette">` opened with `showModal()` on mount, closes via `onClose` prop; input `role="combobox" aria-expanded="true" aria-controls="palette-list" aria-autocomplete="list" aria-activedescendant={id}`; `<ul id="palette-list" role="listbox">` with group headings as `role="presentation"` `<li>` + options `role="option" aria-selected`; ArrowUp/Down/Home/End move `active`, Enter runs then closes, Escape closes (native cancel); clicking an option runs it; status `<p role="status" className="sr-only">{n} results</p>`. Run after close: `requestAnimationFrame(() => cmd.run())` so scroll happens with the page un-inerted.
- [ ] **Step 5: App** — `const Palette = lazy(() => import("./components/Palette"))`; state `paletteOpen`; global keydown: `(e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"` or `e.key === "/"` when `!(e.target as Element).closest("input, textarea, select, [contenteditable]")` → `preventDefault`, open. Remember `document.activeElement` as the return target; on close focus it. Render `<Suspense fallback={null}>{paletteOpen && <Palette ... />}</Suspense>`. Prefetch the chunk on idle (`onIdle(() => import("./components/Palette"))`) so the first ⌘K is instant.
- [ ] **Step 6: Header** — "Jump to" button (Search icon + label on ≥1100 px, `<kbd>⌘K</kbd>`/`Ctrl K` by platform) calling `palette.open()`; in the phone index footer too.
- [ ] **Step 7:** Copy ×3: `palette.label` ("Jump to"), `palette.placeholder` ("Search chapters, tools and actions"), group names, tool/action labels, `palette.results(n)`, `palette.empty`.
- [ ] **Step 8:** CSS: dialog centred at 14vh, width min(640px, 100vw − 32px), ink-2 surface, 1px line, options 44 px tall, active option bone-on-ink with signal left rule; `::backdrop` ink 60 % + `backdrop-filter: blur(6px)`; opening animation (scale .98 → 1, 180 ms) disabled in calm/reduced.
- [ ] **Step 9:** Check → PASS; build; confirm `Palette-*.js` is a separate chunk in build output. Commit `feat: ⌘K command palette for chapters, tools and actions`.

### Task 4: Wayfinding — reading progress, scroll padding, phone dock

**Files:**
- Create: `src/components/Dock.tsx`
- Modify: `src/components/Header.tsx` (StateRail scroll handler), `src/App.tsx`, `src/styles/base.css`, `src/styles/shell.css`, `src/copy.ts`, `scripts/check-site.mjs`

**Interfaces:**
- Consumes: `useContactLinks` (Task 2), `palette.open` (Task 3), `GROUP` / `CHAPTERS` in Header.
- Produces: `<Dock />`; CSS var `--read` (0..1) on `.chapter-nav a[aria-current]`.

- [ ] **Step 1: Failing check** — in the phone loop's `width === 390` branch, before the menu test:

```js
    // Dock: hidden on the hero, shown mid-page, hidden again at Contact.
    const dock = page.locator(".dock");
    if (await dock.isVisible()) fail("Dock visible on the hero");
    await page.evaluate(() => scrollTo(0, document.getElementById("forecast").offsetTop));
    await page.waitForTimeout(400);
    if (!(await dock.isVisible())) fail("Dock hidden mid-page");
    await page.evaluate(() => scrollTo(0, document.getElementById("contact").offsetTop));
    await page.waitForTimeout(400);
    if (await dock.isVisible()) fail("Dock should hide at Contact");
    await page.evaluate(() => scrollTo(0, 0));
```

  and in the desktop group:

```js
  const pad = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop));
  if (!(pad >= 64)) fail("scroll-padding-top should clear the header, got " + pad);
  ok("scroll padding clears the sticky header");
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: Dock** — visible when `#top` is not intersecting and `#contact` is not intersecting (two IntersectionObservers); `aria-hidden` + `inert` when hidden; `<nav aria-label={c.nav.dock}>` with WhatsApp link (`useContactLinks().wa`) and "Jump to" button. Rendered only below 700 px (`useMedia("(max-width: 699px)")`). CSS: fixed bottom, `padding-bottom: env(safe-area-inset-bottom)`, slide via transform; `main { padding-bottom: 72px }` at that width; `.is-hidden` → translateY(110%).
- [ ] **Step 4:** `html { scroll-padding-top: calc(var(--header-h) + 8px); }` in base.css; Lenis anchors already offset −64 (keep).
- [ ] **Step 5: Reading progress** — in `StateRail`'s `measure`, also compute `[start, end]` per nav group from `GROUP` (min top / max bottom of each group's sections); in `update`, for the active group set `--read` on its link element (query `.chapter-nav a[href="#id"]` once on mount), clamp 0..1, write only when changed by > 0.002. CSS: `.chapter-nav a::after { transform: scaleX(var(--read, 0)); transform-origin: left; }` replacing the static active underline.
- [ ] **Step 6:** Check → PASS (also confirms no overflow). Commit `feat: reading progress in the header, scroll padding, phone dock`.

### Task 5: WCAG audit in the check, and fixes

**Files:**
- Modify: `package.json` (devDependency `@axe-core/playwright`), `scripts/check-site.mjs`, whichever components/CSS the audit flags.

**Interfaces:** none new.

- [ ] **Step 1:** `npm install -D @axe-core/playwright@4.10.2`.
- [ ] **Step 2: Failing-first check** — new group before the phone loop:

```js
// ---------- WCAG 2.2 A/AA audit (axe) ----------
{
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  for (const [lang, width] of [["en", 1440], ["hi", 1440], ["te", 1440], ["en", 390]]) {
    const { context, page } = await open({ viewport: { width, height: 900 }, isMobile: width < 700, hasTouch: width < 700 });
    await page.evaluate(l => localStorage.setItem("sanket-lang", l), lang);
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const bad = violations.filter(v => v.impact === "serious" || v.impact === "critical");
    for (const v of violations.filter(v => !bad.includes(v))) console.log(`axe ${lang}@${width} ${v.impact}: ${v.id} (${v.nodes.length})`);
    if (bad.length) fail(`axe ${lang}@${width}: ` + bad.map(v => `${v.id} ×${v.nodes.length} → ${v.nodes[0].target.join(" ")}`).join("; "));
    await context.close();
  }
  ok("axe: no serious or critical WCAG 2.2 A/AA violations (en/hi/te desktop, en phone)");
}
```

- [ ] **Step 3:** Run; record every violation. Fix each at its source (likely: contrast of `.muted`/mono labels over the field and bone surfaces, rail items with `onClick` on a `div` → make them `aria-hidden` buttons-free (rail stays `aria-hidden`, so remove its click focus issue) or real buttons; `aria-hidden` stage containing focusable nothing; region landmarks; any `select` without name). Target size: chips, close buttons, rail dots ≥ 24 px.
- [ ] **Step 4:** Re-run until PASS. Commit `test: axe WCAG 2.2 audit in the regression check; accessibility fixes`.

---

## Phase 2 — Motion system

### Task 6: Mechanical numbers (Odometer)

**Files:**
- Create: `src/components/Odometer.tsx`
- Modify: `src/chapters/Proof.tsx` (total, rows, story stats), `src/chapters/Sandbox.tsx` (expected, quantity), `src/chapters/Decide.tsx` (result figure), `src/styles/base.css`, `src/styles/tokens.css`, `scripts/check-site.mjs`

**Interfaces:**
- Produces: `<Odometer value: string; variant?: "roll" | "board"; from?: "zero" | "previous"; className?: string />`. The element's `innerText` is exactly `value` (visual glyphs are CSS-generated), so existing checks keep reading numbers with `innerText()`.

- [ ] **Step 1: Failing check** (desktop group, beside ROI):

```js
  if (!(await page.getByTestId("roi-total").locator(".odo-face").count())) fail("ROI total should be mechanical");
  if ((await page.locator(".decision-qty .odo").count()) !== 1) fail("Reorder quantity should be mechanical");
  ok("mechanical numbers keep exact text");
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: Odometer:**

```tsx
import { useEffect, useRef, useState } from "react";
import { isCalm } from "../lib/prefs";
import { prefersReducedMotion } from "../lib/motion";

/** Digits roll on strips like a mechanical counter. The glyphs are CSS-generated, so the element's
 *  text (copy, innerText, screen readers via .odo-text) is exactly `value`. */
export function Odometer({ value, variant = "roll", from = "previous", className = "" }: { value: string; variant?: "roll" | "board"; from?: "zero" | "previous"; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [armed, setArmed] = useState(from !== "zero");
  // "zero": start at 0 and roll up once the number is first on screen.
  useEffect(() => {
    if (armed || !ref.current) return;
    if (isCalm() || prefersReducedMotion()) return setArmed(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setArmed(true), io.disconnect()), { threshold: 0.6 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [armed]);
  const chars = [...value];
  const digitsFromRight = (n: number) => chars.slice(n + 1).filter(ch => /\d/.test(ch)).length;
  return (
    <span ref={ref} className={`odo odo-${variant} ${className}`}>
      <span className="odo-text">{value}</span>
      <span className="odo-face" aria-hidden="true">
        {chars.map((ch, n) =>
          /\d/.test(ch) ? (
            <span key={`d${digitsFromRight(n)}`} className="odo-d" style={{ ["--v" as string]: armed ? +ch : 0, ["--k" as string]: digitsFromRight(n) }} />
          ) : (
            <span key={`c${n}-${ch}`} className="odo-c" data-c={ch} />
          ),
        )}
      </span>
    </span>
  );
}
```

  CSS (`base.css`): `.odo { position: relative; display: inline-flex; }`, `.odo-text` visually hidden but rendered (sr-only pattern), `.odo-face { display: inline-flex; }`, `.odo-c::before { content: attr(data-c); }`, `.odo-d { display: inline-block; height: 1em; line-height: 1; overflow: hidden; width: 0.62em (tabular) }`, `.odo-d::before { content: "0\A 1\A 2\A 3\A 4\A 5\A 6\A 7\A 8\A 9"; white-space: pre; display: block; transform: translateY(calc(var(--v) * -1em)); transition: transform var(--t-roll) var(--ease-spring) calc(var(--k) * 28ms); }`; `font-variant-numeric: tabular-nums` on `.odo`; calm/reduced: `transition: none`. `board` variant: each `.odo-d`/`.odo-c` in a dark cell, `border-radius: 4px`, hinge `linear-gradient` line at 50 %, 2 px gap.
- [ ] **Step 4:** Apply: ROI total `<p className="roi-total display" data-testid="roi-total"><Odometer value={format(total)} /></p>` (drop the `key={pulse}` remount + pulse state); rows `<strong>+<Odometer value={format(n)} /></strong>`; sandbox expected `<Odometer value={last.median.toLocaleString("en-US")} />`, quantity `<strong><Odometer value={quantity.toLocaleString("en-US")} variant="board" /></strong>`; Decide result figure (split `v.result` on the first number: `/(\d[\d,.]*)/`) → number part as board Odometer; story stats `<Odometer value={text.stat} from="zero" />`.
- [ ] **Step 5:** Check → PASS (ROI/sandbox values still exact). Commit `feat: mechanical rolling numbers for ROI, sandbox, Decide and story figures`.

### Task 7: Skeuomorphic controls

**Files:**
- Create: `src/lib/detents.ts`
- Modify: `src/chapters/Proof.tsx`, `src/chapters/Sandbox.tsx`, `src/chapters/Proof.tsx` Stories seg, `src/components/Header.tsx` LangSwitch, `src/styles/instruments.css`, `src/styles/base.css`, `src/styles/tokens.css`, `scripts/check-site.mjs`

**Interfaces:**
- Produces: `snapToDetent(value: number, detents: number[], span: number, tolerance = 0.015): { value: number; snapped: boolean }`; `useSegPuck<T extends HTMLElement>(dep: unknown): RefObject<T>` (writes `--x`, `--w` from the `[aria-pressed="true"]` child); `tick()` (vibrate 6 ms when full motion and `navigator.vibrate` exists).

- [ ] **Step 1: Failing check:**

```js
  // Detents: a revenue slider value close to the preset snaps to it.
  await page.getByRole("button", { name: "₹ INR", exact: true }).click();
  await page.getByRole("button", { name: "Small business", exact: true }).click();
  const rev = page.getByRole("slider", { name: "Annual revenue slider" });
  await rev.fill(String(5e7 + 0.01 * (2.5e8 - 5e6)));
  if ((await page.getByTestId("roi-total").innerText()) !== "₹5,60,000") fail("Revenue slider should snap to the preset");
  if (!(await page.locator(".roi-controls .seg").first().evaluate(el => getComputedStyle(el).getPropertyValue("--w").trim()))) fail("Segment puck not positioned");
  ok("slider detents and segment puck");
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** `detents.ts` as specified; `useSegPuck` uses a `ResizeObserver` on the group + effect on `dep`, measuring `button[aria-pressed="true"]` `offsetLeft`/`offsetWidth`.
- [ ] **Step 4:** ROI sliders: `onChange={e => { const r = snapToDetent(+e.target.value, s.detents, s.max - s.min); if (r.snapped && r.value !== s.value) tick(); s.set(r.value); }}` with detents: money sliders `[p.revenue]` / `[p.inventory]`, holding `[25]`, margin `[30]`, stockouts `[5]`. Sandbox adjust detent `[0]`. Each range gets `data-ticks` → CSS tick marks via `--ticks` repeating gradient.
- [ ] **Step 5:** CSS: `.seg { position: relative; isolation: isolate; } .seg::before { content: ""; position: absolute; inset-block: 3px; left: 0; width: var(--w, 0); transform: translateX(var(--x, 0)); background: <pressed bg>; border-radius: inherit; transition: transform 420ms var(--ease-spring), width 420ms var(--ease-spring); z-index: -1; }` and pressed buttons lose their own background. Range: track 6 px with inset shadow + tick gradient; thumb 22 px with `radial-gradient` face, two grip lines, `box-shadow: 0 1px 0 #fff3 inset, 0 2px 6px #0006`; `:active` thumb scale .94. Buttons: `.btn:active { transform: translateY(1px) scale(.985); box-shadow: inset 0 2px 4px #0005; }`. `--ease-spring: linear(0, 0.009, 0.035 2.1%, 0.141, 0.281 6.7%, 0.723 12.9%, 0.938 16.7%, 1.017, 1.077, 1.121, 1.149 24.3%, 1.159, 1.163, 1.161, 1.154 29.9%, 1.129 32.8%, 1.051 39.6%, 1.017 43.1%, 0.991, 0.977 51%, 0.974 53.8%, 0.975 57.1%, 0.997 69.8%, 1.003 76.9%, 1.004 83.8%, 1)` with `@supports not (transition-timing-function: linear(0, 1))` fallback to `--ease-settle`.
- [ ] **Step 6:** Check → PASS. Commit `feat: skeuomorphic sliders with detents, sliding segment pucks, pressable buttons`.

### Task 8: Kinetic type and micro-interactions

**Files:**
- Create: `src/components/Toast.tsx`
- Modify: `src/components/Words.tsx`, `src/chapters/Invitation.tsx`, `src/chapters/Problems.tsx`, `src/App.tsx`, `src/styles/base.css`, `src/styles/story.css`, `src/styles/chapters.css`, `src/styles/instruments.css`, `scripts/check-site.mjs`

**Interfaces:**
- Produces: `toast(message: string)`, `<Toaster />` (one `role="status"` region); `<LevelLine text lang />` in `Invitation.tsx`.

- [ ] **Step 1: Failing check** (desktop group):

```js
  await page.getByRole("button", { name: /Copy email address|Copy/ }).first().click();
  await page.locator(".toast").waitFor();
  ok("copy shows a toast");
```

  and in the motion-on group, after the Decide check:

```js
  // The contact title levels as the chapter arrives.
  await page.evaluate(() => {
    const y = document.getElementById("contact").offsetTop;
    window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
  });
  await page.waitForTimeout(900);
  const spread = await page.locator(".level-line .lc").evaluateAll(els => Math.max(...els.map(e => Math.abs(new DOMMatrix(getComputedStyle(e).transform).m42))));
  if (spread > 1.5) fail("Contact title did not level: " + spread);
  ok("contact title levels on arrival");
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: Toast** — module store with one message + timeout 2600 ms; `<Toaster/>` renders `<div className="toaster" role="status" aria-live="polite">{msg && <p className="toast">{msg}</p>}</div>` in App. Invitation's copy handler calls `toast(...)` and keeps its icon morph; remove its separate sr-only status.
- [ ] **Step 4: Carton heading** — in `story.css`/`base.css` replace the word rise with: `.words .word > span { transform: translateY(-105%); } .is-in .words .word > span { animation: carton 760ms var(--ease-drop) calc(var(--i) * 55ms) both; }` and `@keyframes carton { 0% { transform: translateY(-105%) } 62% { transform: translateY(4%) scaleY(.93) } 78% { transform: translateY(-1%) scaleY(1.02) } 100% { transform: none } }` with `transform-origin: 50% 100%`; reduced motion: none. Keep the existing `.is-in` trigger.
- [ ] **Step 5: LevelLine** — Invitation title's first line: for `lang === "en"` split characters (same markup idea as Hero `Chars`, class `lc`), for hi/te split words; seeded offsets `off_i = (hash(i) * 2 - 1) * 0.35em`; a ScrollTrigger on `#contact` (`start: "top bottom", end: "top 25%", scrub: true`) writes `--lv` (1 → 0) on the line; CSS `transform: translateY(calc(var(--off) * var(--lv, 0)))`. Calm/reduced: no trigger, `--lv: 0`. `RevealHeading` gains an optional `renderLine?: (line, n) => ReactNode` so Invitation can supply LevelLine for line 0 while keeping one `h2`.
- [ ] **Step 6: Micro-interactions** — `details` animation: `details::details-content { block-size: 0; overflow: clip; transition: block-size 360ms var(--ease-move), content-visibility 360ms allow-discrete; } details[open]::details-content { block-size: auto; } :root { interpolate-size: allow-keywords; }`; problem tabs indicator: tablist gets `useSegPuck`-style `--x/--w` from `[aria-selected=true]` and an `::after` bar that glides; focus rings `:focus-visible { outline-offset: 4px; transition: outline-offset 180ms var(--ease-settle); }` from 8px start via `@starting-style`; `.contact-arrow`, `.btn-icon` nudge 3 px on hover.
- [ ] **Step 7:** Check → PASS. Commit `feat: carton-drop headings, levelling contact title, toast and micro-interactions`.

---

## Phase 3 — Projection and spatial

### Task 9: Projection-mapped field

**Files:**
- Create: `src/field/projection.ts`
- Modify: `src/field/shaders.ts`, `src/field/StockField.ts`, `src/field/FieldStage.tsx`, `src/field/store.ts` (slide mirror), `src/copy.ts` (`stage.inStock` = rail[4] is reused; no new strings), `scripts/check-site.mjs`

**Interfaces:**
- Consumes: `FieldModel` (`pos`, `decision`, `travellers`, `signalOrigins`, `foci`, `width`, `depth`), `Shot`.
- Produces: `type Slide = "instock-faint" | "signals" | "reticle" | "off" | "decide" | "instock"`; `slideFor(shot: Shot): Slide`; `drawSlide(ctx: CanvasRenderingContext2D, slide: Slide, m: FieldModel, toUv: (x: number, z: number) => [number, number], copy: ProjectionCopy, focus: number): void`; `type ProjectionCopy = { inStock: string; signals: string[] }`; `StockField.setProjectionCopy(copy: ProjectionCopy)`; stage `data-slide` attribute.

- [ ] **Step 1: Failing check** (motion-on group, WebGL via SwiftShader):

```js
  const slideAt = async id => {
    await page.evaluate(i => {
      const y = document.getElementById(i).offsetTop + 40;
      window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
    }, id);
    await page.waitForTimeout(1600);
    return page.locator(".stage").getAttribute("data-slide");
  };
  const slides = [await slideAt("signal"), await slideAt("decide"), await slideAt("contact")];
  if (slides.join("|") !== "signals|decide|instock") fail("Projector slides: " + slides.join("|"));
  await page.screenshot({ path: "qa/spatial/projection-level.png" });
  ok("projector slides follow the story");
```

- [ ] **Step 2:** Run → FAIL (`null|null|null`).
- [ ] **Step 3: Shaders** — add to `common`: `uniform mat4 uProjMat; uniform float uProjAmt;` and a fragment chunk:

```glsl
uniform sampler2D uProjTex;
uniform vec3 uProjColor;
float projected(vec3 world, vec3 n) {
  vec4 pc = uProjMat * vec4(world, 1.0);
  vec2 uv = pc.xy / pc.w * 0.5 + 0.5;
  if (uProjAmt <= 0.001 || uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return 0.0;
  float face = mix(0.35, 1.0, step(0.5, n.y));
  return texture2D(uProjTex, uv).r * face * uProjAmt;
}
```

  Column vertex: `varying vec3 vWorld; vWorld = (modelMatrix * vec4(pos, 1.0)).xyz;`. Column fragment, before fog: `col += uProjColor * projected(vWorld, n) * 0.9;`. Floor shader gets the same (`n = vec3(0,1,0)`), so marks in pits land lower and visibly split from tower tops.
- [ ] **Step 4: projection.ts** — `slideFor`: hero→`instock-faint`, signal→`signals`, problems→`reticle`, forecast→`off`, decide→`decide`, level→`instock`. Canvas drawing in projector UV space using `toUv(x, z)`: big `inStock` text centred (font `800 ${h * 0.22}px Archivo` with `ctx.fontStretch = "expanded"` when supported; Indic uses `Tiro Devanagari Hindi`/`Tiro Telugu`), letter-spaced; signals: each name near `signalOrigins[i]` rotated toward centre; reticle: ring + crosshair at `foci[focus]`; decide: for every cell with decision 1 (order) a `+`, 2 (transfer) chevrons along `travellers` from→to, 3 (markdown) `−30%`; white on black.
- [ ] **Step 5: StockField** — projector `PerspectiveCamera(28, w/d, 1, 200)` at `(0, 70·s, 0.01)` looking at origin; `uProjMat = projector.projectionMatrix × projector.matrixWorldInverse`; `toUv` projects `(x, 0, z)`; `CanvasTexture` (2048×1024, or 1024×1024 when `cols < 30`), `minFilter = LinearMipmapLinearFilter`, anisotropy 4. In `update`: target slide from `t.shot`; if `current !== target`, ease `projAmt` to 0, then redraw + `needsUpdate`, set current, ease up to the slide's strength (`instock-faint` .35, others 1; `decide` multiplied in-shader by nothing — the decide slide fades with `uDecide > 0.02`). Mirror `current` to the stage via a `onSlide?: (s: Slide) => void` option (FieldStage writes `data-slide`). Count projection easing as `moving` so render-on-demand continues while it fades. Redraw on `setProjectionCopy` and once `document.fonts.ready` resolves.
- [ ] **Step 6: FieldStage** passes `{ inStock: copy.rail[4], signals: copy.signals }` — extend `StageCopy` with `inStock` and full `signalNames` (copy.signal.signals) via App.
- [ ] **Step 7:** Check → PASS; inspect `qa/spatial/projection-level.png` and a hero screenshot (fractured faint text) in the browser at 1440 and 390. Run `npm run poster:render` so the fallback poster includes the faint projection. Commit `feat: projection-mapped field — the plan is projected onto the stock and reads once level`.

### Task 10: Window camera, depth labels, panel sheen, tilt

**Files:**
- Modify: `src/field/StockField.ts`, `src/field/FieldStage.tsx`, `src/lib/motion.ts` (`useSheen`), `src/chapters/Problems.tsx`, `src/chapters/Sandbox.tsx` wrapper (`.instrument-panel`), `src/chapters/Decide.tsx` (`.decision` card), `src/styles/shell.css`, `src/styles/instruments.css`, `scripts/check-site.mjs`

**Interfaces:**
- Produces: `StockField.setTilt(x: number, y: number)` (−1..1, same channel as pointer); `enableTilt(): Promise<boolean>` in `FieldStage.tsx` exported via `src/field/tilt.ts`; `useSheen<T extends HTMLElement>(): RefObject<T>`.

- [ ] **Step 1: Failing check** (motion-on group): hover `.problem-panel` and assert `--mx` is set:

```js
  await page.evaluate(() => scrollTo(0, document.getElementById("problems").offsetTop));
  await page.waitForTimeout(500);
  await page.locator(".problem-panel").hover({ position: { x: 40, y: 40 } });
  const mx = await page.locator(".problem-panel").evaluate(el => el.style.getPropertyValue("--mx"));
  if (!mx) fail("Panel sheen not tracking the pointer");
  ok("panel sheen follows the pointer");
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: Off-axis camera** — replace the translate+lookAt parallax with: `cam.position.copy(camPos); cam.lookAt(camLook); cam.translateX(px * 1.6); cam.translateY(py * 0.9);` then pin the look point: project `camLook` with the shifted camera (no offset) to NDC `(lx, ly)`, and `cam.setViewOffset(w, h, lx * w / 2, -ly * h / 2, w, h)` so the look point returns to the screen centre while nearer/taller columns swing more (parallax about the focal plane). `clearViewOffset()` when still. Anchors use the same camera, so labels stay glued.
- [ ] **Step 4: Depth labels** — anchor transform adds `scale(${clamp(0.75, 1.25, 30 / distance)})`, still skipping identical writes.
- [ ] **Step 5: Tilt** — `src/field/tilt.ts`: `enableTilt()` requests `DeviceOrientationEvent.requestPermission()` when present, then listens to `deviceorientation`, maps `gamma/30`, `(beta − 45)/30` clamped to −1..1, smoothed, to `field.setTilt`; disabled while calm. FieldStage exposes `tiltSupported` (`"DeviceOrientationEvent" in window && coarse`).
- [ ] **Step 6: Sheen** — `useSheen`: fine pointer + full motion only; on `pointermove` set `--mx/--my` (percent) and `--rx/--ry` (±2deg) on the element via rAF; reset on leave. CSS: `.sheen { transform: perspective(900px) rotateX(var(--rx,0)) rotateY(var(--ry,0)); transition: transform 420ms var(--ease-settle); } .sheen::after { background: radial-gradient(420px circle at var(--mx,50%) var(--my,0%), rgb(255 255 255 / .07), transparent 60%); pointer-events: none; }`. Apply to `.problem-panel`, `.instrument-panel`, `.decide` result card, `.roi-result`.
- [ ] **Step 7:** Check → PASS; browser check that pointer motion makes towers parallax against the floor and labels stay glued. Commit `feat: off-axis window camera, depth-scaled labels, panel sheen, tilt to look`.

---

## Phase 4 — Navigable warehouse and placement

### Task 11: Explore mode

**Files:**
- Create: `src/explore/Explore.tsx`, `src/field/explore.ts` (camera controller wiring inside the field chunk), `src/field/bridge.ts`
- Modify: `src/field/StockField.ts`, `src/field/FieldStage.tsx`, `src/App.tsx`, `src/chapters/Hero.tsx`, `src/lib/commands.ts`, `src/copy.ts`, `src/styles/shell.css`, `scripts/check-site.mjs`

**Interfaces:**
- Consumes: `fieldStore`, `readCell`, `Readout`, Palette `explore` action (Task 3).
- Produces: `fieldBridge` (module singleton set by FieldStage): `{ field: StockField | null; ready: boolean; subscribe(fn) }`; `StockField.setExplore(on: boolean, el?: HTMLElement): void`, `StockField.exploreTimeline(v: number): void` (0..1), `StockField.nextStockout(): Readout | null`, `StockField.signalAtSelection(): void`, `StockField.exploreKey(e: KeyboardEvent): boolean`; `explore.open()` bus in `src/explore/bus.ts`.

- [ ] **Step 1: Failing check** (motion-on group, WebGL available under SwiftShader):

```js
  await page.evaluate(() => scrollTo(0, 0));
  const exploreBtn = page.getByRole("button", { name: /Explore the warehouse/ });
  await exploreBtn.click();
  const dlg = page.getByRole("dialog", { name: /warehouse/i });
  await dlg.waitFor();
  const view = dlg.getByRole("application");
  await view.focus();
  await page.keyboard.press("n");
  await dlg.locator(".explore-readout", { hasText: /SKU-\d+/ }).waitFor();
  await dlg.getByRole("slider", { name: /Timeline/ }).fill("1");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  if (await dlg.isVisible()) fail("Escape did not close explore mode");
  if (!(await exploreBtn.evaluate(el => el === document.activeElement))) fail("Focus did not return from explore mode");
  ok("explore mode: open, keyboard inspect, timeline, Escape");
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: StockField explore** — `setExplore(true, el)`: dynamically `import("three/addons/controls/OrbitControls.js")` (in the field chunk), create controls on `el` with `enableDamping`, `minDistance`, `maxDistance`, `maxPolarAngle = 1.45`, target = current look; story camera updates are bypassed while exploring (`update` uses `controls.update()` and keeps `moving` true while damping); visibility forced true; pointer picking uses the dialog element. `setExplore(false)` disposes controls and eases back to the story shot. `exploreTimeline(v)`: `decide = clamp(v/0.8)`, `level = smoothstep(0.85, 1, v)`, `forecast = v > 0.12 ? 1 : 0`, `signal = v < 0.3 ? 1 : 0.2` written to private overrides (not the shared store, so the story resumes unchanged). `nextStockout()`: iterate cells from the last index with `readCell(...).status === "short"`, select it, move controls target there, return the readout. `exploreKey(e)`: arrows orbit by 0.08 rad (rotate the camera around target via spherical), `+`/`-` dolly, W/A/S/D pan target by 1.2 units in camera-relative ground directions, Enter → signal at selection. Returns true when handled.
- [ ] **Step 4: Explore.tsx** — modal `<dialog aria-labelledby>` with `className="explore"` (transparent background so the fixed stage shows through; `::backdrop` transparent); layout: top bar (title "Explore the warehouse", Close), the `role="application" tabIndex={0} aria-roledescription="3D stock field" aria-describedby="explore-help"` viewport filling the dialog (receives pointer events → OrbitControls), bottom panel: timeline `<input type="range" aria-label="Timeline: Unbalanced to In stock">` with five labelled stops, readout `<div className="explore-readout" aria-live="polite">`, buttons Send a signal, Next stockout (N), Tilt to look (if supported), placement buttons slot (Task 12), help text listing keys. On mount: `fieldBridge.field.setExplore(true, viewportEl)`; on unmount `setExplore(false)`.
- [ ] **Step 5: Entry points** — Hero gets a third, quieter control "Explore the warehouse" (`btn btn-text`, hidden when stage is poster via `fieldBridge.ready`); palette action; App renders lazy `<Explore/>` when `explore` state is open, returning focus to the opener.
- [ ] **Step 6:** Copy ×3: `explore.open`, `explore.title`, `explore.close`, `explore.timeline`, `explore.stops` (reuse `rail`), `explore.next`, `explore.signal`, `explore.tilt`, `explore.help`, `explore.ar`, `explore.vr`, `explore.quicklook`.
- [ ] **Step 7:** Check → PASS; build shows `Explore-*.js` lazy and OrbitControls inside the field chunk. Commit `feat: explore mode — a navigable 3D warehouse with keyboard inspection and a timeline`.

### Task 12: Place it on your desk (WebXR + Quick Look)

**Files:**
- Create: `src/explore/xr.ts`, `scripts/render-field-usdz.mjs`, `src/field/usdz.ts` (exporter entry used by the script through `?usdz`)
- Modify: `src/field/StockField.ts` (root group, XR loop hand-over), `src/explore/Explore.tsx`, `src/field/FieldStage.tsx` (`?usdz` mode), `package.json` (`usdz:render`), `public/assets/stock-field.usdz` (generated), `scripts/check-site.mjs`

**Interfaces:**
- Produces: `xrSupport(): Promise<{ ar: boolean; vr: boolean; quickLook: boolean }>`; `startXR(field: StockField, mode: "ar" | "vr", overlay: HTMLElement | null): Promise<void>`; `StockField.xrBegin(mode, session)`, `StockField.xrEnd()`; `exportUsdz(model: FieldModel): Promise<Uint8Array>`.

- [ ] **Step 1: Failing check** (motion-on group, inside explore before Escape):

```js
  // No XR in headless Chromium and no Quick Look: placement buttons must not appear.
  if (await dlg.getByRole("button", { name: /Place on your desk|View in space/ }).count()) fail("XR buttons shown without support");
  if (await dlg.locator('a[rel="ar"]').count()) fail("Quick Look link shown outside Safari");
  ok("placement buttons only with support");
```

  and file validity at the top level:

```js
const usdz = fs.readFileSync("public/assets/stock-field.usdz");
if (usdz.subarray(0, 2).toString() !== "PK" || !usdz.includes(Buffer.from(".usda"))) fail("stock-field.usdz is not a USDZ package");
ok(`stock-field.usdz (${(usdz.length / 1024).toFixed(0)} kB)`);
```

- [ ] **Step 2:** Run → FAIL (file missing).
- [ ] **Step 3: USDZ** — `src/field/usdz.ts`: build `createField(36, 22)`; for each cell a box at its unbalanced height (`stock0`), grouped by status colour (short → signal `#ff5a1f`, over → `#5b5d55`, ok → `#bdb9b0`, new → `#9fd8c9`) into four merged `BoxGeometry` meshes (`BufferGeometryUtils.mergeGeometries`) with `MeshStandardMaterial({ color, roughness: .8 })`, plus a thin `#141613` base slab; scale so width = 0.45 m; `new USDZExporter().parseAsync(scene)`. FieldStage: when `?usdz` is in the URL, import it, expose `window.__usdz = Array.from(bytes)` and set `data-usdz="ready"`. `scripts/render-field-usdz.mjs`: start from `SANKET_TEST_URL`, open `?usdz`, wait for the attribute, write `public/assets/stock-field.usdz`. Add `"usdz:render": "node scripts/render-field-usdz.mjs"`. Run it.
- [ ] **Step 4: xr.ts** — `xrSupport()`: `navigator.xr?.isSessionSupported("immersive-ar")`, `("immersive-vr")`, and `quickLook = document.createElement("a").relList.supports("ar")`. `startXR`: AR → `navigator.xr.requestSession("immersive-ar", { requiredFeatures: ["hit-test", "local"], optionalFeatures: ["dom-overlay"], domOverlay: { root: overlay } })`; VR → `("immersive-vr", { optionalFeatures: ["local-floor"] })`; then `field.xrBegin(mode, session)`; `session.addEventListener("end", () => field.xrEnd())`.
- [ ] **Step 5: StockField XR** — move all meshes into `this.root = new THREE.Group()` (scene → root). `xrBegin`: cancel own rAF, `renderer.xr.enabled = true`, `setReferenceSpaceType(mode === "ar" ? "local" : "local-floor")`, `await renderer.xr.setSession(session)`, clear alpha 0 in AR, hide floor mesh, `root.scale.setScalar(target / m.width)` (AR .40 m, VR 1.0 m); AR: request `viewer` space hit-test source, show a ring reticle mesh on hits, `select` places root at the reticle pose; VR: root at `(0, 0.8, -0.8)`, timeline auto-plays (`exploreTimeline` on a 14 s loop) unless calm; `select` → wave at root centre. `renderer.setAnimationLoop((t, frame) => { reticle; update(dt, false); render })`. `xrEnd`: `setAnimationLoop(null)`, `renderer.xr.enabled = false`, restore scale/position/floor/clear alpha, `wake()`.
- [ ] **Step 6: Explore buttons** — on mount `xrSupport()`; render "Place on your desk" (ar), "View in space" (vr), and for quickLook `<a rel="ar" href="/assets/stock-field.usdz" className="btn"><img src="/assets/stock-field.jpg" alt="" width="1" height="1" />{c.explore.quicklook}</a>` (Quick Look needs an `img` child). The DOM overlay root is a small panel with the timeline and an Exit button (`session.end()`).
- [ ] **Step 7:** Check → PASS. Note in README that real placement needs a device test. Commit `feat: place the field on your desk — WebXR AR/VR and iOS Quick Look`.

---

## Final

### Task 13: Verification, performance A/B, documentation

**Files:** `README.md`, `docs/superpowers/specs/2026-10-23-sanket-spatial-motion-design.md` (implementation record), `qa/spatial/*`, `qa/perf/*`

- [ ] **Step 1:** `npm run build`; confirm budgets from the output (initial JS ≤ 150 kB gzip, CSS ≤ 14 kB gzip, lazy chunks named).
- [ ] **Step 2:** `npm run check` against the dev server and against `npm run preview`; both PASS.
- [ ] **Step 3:** Perf A/B: build `95c153f` into the scratchpad (`git worktree add <scratch>/base 95c153f && npm ci && npx vite build --outDir <scratch>/dist-before`), serve both, `node scripts/perf.mjs --urls=before=http://localhost:4175,after=http://localhost:4173 --profiles=desktop,mobile --cpu=1,4 --runs=3 --out=qa/perf/spatial-ab.json`; compare medians against the budgets.
- [ ] **Step 4:** Browser review at 1440 / 768 / 390 in en/hi/te, full / calm / reduced motion; screenshots into `qa/spatial/`.
- [ ] **Step 5:** README: features, scripts (`usdz:render`), validation numbers, "not verified here" list. Spec: implementation record of decisions made during the build.
- [ ] **Step 6:** Commit `docs: record the projection, motion and spatial pass`.
