import { useEffect, type RefObject } from "react";
import { ScrollTrigger } from "../lib/motion";
import { fieldStore, type FieldTarget } from "./store";

/** While this element is the active chapter, the field eases to `target`. */
export function useFieldScene(ref: RefObject<HTMLElement>, target: Partial<FieldTarget>, deps: unknown[] = []) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 60%",
      end: "bottom 40%",
      onToggle: self => {
        if (self.isActive) fieldStore.setTarget(target);
      },
    });
    if (st.isActive) fieldStore.setTarget(target);
    return () => st.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
