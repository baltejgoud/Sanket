import type { FieldTarget, Shot } from "./store";

/** Explore mode's timeline, 0..1: the story's states in order, as field targets and a decide scrub. */
export const TIMELINE_STOPS = [0, 0.3, 0.47, 0.72, 1];
export function timelineState(v: number): { target: FieldTarget; decide: number } {
  const clamp = (n: number) => Math.min(1, Math.max(0, n));
  const shot: Shot = v < 0.2 ? "hero" : v < 0.4 ? "signal" : v < 0.55 ? "forecast" : v < 0.9 ? "decide" : "level";
  return {
    target: { shot, signal: shot === "signal" ? 1 : shot === "forecast" ? 0.2 : 0, forecast: v >= 0.4 && v < 0.9 ? 1 : 0, level: clamp((v - 0.88) / 0.1), focus: -1 },
    decide: clamp((v - 0.55) / 0.33),
  };
}
