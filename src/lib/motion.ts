import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useMotion } from "./prefs";

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

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

export function useMedia(query: string) {
  return useSyncExternalStore(
    cb => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

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

let lenisInstance: Lenis | null = null;
export const getLenis = () => lenisInstance;

/** Smooth wheel scrolling, synced to ScrollTrigger. Touch scrolling stays native. */
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({ autoRaf: false, anchors: { offset: -64 }, lerp: 0.11 });
    lenisInstance = lenis;
    (window as Window & { __lenis?: Lenis }).__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
      delete (window as Window & { __lenis?: Lenis }).__lenis;
    };
  }, [enabled]);
}

/** Scroll to an in-page anchor through Lenis when it is running. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el, { offset: -64 });
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

/** Spring the element toward the pointer. Fine pointers only. */
export function useMagnetic<T extends HTMLElement>(strength = 0.28) {
  const ref = useRef<T>(null);
  const calm = useMotion() === "calm";
  useEffect(() => {
    const el = ref.current;
    if (!el || calm || prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    const x = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * strength);
      y((e.clientY - r.top - r.height / 2) * strength);
    };
    const leave = () => {
      x(0);
      y(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      gsap.set(el, { x: 0, y: 0 });
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
    if (!el || calm || prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
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

type IdleWindow = Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (n: number) => void };

/** Run `fn` in the next idle slice (or soon, if the page never idles); returns a cancel. */
export function onIdle(fn: () => void, timeout = 600) {
  const w = window as IdleWindow;
  if (w.requestIdleCallback) {
    const n = w.requestIdleCallback(fn, { timeout });
    return () => w.cancelIdleCallback?.(n);
  }
  const n = window.setTimeout(fn, 200);
  return () => clearTimeout(n);
}

/** True once the document has painted and is idle; used to defer heavy work. */
export function useIdle(delay = 0) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    let cancel = () => {};
    const t = window.setTimeout(() => (cancel = onIdle(() => setIdle(true), 900)), delay);
    return () => {
      clearTimeout(t);
      cancel();
    };
  }, [delay]);
  return idle;
}
