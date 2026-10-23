import { useSyncExternalStore } from "react";

/**
 * The visitor's motion choice (WCAG 2.2.2 Pause, Stop, Hide). "calm" stops everything that moves
 * on its own: the field's breathing and waves, the signal cycle, looping indicators, smooth scroll
 * and pointer effects. It starts calm when the system asks for reduced motion.
 */
export type Motion = "full" | "calm";

const KEY = "sanket-motion";

function read(): Motion {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "full" || saved === "calm") return saved;
  } catch {
    // storage unavailable: follow the system setting
  }
  return matchMedia("(prefers-reduced-motion: reduce)").matches ? "calm" : "full";
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
