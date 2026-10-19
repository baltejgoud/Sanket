import { useEffect, useRef, useState } from "react";
import { useT } from "../i18n";
import { useCopy } from "../copy";
import { useFieldScene } from "../field/useFieldScene";
import { fieldStore } from "../field/store";
import { ScrollTrigger, useReveal } from "../lib/motion";

/** Text steps inside the 0..1 scrub; the field's decision windows overlap these. */
const STEPS: [number, number][] = [
  [0, 0.27],
  [0.27, 0.53],
  [0.53, 0.78],
  [0.78, 1],
];

export function Decide() {
  const t = useT();
  const c = useCopy();
  const section = useReveal<HTMLElement>(0.05);
  const sticky = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  useFieldScene(section, { shot: "decide", signal: 0, forecast: 1, level: 0, focus: -1 });

  useEffect(() => {
    const el = section.current;
    const pane = sticky.current;
    if (!el || !pane) return;
    const apply = (p: number) => {
      fieldStore.setDecide(p);
      const s = STEPS.findIndex(([a, b]) => p >= a && p < b);
      const index = s < 0 ? 3 : s;
      const [a, b] = STEPS[index];
      pane.style.setProperty("--vp", Math.min(1, Math.max(0, (p - a) / (b - a))).toFixed(3));
      pane.style.setProperty("--p", p.toFixed(3));
      STEPS.forEach(([sa, sb], n) => pane.style.setProperty(`--s${n}`, Math.min(1, Math.max(0, (p - sa) / (sb - sa))).toFixed(3)));
      if (index !== stepRef.current) {
        // Adapt: demand moves again, and the balanced field absorbs it.
        if (index === 3 && stepRef.current < 3) fieldStore.pulse(0.08, 0.5, 1);
        stepRef.current = index;
        setStep(index);
      }
    };
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: self => apply(self.progress),
      onRefresh: self => apply(self.progress),
    });
    apply(st.progress);
    return () => st.kill();
  }, [section]);

  return (
    <section ref={section} id="decide" className="chapter decide" data-field="show" aria-labelledby="decide-title">
      <span id="platform" className="alias" />
      <div ref={sticky} className="decide-sticky">
        <div className="wrap decide-grid">
          <header className="decide-head">
            <p className="plate mono rule-in">
              <b>03</b> {c.decide.plate}
            </p>
            <h2 id="decide-title" className="decide-title display">
              {t.platform.title}
            </h2>
            <p className="muted">{t.platform.desc}</p>
          </header>

          <div className="verbs" aria-hidden="true">
            {c.decide.verbs.map((v, i) => (
              <p key={i} className={`verb display ${i === step ? "is-active" : ""} ${i < step ? "is-past" : ""}`}>
                {v.verb}
              </p>
            ))}
          </div>

          <ol className="decide-steps">
            {c.decide.verbs.map((v, i) => (
              <li key={i} className={i === step ? "is-active" : ""} aria-current={i === step ? "step" : undefined}>
                <span className="mono">
                  0{i + 1}
                  <span className="step-word"> · {c.decide.step}</span>
                </span>
                <h3>{v.name}</h3>
                <i className="step-bar" style={{ ["--k" as string]: `var(--s${i})` }} aria-hidden="true" />
              </li>
            ))}
          </ol>

          <div className="decision-card">
            {c.decide.verbs.map((v, i) => (
              <div key={i} className={`decision-body ${i === step ? "is-active" : ""}`}>
                <p className="decision-desc">{v.desc}</p>
                <p className="decision-result display">{v.result}</p>
                <p className="mono muted">{v.detail}</p>
              </div>
            ))}
            <p className="mono decision-flag">
              <i aria-hidden="true" />
              {c.decide.sandboxLabel}
            </p>
          </div>
          <p className="decide-control">{c.decide.control}</p>
        </div>
      </div>
    </section>
  );
}
