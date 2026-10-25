# SANKET warehouse story — motion and craft upgrade

Date: 25 October 2026 · Status: approved by the owner ("build all three as proposed")

An improvement pass on the current warehouse story (`src/campus/`), not a redesign: layout, copy, colours, chapter order and scroll lengths stay as they are.

## Audit (1440×900 and 375×812)

- Hero: type on black; the warehouse only fades in after ~300 px of scroll. Nothing animates on load. Archivo's width/weight axes are loaded but unused. The earlier motion kit (Words, Odometer, Cursor, magnetic, sheen) is unused on this page.
- 3D: static between scrolls (`quiet: true` hard-coded), no pointer response, overlays and labels pop, lamps have no glow.
- Contact: the channels are hairline rows; copy feedback is a toast; the final wide shot is hidden behind an opaque background.
- Performance: 45 kB gzip of GSAP + Lenis loads up front only because `useReducedMotion` and the header's magnetic link come from `lib/motion.ts`.

## Design

### Hero: the night shift starts
- The warehouse is visible from the first frame, framed low under the headline with its lamps off. A scroll-continuous `hero` mix (timeline) blends from this framing to the existing chapter-1 shot.
- Intro (CSS, about 1.6 s, never blocks input): eyebrow types on; headline words drop in with the existing carton motion while Archivo settles from condensed/light to its final width/weight; lead and paths follow. When the engine is ready the lamps ignite bank by bank with a fluorescent flicker.
- Latin headline letters gain weight near the pointer; Hindi and Telugu animate by word only.
- On scroll-out the two headline lines drift apart (transforms only).
- Magnetic primary path with an arrow that drops out and re-enters; a conveyor scroll cue.

### 3D model: a live place
- Pointer parallax: the camera orbits up to ~1.5° yaw / 1° pitch toward the pointer, spring-damped. Fine pointers, full motion only.
- Ambient life only in the wide shots (hero, finale): perimeter truck drives, signal lamps breathe. Reading holds stay still. Ambient-only frames are capped at 30 fps and stop while the canvas is covered or the tab is hidden.
- Overlays fade with time-based easing; the transfer path draws itself; labels draw their leader line, then reveal.
- Selective bloom for lamps and signal orange on the desktop high-quality tier; the quality governor drops it with SSAO.
- Story cards enter from the direction of travel.

### Contact: the closing shot
- The top of the contact section is transparent so the lit final shot sits behind the heading, darkening to solid before the tools.
- Heading words drop in like the hero.
- WhatsApp and Email become tactile keys: lift and pointer sheen on hover, depress on press, magnetic arrow.
- Copy email: label rolls to the confirmation and a check draws.
- A live "time in India" line (Asia/Kolkata) with rolling digits.
- Tool cards get sheen and a staggered entry; FAQ answers open with animated height.
- A large SANKET wordmark whose width axis expands as it scrolls into view (scroll-driven animation, static fallback).
- The contextual cursor returns on fine pointers with localized labels.

### Constraints
- Transforms, opacity and CSS variables only for scroll-linked motion. Calm mode and `prefers-reduced-motion` show final states with no flicker, parallax, drift or ambient motion.
- `lib/kinetic.ts` holds the GSAP-free helpers; the initial bundle no longer includes GSAP or Lenis.
- Lenis is not reintroduced: the camera already eases, and scroll hijacking would fight the scene controls.

## Verification
TypeScript/Vite build; `check-campus`, `check-story-guide`, `check-story-revision`; browser review at 1440×900 and 390×844 in English and Hindi, calm/reduced motion and `?no-webgl`; bundle sizes before and after.
