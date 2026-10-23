import { useEffect, useRef } from "react";
import { isCalm } from "./prefs";

/**
 * Detents: a slider value within `tolerance` of the span from a meaningful value (a preset, zero)
 * clicks onto it, the way a machined dial has notches.
 */
export function snapToDetent(value: number, detents: number[], span: number, tolerance = 0.015) {
  for (const d of detents) if (Math.abs(value - d) <= span * tolerance) return { value: d, snapped: true };
  return { value, snapped: false };
}

/** A short haptic click where the device has one (Android), only in full motion. */
export function tick() {
  if (isCalm()) return;
  try {
    navigator.vibrate?.(6);
  } catch {
    // some browsers throw without a recent user activation
  }
}

/**
 * Segmented controls get a puck that slides to the pressed (or selected) option. Measures the
 * option's box into --x/--y/--w/--h on the group, on resize and whenever aria-pressed changes,
 * so callers need no extra state.
 */
export function usePuck<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const place = () => {
      const on = el.querySelector<HTMLElement>('[aria-pressed="true"], [aria-selected="true"]');
      // has-puck makes the group the positioning context, so it must be on before measuring.
      el.classList.toggle("has-puck", !!on);
      if (!on) return;
      if (on.offsetParent !== el) el.style.position = "relative";
      el.style.setProperty("--x", `${on.offsetLeft}px`);
      el.style.setProperty("--y", `${on.offsetTop}px`);
      el.style.setProperty("--w", `${on.offsetWidth}px`);
      el.style.setProperty("--h", `${on.offsetHeight}px`);
    };
    place();
    // The first placement must not slide in from the corner.
    requestAnimationFrame(() => el.classList.add("puck-ready"));
    const ro = new ResizeObserver(place);
    ro.observe(el);
    const mo = new MutationObserver(place);
    mo.observe(el, { subtree: true, attributes: true, attributeFilter: ["aria-pressed", "aria-selected"] });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, []);
  return ref;
}
