import { useSyncExternalStore } from "react";

/**
 * What the visitor explored on this page, so a WhatsApp or email message can say it for them.
 * Memory only: nothing is stored or sent anywhere except inside the links the visitor presses,
 * and it is gone on reload. The visitor can take any item out; it then stays out.
 */
export type VisitKey = "industry" | "roi" | "sandbox";

export interface VisitItem {
  key: VisitKey;
  /** short chip text */
  label: string;
  /** the line added to the message, in the visitor's language */
  line: string;
}

const ORDER: VisitKey[] = ["industry", "roi", "sandbox"];
let items: VisitItem[] = [];
const removed = new Set<VisitKey>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

export const visit = {
  get: () => items,
  set(key: VisitKey, item: Omit<VisitItem, "key"> | null) {
    const rest = items.filter(i => i.key !== key);
    const next = item && !removed.has(key) ? [...rest, { key, ...item }] : rest;
    next.sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));
    if (JSON.stringify(next) === JSON.stringify(items)) return;
    items = next;
    emit();
  },
  remove(key: VisitKey) {
    removed.add(key);
    items = items.filter(i => i.key !== key);
    emit();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => void listeners.delete(l);
  },
};

export const useVisit = () => useSyncExternalStore(visit.subscribe, visit.get, visit.get);

/** The context as bullet lines, or "" when there is none. */
export const contextLines = (list: VisitItem[]) => list.map(i => `• ${i.line}`).join("\n");
