import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useT } from "../i18n";
import { useCopy } from "../copy";
import { fieldStore } from "../field/store";
import { ScrollTrigger, useReveal } from "../lib/motion";
import { RevealHeading } from "../components/Words";
import { tabKeys } from "../lib/tabs";

export function Problems() {
  const t = useT();
  const c = useCopy();
  const section = useReveal<HTMLElement>(0.15);
  const [active, setActive] = useState(0);
  const activeRef = useRef(active);
  activeRef.current = active;
  const p = t.problems.items[active];

  // This chapter drives the camera to whichever problem is selected.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 60%",
      end: "bottom 40%",
      onToggle: self => {
        if (self.isActive) fieldStore.setTarget({ shot: "problems", signal: 0.4, forecast: 0, level: 0, focus: activeRef.current });
      },
    });
    return () => st.kill();
  }, [section]);

  useEffect(() => {
    const s = fieldStore.get().target;
    if (s.shot === "problems") fieldStore.setTarget({ focus: active });
    // "The world changes overnight": send signals into the field.
    if (active === 4) {
      fieldStore.pulse(0, 0.28, 1);
      const id = window.setTimeout(() => fieldStore.pulse(0, 0.55, 0.9), 1400);
      return () => clearTimeout(id);
    }
  }, [active]);

  return (
    <section ref={section} id="problems" className="chapter problems" data-field="show" aria-labelledby="problems-title">
      <div className="wrap problems-grid">
        <div className="problems-copy">
          <p className="plate mono rule-in">
            <b>01·2</b> {c.problems.plate}
          </p>
          <RevealHeading id="problems-title" className="display problems-title" lines={[t.problems.title]} />
          <p className="muted problems-desc fade">{t.problems.desc}</p>
          <div className="problem-tabs" role="tablist" aria-label={t.problems.eyebrow}>
            {t.problems.items.map((item, i) => (
              <button
                key={i}
                role="tab"
                id={`problem-tab-${i}`}
                aria-selected={active === i}
                aria-controls="problem-panel"
                tabIndex={active === i ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={e => tabKeys(e, i, t.problems.items.length, setActive, "problem-tab-")}
              >
                <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                <span className="tab-label">{item.short}</span>
                <i aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
        <div className="problem-panel" id="problem-panel" role="tabpanel" aria-labelledby={`problem-tab-${active}`} aria-live="polite">
          <div className="problem-panel-inner" key={active}>
            <p className="mono field-caption">
              <i aria-hidden="true" />
              {c.problems.fieldLabel} — {c.problems.captions[active]}
            </p>
            <h3>{p.title}</h3>
            <p className="problem-feel">{p.feel}</p>
            <p className="problem-cost">
              <AlertTriangle size={16} aria-hidden="true" />
              {p.cost}
            </p>
            <div className="problem-fix">
              <span className="mono">{t.problems.withSanket}</span>
              <p>{p.fix}</p>
            </div>
            <p className="problem-outcome">
              <strong>{p.value}</strong>
              <span>{p.label}</span>
            </p>
          </div>
        </div>
        <p className="footnote mono">{t.problems.footnote}</p>
      </div>
    </section>
  );
}
