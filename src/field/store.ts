/**
 * Shared field state. Chapters push targets; the renderer pulls them every
 * frame and eases toward them. Kept outside React so scroll updates never
 * re-render the page.
 */
export type Shot = "hero" | "signal" | "problems" | "forecast" | "decide" | "level";

export interface FieldTarget {
  shot: Shot;
  /** ambient signal waves, 0..1 */
  signal: number;
  /** forecast band visibility, 0..1 */
  forecast: number;
  /** final calm, 0..1 */
  level: number;
  /** problem focus index, or -1 */
  focus: number;
}

export interface Readout {
  sku: string;
  location: string;
  onHand: number;
  need: number;
  status: "short" | "over" | "ok" | "new" | "sheet";
}

type Listener = () => void;

const state = {
  target: { shot: "hero", signal: 0, forecast: 0, level: 0, focus: -1 } as FieldTarget,
  decide: 0,
  /** at least one chapter that shows the field is on screen */
  visible: true,
  /** an opaque full-screen layer (the phone index) hides the field: skip frames until it closes */
  covered: false,
  pulses: [] as { u: number; v: number; strength: number }[],
  readout: null as Readout | null,
  version: 0,
};
const listeners = new Set<Listener>();
const readoutListeners = new Set<Listener>();
const emit = () => {
  state.version++;
  listeners.forEach(l => l());
};

export const fieldStore = {
  get: () => state,
  setTarget(next: Partial<FieldTarget>) {
    const t = state.target;
    if (Object.entries(next).every(([k, v]) => t[k as keyof FieldTarget] === v)) return;
    state.target = { ...t, ...next };
    emit();
  },
  setDecide(n: number) {
    const v = Math.min(1, Math.max(0, n));
    if (Math.abs(v - state.decide) < 1e-4) return;
    state.decide = v;
    emit();
  },
  setCovered(c: boolean) {
    if (c === state.covered) return;
    state.covered = c;
    emit();
  },
  setVisible(v: boolean) {
    if (v === state.visible) return;
    state.visible = v;
    emit();
  },
  /** queue a signal pulse at normalised field coordinates */
  pulse(u: number, v: number, strength = 1) {
    state.pulses.push({ u, v, strength });
    emit();
  },
  takePulses() {
    const p = state.pulses;
    state.pulses = [];
    return p;
  },
  setReadout(r: Readout | null) {
    const a = state.readout;
    if (a === r || (a && r && a.sku === r.sku && a.location === r.location && a.onHand === r.onHand)) return;
    state.readout = r;
    readoutListeners.forEach(l => l());
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  subscribeReadout(l: Listener) {
    readoutListeners.add(l);
    return () => {
      readoutListeners.delete(l);
    };
  },
};
