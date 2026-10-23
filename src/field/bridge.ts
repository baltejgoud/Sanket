import type { StockField } from "./StockField";

/**
 * The running field, for code outside the stage (palette actions, explore mode). Null while the
 * stage is booting or showing the poster.
 */
let field: StockField | null = null;
const listeners = new Set<() => void>();

export const fieldBridge = {
  get: () => field,
  set(next: StockField | null) {
    field = next;
    listeners.forEach(l => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => void listeners.delete(l);
  },
};
