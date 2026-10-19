import { useEffect, useRef, useState } from "react";
import { useCopy } from "../copy";
import { useFieldScene } from "../field/useFieldScene";
import { fieldStore } from "../field/store";
import { RevealHeading } from "../components/Words";
import { prefersReducedMotion, useReveal } from "../lib/motion";

/** Where each named signal enters the field (normalised u, v). */
const ENTRY: [number, number][] = [
  [0.5, 0.62],
  [0, 0.25],
  [0.18, 0],
  [1, 0.45],
  [0.72, 1],
  [0.95, 0.05],
  [0.02, 0.9],
];

export function Signal() {
  const c = useCopy();
  const section = useReveal<HTMLElement>(0.25);
  const [active, setActive] = useState(-1);
  const inView = useRef(false);
  useFieldScene(section, { shot: "signal", signal: 1, forecast: 0, level: 0, focus: -1 });

  // While the chapter is on screen, the named signals take turns reaching the field.
  useEffect(() => {
    const el = section.current;
    if (!el || prefersReducedMotion()) return;
    let timer = 0;
    let n = 0;
    const step = () => {
      const i = n % c.signal.signals.length;
      setActive(i);
      const [u, v] = ENTRY[i];
      fieldStore.pulse(u, v, i === 0 ? 0.8 : 1);
      n++;
      timer = window.setTimeout(step, 2300);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        inView.current = e.isIntersecting;
        clearTimeout(timer);
        if (e.isIntersecting) timer = window.setTimeout(step, 500);
        else setActive(-1);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [c.signal.signals.length, section]);

  return (
    <section ref={section} id="signal" className="chapter signal" data-field="show" aria-labelledby="signal-title">
      <span id="journey" className="alias" />
      <div className="wrap signal-grid">
        <p className="plate mono rule-in">
          <b>01</b> {c.signal.plate}
        </p>
        <RevealHeading id="signal-title" className="display h2 signal-title" lines={[c.signal.a, c.signal.b]} accentLine={1} />
        <p className="lead signal-body fade" style={{ ["--d" as string]: "350ms" }}>
          {c.signal.body}
        </p>
        <div className="signal-list fade" style={{ ["--d" as string]: "500ms" }}>
          <span className="mono muted">{c.signal.listLabel}</span>
          <ul>
            {c.signal.signals.map((s, i) => (
              <li key={s} className={i === active ? "is-active" : ""}>
                <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                {s}
              </li>
            ))}
          </ul>
          <p className="mono muted signal-caption">{c.signal.caption}</p>
        </div>
      </div>
    </section>
  );
}
