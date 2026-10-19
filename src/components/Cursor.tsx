import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../lib/motion";

/**
 * A contextual cursor for fine pointers. Elements opt in with
 * `data-cursor="Label"`; the field zone reads "Send a signal".
 * The native cursor stays visible: this is an annotation, not a replacement.
 */
export function Cursor({ fieldLabel }: { fieldLabel: string }) {
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    const el = ring.current!;
    const text = label.current!;
    document.documentElement.classList.add("has-cursor");
    let x = -100;
    let y = -100;
    let cx = x;
    let cy = y;
    let raf = 0;
    let shown = false;
    const tick = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.2 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        shown = true;
        cx = x;
        cy = y;
        el.classList.add("is-on");
      }
      const target = e.target as Element | null;
      const labelled = target?.closest?.("[data-cursor]") as HTMLElement | null;
      const zone = target?.closest?.("[data-field-zone]");
      const interactive = target?.closest?.("a, button, select, summary, input, [role='tab']");
      const next = labelled?.dataset.cursor ?? (zone && !interactive ? fieldLabel : "");
      if (text.textContent !== next) text.textContent = next;
      el.classList.toggle("is-label", !!next);
      el.classList.toggle("is-hover", !!interactive && !next);
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const down = () => el.classList.add("is-down");
    const up = () => el.classList.remove("is-down");
    const leave = () => {
      shown = false;
      el.classList.remove("is-on");
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [fieldLabel]);
  return (
    <div ref={ring} className="cursor" aria-hidden="true">
      <span className="cursor-ring" />
      <span ref={label} className="cursor-label mono" />
    </div>
  );
}
