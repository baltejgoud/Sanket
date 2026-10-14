# SANKET motion opportunities

Status: proposal, not implemented. Based on current App.tsx, styles, existing hero-loop and Brag plan, plus desktop design review.

## Scroll motion
- How it works: progressively connect the three cards as they enter view: data connects, forecast draws, order appears. Keep existing card stagger; add explanatory motion rather than another entrance.
- Interactive sandbox: draw the illustrative forecast once on entry, then leave it available for interaction. User scenario changes take priority over entrance animation.
- Industries: crossfade the selected workspace with a short directional transition and an animated shared tab indicator. Avoid remounting or resetting controls unnecessarily.
- Optimization: connect the selected engine to its recommendation with one short directional pulse; update the recommendation in place.
- Security: a single restrained reveal of workspace boundaries and access checks. No continuous security scanning effects.

## Micro animations
- Problem and industry tabs: shared selection indicator, 180–240 ms; keyboard focus remains immediate.
- Forecast scenarios: interpolate chart changes, around 300 ms; maintain readable axes and labels.
- ROI: short numeric interpolation on committed changes, roughly 200 ms; avoid rolling digits on every drag event. Keep input feedback immediate.
- Connector search/filter: brief result crossfade, preserve focus, show clear empty state.
- Copy email: icon becomes a check with an announced success message.
- Navigation: move active underline, 180 ms. Buttons: short press feedback, no extra magnetic movement beyond existing behavior.

## Brag video placements
1. After How it works: recommended primary new film, 20 seconds, click-to-play, quiet polished tone. Story: 0–3 s best-seller at risk; 3–7 s signals arrive; 7–12 s actual sandbox UI and forecast range; 12–17 s recommendation to reorder 1,240 units; 17–20 s brand and Try the demo. Show Example scenario. No invented results or live-data claims.
2. Before Industries or Optimization: optional 6–8 second silent derivative showing stock transferred from a surplus location to a location at risk. Produce as a short HyperFrames derivative, not a full Brag launch-film run.
3. Beside ROI: optional 6–8 second silent derivative showing illustrative carrying savings and recovered sales building into the estimate. Prefer a native interactive animation if this duplicates the live calculator.

Keep existing hero loop; avoid placing a second autoplay video directly underneath it. Start with one new 20-second Brag film and the tab/scenario/calculator micro interactions.

## Delivery behavior
- Scroll effects play once; normal document scrolling; no long pinned sections.
- Pause videos offscreen and when the page is hidden. Lazy-load below-fold video; poster-first presentation.
- Play/pause control for moving content, reduced-motion stills, no autoplay sound, static readable equivalents.
- Keep live UI text localized; minimize baked-in text in short loops.
- Validate mobile reflow, keyboard access, focus, reduced motion and low-power behavior during implementation.
