# SANKET warehouse story — x-ray hero and self-explaining scene

Date: 25 October 2026 · Status: approved by the owner ("build both")

Follows the motion and craft pass (`2026-10-25-sanket-motion-upgrade-design.md`). The story, card copy, chapters and model stay as they are.

## Why

After the motion pass, the hero was still a centred stack of copy over a model that could only be looked at, and the 3D explanation was a slideshow: a card covering the bottom third did the explaining while the model changed camera. The claims at the core of the story ("demand rises", "stock runs out before the delivery", "the gap") existed only as sentences, and the illustrative figures were tucked into the card's side column.

## Hero: look inside

- **X-ray lens.** A circular iris cuts through the warehouse shell (roof, facade, end wall) wherever the mouse is over the roof, with a glowing orange rim. Under it, a chip names the rack: A1 steady, A2 selling fast (~9 days), A3 spare stock, A4 selling slowly (~120 days).
- **Demo.** After the lights come on, the lens visits A2, A3 and A4 by itself: once on desktop (until the mouse takes over), looping on touch screens. Off for reduced motion and calm mode.
- **Demand signals.** Orange comets of light flow from the streets into the roof once the site is lit.
- **Less copy.** The audience line moves into the typed eyebrow; the scroll hint becomes "Scroll to explore", plus "Point at the roof to look inside" on mouse devices.

## 3D explanation: the model explains itself

- **Rack tags.** When the roof lifts, A1–A4 get status tags in the scene.
- **Data panels.** One panel per problem/solution beat, anchored to its rack with a leader line and scrubbed by scroll (`--t`, 0–1 through the beat):
  - gap (A2): a timeline where stock lasts ~9 days and the next delivery comes on day 14; the 5-day gap opens in red.
  - out (A2): an empty gauge, a demand counter rolling up, and an OUT OF STOCK stamp.
  - slow (A4): a full gauge beside a trickle of sales, at ~120 days of stock.
  - forecast (A2): the 4-week line draws itself, then the likely range fills in; 1,200 units.
  - order (A2): 1,200 + 200 − 400 − 200 = 800, each line landing in turn.
  - transfer (A3): 360 units travel from the hub to West; a ghost pallet rides the transfer arc in 3D.
  - markdown (A4): a swing tag whose −12% flips like a departures board.
- **Connect beat.** Three mint streams (sales, stock on hand, supplier lead times) converge on A2, each with a source chip. They replace the single dashed line.
- **Lighter cards.** Above 1000 px wide in WebGL mode, the card's figures column is visually hidden (kept for screen readers) because the panels carry the figures.

## Implementation

- `streams.ts` — comet points along arc-length tables: one draw call per set, additive, picked up by the bloom pass.
- `annotate.ts` — projects rack chips, source chips, the x-ray tag and the panels; measures each element once per showing.
- `ScenePanels.tsx` + `sceneCopy.ts` — markup and EN/HI/TE copy. Elements start `hidden`; the engine reveals them.
- `scene.css` — imported by the lazy engine chunk, so it costs nothing on first paint and never applies to the no-WebGL page.
- Engine — shell materials are cloned and patched with a screen-space lens discard and rim; lamp clones stay on their lighting circuits. SSAO rests while the lens is open, because the cut-away shell would skew its depth.

## Constraints kept

Reading holds stay still unless the visitor scrolls. The only exception is the connect beat's streams, which run at the 30 fps ambient cadence. Reduced motion shows every panel in its final state (t = 1). The timeline module is unchanged, so `check-campus` invariants hold.
