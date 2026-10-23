import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../lib/motion";
import { isCalm } from "../lib/prefs";

/**
 * A mechanical counter: each digit is a 0–9 strip that rolls to its value, right-most first.
 * The glyphs are CSS-generated, so the element's text (copy, innerText, screen readers) is
 * exactly `value`. Runs of other characters stay whole, so Indic shaping is never split.
 *
 * from="zero": rolls up from zeros the first time it is on screen.
 * active=false: holds at zeros (the Decide card rolls each result as its step arrives).
 */
export function Odometer({
  value,
  variant = "roll",
  from = "previous",
  active = true,
}: {
  value: string;
  variant?: "roll" | "board";
  from?: "previous" | "zero";
  active?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [seen, setSeen] = useState(from !== "zero");
  useEffect(() => {
    const el = ref.current;
    if (seen || !el) return;
    if (isCalm() || prefersReducedMotion()) return setSeen(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        // One frame at zero first, so the roll has somewhere to start.
        requestAnimationFrame(() => setSeen(true));
        io.disconnect();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  const shown = seen && active;
  const parts = value.match(/\d|\D+/g) ?? [];
  let digitsLeft = parts.filter(p => /\d/.test(p)).length;
  return (
    <span ref={ref} className={`odo odo-${variant}`}>
      <span className="odo-text">{value}</span>
      <span className="odo-face" aria-hidden="true">
        {parts.map((p, n) => {
          if (!/\d/.test(p)) return <span key={`c${n}${p}`} className="odo-c" data-c={p} />;
          // Keyed by place value, so 980 → 1,240 keeps the units column rolling in place.
          const place = --digitsLeft;
          return <span key={`d${place}`} className="odo-d" style={{ ["--v" as string]: shown ? +p : 0, ["--k" as string]: place }} />;
        })}
      </span>
    </span>
  );
}

/** The longest number inside a phrase ("Order 1,240 units") as a counter; the words stay text. */
export function OdometerPhrase({ text, variant = "roll", active = true }: { text: string; variant?: "roll" | "board"; active?: boolean }) {
  const numbers = text.match(/\d[\d,.]*/g) ?? [];
  const pick = numbers.sort((a, b) => b.replace(/\D/g, "").length - a.replace(/\D/g, "").length)[0];
  if (!pick) return <>{text}</>;
  const at = text.indexOf(pick);
  return (
    <>
      {text.slice(0, at)}
      <Odometer value={pick} variant={variant} active={active} />
      {text.slice(at + pick.length)}
    </>
  );
}
