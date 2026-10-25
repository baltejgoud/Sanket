import { useEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import { useMotion } from "./prefs";

/**
 * Motion helpers with no GSAP or Lenis behind them, so the first load stays small. Everything here
 * stands still for reduced motion, calm mode and coarse pointers.
 */
const reducedQuery = typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

export function prefersReducedMotion() {
  return !!reducedQuery?.matches;
}

export function useReducedMotion() {
  return useSyncExternalStore(
    cb => {
      reducedQuery?.addEventListener("change", cb);
      return () => reducedQuery?.removeEventListener("change", cb);
    },
    () => !!reducedQuery?.matches,
    () => false,
  );
}

export const finePointer = () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

/** Adds `is-in` once the element enters the viewport. CSS does the motion. */
export function useReveal<T extends HTMLElement>(threshold = 0.2): RefObject<T> {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries)
          if (e.isIntersecting) {
            el.classList.add("is-in");
            io.disconnect();
          }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return ref;
}

/**
 * Pulls the element toward the pointer on a damped spring (one small overshoot, then rest), using
 * the individual `translate` property so CSS transforms on hover and press still apply.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.28) {
  const ref = useRef<T>(null);
  const calm = useMotion() === "calm";
  useEffect(() => {
    const el = ref.current;
    if (!el || calm || prefersReducedMotion() || !finePointer()) return;
    let tx = 0, ty = 0, x = 0, y = 0, vx = 0, vy = 0, raf = 0, last = 0;
    const step = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000 || 1 / 60);
      last = now;
      vx += ((tx - x) * 210 - vx * 19) * dt;
      vy += ((ty - y) * 210 - vy * 19) * dt;
      x += vx * dt;
      y += vy * dt;
      const resting = Math.abs(tx - x) + Math.abs(ty - y) < 0.05 && Math.abs(vx) + Math.abs(vy) < 0.05;
      if (resting) (x = tx), (y = ty);
      el.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
      raf = resting ? 0 : requestAnimationFrame(step);
    };
    const kick = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(step);
      }
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left - r.width / 2) * strength;
      ty = (e.clientY - r.top - r.height / 2) * strength;
      kick();
    };
    const leave = () => {
      tx = ty = 0;
      kick();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.style.translate = "";
    };
  }, [strength, calm]);
  return ref;
}

/**
 * A panel catches light: a soft highlight follows the pointer across it and the panel tips up to
 * 2° toward it (individual `rotate`, so existing transforms still apply). Fine pointers and full
 * motion only; sets --mx/--my (percent) and --rx/--ry on the element.
 */
export function useSheen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const calm = useMotion() === "calm";
  useEffect(() => {
    const el = ref.current;
    if (!el || calm || prefersReducedMotion() || !finePointer()) return;
    el.classList.add("sheen");
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    let raf = 0;
    let mx = 0.5;
    let my = 0.5;
    const paint = () => {
      raf = 0;
      el.style.setProperty("--mx", `${(mx * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(my * 100).toFixed(1)}%`);
      el.style.setProperty("--rx", ((0.5 - my) * 4).toFixed(2));
      el.style.setProperty("--ry", ((mx - 0.5) * 4).toFixed(2));
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width;
      my = (e.clientY - r.top) / r.height;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const leave = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      el.style.setProperty("--rx", "0");
      el.style.setProperty("--ry", "0");
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.classList.remove("sheen");
      for (const v of ["--mx", "--my", "--rx", "--ry"]) el.style.removeProperty(v);
    };
  }, [calm]);
  return ref;
}

/** Native in-page scroll; instant for reduced motion and calm mode. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const still = prefersReducedMotion() || document.documentElement.classList.contains("is-calm");
  el.scrollIntoView({ behavior: still ? "instant" : "smooth" });
}

/**
 * After an in-page jump, moves keyboard and screen-reader focus to where the reader landed: the
 * section's heading (made programmatically focusable), so the next Tab continues from there.
 */
export function focusSection(id: string) {
  const el = document.getElementById(id === "top" ? "signal" : id);
  if (!el) return;
  const target = el.matches("h1, h2, h3, main") ? el : el.querySelector<HTMLElement>("h1, h2") ?? el;
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}
