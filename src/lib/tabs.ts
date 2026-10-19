import type { KeyboardEvent } from "react";

/** ARIA tab pattern: arrows, Home and End move selection and focus. */
export function tabKeys(e: KeyboardEvent<HTMLElement>, index: number, count: number, select: (n: number) => void, prefix: string) {
  let next = index;
  if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % count;
  else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index - 1 + count) % count;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = count - 1;
  else return;
  e.preventDefault();
  select(next);
  document.getElementById(prefix + next)?.focus();
}
