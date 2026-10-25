/**
 * Privacy-friendly product events: no cookies, no identifiers, no personal data, nothing stored.
 * An event is a name and a few coarse properties (which chapter, which tool, which channel).
 * They leave the page only through a sink that has been switched on:
 *   - Vercel Web Analytics, when VITE_VERCEL_ANALYTICS=1 at build time (see main.tsx);
 *   - any collector at VITE_ANALYTICS_ENDPOINT, sent with sendBeacon.
 * With neither, or when the browser sends Do Not Track, they only land in window.__sanketEvents (QA).
 */
export type EventName = "chapter_reached" | "scene_stepped" | "tool_opened" | "scenario_changed" | "contact_click";
type Props = Record<string, string | number>;
type Sinks = Window & { __sanketEvents?: { name: EventName; props: Props }[]; va?: (kind: "event", event: { name: string; data: Props }) => void };

const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined;
const once = new Set<string>();

/** Records an event. With `onceKey`, only the first event with that key per page view counts. */
export function track(name: EventName, props: Props = {}, onceKey?: string) {
  if (onceKey) {
    if (once.has(onceKey)) return;
    once.add(onceKey);
  }
  const w = window as Sinks;
  (w.__sanketEvents ||= []).push({ name, props });
  if (navigator.doNotTrack === "1") return;
  const data = { ...props, lang: document.documentElement.lang };
  w.va?.("event", { name, data });
  if (endpoint) navigator.sendBeacon?.(endpoint, JSON.stringify({ name, data, path: location.pathname }));
}
