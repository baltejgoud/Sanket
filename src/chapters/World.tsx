import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Lock, Plus, Search, X } from "lucide-react";
import { useT } from "../i18n";
import { useCopy } from "../copy";
import { connectors, industries } from "../data";
import { useReveal } from "../lib/motion";
import { visit } from "../lib/visit";
import { RevealHeading } from "../components/Words";
import { series, smooth } from "./Sandbox";

function Spark({ phase, scenario }: { phase: number; scenario: number }) {
  const data = useMemo(() => series(scenario, 13, 0, phase), [phase, scenario]);
  const w = 360;
  const h = 120;
  const max = Math.max(...data.map(d => d.hi));
  const min = Math.min(...data.map(d => d.lo));
  const x = (i: number) => 6 + (i / 12) * (w - 12);
  const y = (v: number) => 8 + (1 - (v - min) / (max - min)) * (h - 16);
  const hi = data.map((d, i) => [x(i), y(d.hi)] as [number, number]);
  const lo = data.map((d, i) => [x(i), y(d.lo)] as [number, number]).reverse();
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="spark" aria-hidden="true" preserveAspectRatio="none">
      <path d={`${smooth(hi)}${smooth(lo, false)}Z`} className="spark-band" />
      <path d={smooth(data.map((d, i) => [x(i), y(d.median)]))} className="spark-median" />
      <line x1={x(4)} x2={x(4)} y1={4} y2={h - 4} className="spark-now" />
    </svg>
  );
}

function Industries() {
  const { world: c, contact } = useCopy();
  const [open, setOpen] = useState(0);
  // Apparel opens by default; only an industry the visitor picks goes into their message.
  const picked = useRef(false);
  useEffect(() => {
    if (!picked.current) return;
    const ind = industries[open];
    visit.set("industry", ind ? { label: ind.short, line: contact.industry(ind.name) } : null);
  }, [open, contact]);
  return (
    <div className="industry-list">
      {industries.map((ind, i) => {
        const isOpen = open === i;
        return (
          <div key={ind.name} className={`industry ${isOpen ? "is-open" : ""}`}>
            <h3>
              <button
                id={`industry-${i}`}
                aria-expanded={isOpen}
                aria-controls={`industry-panel-${i}`}
                onClick={() => {
                  picked.current = true;
                  setOpen(isOpen ? -1 : i);
                }}
              >
                <span className="mono">0{i + 1}</span>
                <span className="industry-name">{ind.short}</span>
                <span className="industry-tag">{ind.tag}</span>
                <Plus className="industry-plus" size={22} aria-hidden="true" />
              </button>
            </h3>
            <div
              id={`industry-panel-${i}`}
              role="region"
              aria-labelledby={`industry-${i}`}
              className="industry-body"
              {...(isOpen ? {} : { inert: "", "aria-hidden": true })}
            >
              <div className="industry-inner">
                <div className="industry-copy">
                  <p>{ind.desc}</p>
                  <ul>
                    {ind.features.map(f => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <p className="industry-metric">
                    <strong>{ind.metric}</strong>
                    <span className="mono">{ind.label}</span>
                  </p>
                </div>
                <div className="industry-card">
                  <div className="industry-card-top mono">
                    <span>
                      workspace.sanket / {ind.short.toLowerCase()}
                    </span>
                    <span className="private">
                      <Lock size={11} aria-hidden="true" /> {c.private}
                    </span>
                  </div>
                  <span className="mono muted">{c.example}</span>
                  <strong>{ind.product}</strong>
                  <Spark phase={i * 1.3} scenario={i === 0 ? 2 : i === 3 ? 1 : 0} />
                  <span className="mono muted">{c.telemetry}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <p className="mono muted industry-note">{c.englishNote}</p>
    </div>
  );
}

function Integrations() {
  const t = useT();
  const c = useCopy().world;
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<{ name: string; cat: string } | null>(null);
  const q = query.trim().toLowerCase();
  const cats = Object.keys(connectors) as (keyof typeof connectors)[];
  const total = cats.reduce((n, cat) => n + connectors[cat].filter(name => name.toLowerCase().includes(q)).length, 0);
  return (
    <section id="integrations" className="integrations" aria-labelledby="integrations-title">
      <div className="integrations-head">
        <p className="plate mono">
          <b>04·2</b> {t.platform.connectEyebrow}
        </p>
        <h3 id="integrations-title" className="display">
          {t.platform.connectTitle}
        </h3>
        <label className="search">
          <Search size={17} aria-hidden="true" />
          <input aria-label="Search connectors" value={query} onChange={e => setQuery(e.target.value)} placeholder={t.platform.search} />
          {query && (
            <button aria-label={c.close} onClick={() => setQuery("")}>
              <X size={15} />
            </button>
          )}
        </label>
      </div>
      <div className="catalog">
        {cats.map(cat => {
          const names = connectors[cat].filter(name => name.toLowerCase().includes(q));
          return (
            <div key={cat} className="catalog-col">
              <span className="mono">
                {cat} <b>{names.length}</b>
              </span>
              <ul>
                {names.map(name => (
                  <li key={name}>
                    <button aria-pressed={picked?.name === name} onClick={() => setPicked(picked?.name === name ? null : { name, cat })}>
                      {name}
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="catalog-detail" aria-live="polite">
        {total === 0 && <p className="muted">{c.noMatch}</p>}
        {picked && (
          <p className="connector-detail">
            <strong>{picked.name}</strong>
            <span className="mono">
              {picked.cat === "India ERP" ? c.bridge : c.api} · {c.scoped}
            </span>
            <button className="icon-button" aria-label="Close connector details" onClick={() => setPicked(null)}>
              <X size={15} />
            </button>
          </p>
        )}
      </div>
    </section>
  );
}

export function World() {
  const t = useT();
  const c = useCopy();
  const section = useReveal<HTMLElement>(0.08);
  return (
    <section ref={section} id="industries" className="chapter light world" aria-labelledby="world-title">
      <div className="wrap">
        <header className="world-head">
          <p className="plate mono rule-in">
            <b>04</b> {c.world.plate}
          </p>
          <RevealHeading id="world-title" className="display h2 world-title" lines={[t.industries.title]} />
          <p className="lead muted fade">{t.industries.desc}</p>
        </header>
        <Industries />
        <Integrations />
      </div>
    </section>
  );
}
