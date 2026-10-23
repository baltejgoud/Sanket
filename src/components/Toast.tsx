import { useSyncExternalStore } from "react";

/** One short confirmation at a time ("Copied"), announced politely. */
let message = "";
let timer = 0;
let serial = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

export function toast(text: string) {
  message = text;
  serial++;
  emit();
  clearTimeout(timer);
  timer = window.setTimeout(() => {
    message = "";
    emit();
  }, 2600);
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};

/** The status region is always in the DOM so screen readers pick up the change. */
export function Toaster() {
  const text = useSyncExternalStore(subscribe, () => message);
  return (
    <div className="toaster" role="status" aria-live="polite">
      {text && (
        <p className="toast" key={serial}>
          {text}
        </p>
      )}
    </div>
  );
}
