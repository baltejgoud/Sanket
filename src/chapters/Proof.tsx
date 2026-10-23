import { useContext, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Plus, RefreshCw } from "lucide-react";
import { LangContext, useT } from "../i18n";
import { useCopy } from "../copy";
import { storyMeta } from "../data";
import { useReveal } from "../lib/motion";
import { visit } from "../lib/visit";
import { RevealHeading } from "../components/Words";

type Currency = "INR" | "USD";
const presets = {
  INR: [
    { revenue: 5e7, inventory: 1e7 },
    { revenue: 5e8, inventory: 1e8 },
    { revenue: 5e9, inventory: 1e9 },
  ],
  USD: [
    { revenue: 5e6, inventory: 1e6 },
    { revenue: 25e6, inventory: 5e6 },
    { revenue: 100e6, inventory: 20e6 },
  ],
};
const roiCopy = {
  en: { profile: "Your business profile", currency: "Scenario currency", preset: "Business size", sizes: ["Small business", "Growing business", "Enterprise"], reset: "Reset", revenue: "Annual revenue", inventory: "Inventory value", holding: "Annual holding cost", margin: "Gross margin", stockouts: "Stockout rate", reduction: "Inventory reduction", stockReduction: "Stockout reduction", impact: "Estimated annual impact", sub: "Potential savings, based on your inputs.", rows: ["Inventory carrying savings", "Lost sales recovery", "Expedited freight savings", "End-of-season markdowns"], note: "Illustrative estimate, not a guarantee. Currency switches load separate sample businesses; they do not convert your inputs.", formula: "See the calculation", assumptions: "Edit savings assumptions", freight: "Annual expedited freight spend", markdown: "Annual markdown losses", freightRate: "Freight savings", markdownRate: "Markdown savings", raw: "Enter full amounts in the selected currency." },
  hi: { profile: "आपके व्यवसाय की जानकारी", currency: "उदाहरण की मुद्रा", preset: "व्यवसाय का आकार", sizes: ["छोटा व्यवसाय", "बढ़ता व्यवसाय", "एंटरप्राइज़"], reset: "रीसेट", revenue: "वार्षिक बिक्री", inventory: "स्टॉक का मूल्य", holding: "वार्षिक रखरखाव लागत", margin: "सकल मार्जिन", stockouts: "स्टॉक खत्म होने की दर", reduction: "स्टॉक में कमी", stockReduction: "स्टॉकआउट में कमी", impact: "अनुमानित वार्षिक लाभ", sub: "आपकी जानकारी के आधार पर संभावित बचत।", rows: ["स्टॉक रखने की लागत में बचत", "खोई बिक्री की वापसी", "तत्काल मालभाड़े में बचत", "मार्कडाउन में बचत"], note: "यह उदाहरण है, गारंटी नहीं। मुद्रा बदलने पर नया नमूना व्यवसाय लोड होता है; इनपुट का रूपांतरण नहीं होता।", formula: "गणना देखें", assumptions: "बचत की मान्यताएँ बदलें", freight: "वार्षिक तत्काल मालभाड़ा खर्च", markdown: "वार्षिक मार्कडाउन नुकसान", freightRate: "मालभाड़ा बचत", markdownRate: "मार्कडाउन बचत", raw: "चुनी गई मुद्रा में पूरी राशि दर्ज करें।" },
  te: { profile: "మీ వ్యాపార వివరాలు", currency: "ఉదాహరణ కరెన్సీ", preset: "వ్యాపార పరిమాణం", sizes: ["చిన్న వ్యాపారం", "పెరుగుతున్న వ్యాపారం", "ఎంటర్‌ప్రైజ్"], reset: "రీసెట్", revenue: "వార్షిక ఆదాయం", inventory: "స్టాక్ విలువ", holding: "వార్షిక నిల్వ ఖర్చు", margin: "స్థూల మార్జిన్", stockouts: "స్టాక్ కొరత రేటు", reduction: "స్టాక్ తగ్గింపు", stockReduction: "స్టాక్ కొరత తగ్గింపు", impact: "అంచనా వార్షిక ప్రయోజనం", sub: "మీ వివరాల ఆధారంగా సాధ్యమైన పొదుపు.", rows: ["స్టాక్ నిల్వ ఖర్చు పొదుపు", "కోల్పోయిన అమ్మకాల పునరుద్ధరణ", "అత్యవసర రవాణా పొదుపు", "మార్క్‌డౌన్ పొదుపు"], note: "ఇది ఉదాహరణ అంచనా, హామీ కాదు. కరెన్సీ మార్చినప్పుడు వేరే నమూనా వ్యాపారం లోడ్ అవుతుంది; ఇన్‌పుట్‌లు మార్పిడి కావు.", formula: "లెక్క చూడండి", assumptions: "పొదుపు అంచనాలను మార్చండి", freight: "వార్షిక అత్యవసర రవాణా ఖర్చు", markdown: "వార్షిక మార్క్‌డౌన్ నష్టాలు", freightRate: "రవాణా పొదుపు", markdownRate: "మార్క్‌డౌన్ పొదుపు", raw: "ఎంచుకున్న కరెన్సీలో పూర్తి మొత్తాలను నమోదు చేయండి." },
};

function EditableNumber({ value, commit, min, max, label, id }: { value: number; commit: (n: number) => void; min: number; max: number; label: string; id?: string }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const save = () => {
    const n = Number(draft);
    if (draft.trim() !== "" && Number.isFinite(n)) {
      const valid = Math.max(min, Math.min(max, n));
      commit(valid);
      setDraft(String(valid));
    } else setDraft(String(value));
  };
  return (
    <input
      id={id}
      aria-label={label}
      type="number"
      inputMode="decimal"
      min={min}
      max={max}
      step="any"
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={save}
      onKeyDown={e => e.key === "Enter" && e.currentTarget.blur()}
    />
  );
}

/** The business case. Arithmetic is unchanged from the original calculator; results are exact and immediate. */
function ROI() {
  const lang = useContext(LangContext);
  const c = roiCopy[lang];
  const contact = useCopy().contact;
  const [currency, setCurrency] = useState<Currency>("INR");
  const [size, setSize] = useState(0);
  const [revenue, setRevenue] = useState(5e7);
  const [inventory, setInventory] = useState(1e7);
  const [holding, setHolding] = useState(25);
  const [margin, setMargin] = useState(30);
  const [stockouts, setStockouts] = useState(5);
  const [inventoryReduction, setInventoryReduction] = useState(10);
  const [stockReduction, setStockReduction] = useState(20);
  const [freightSpend, setFreightSpend] = useState(175000);
  const [markdownSpend, setMarkdownSpend] = useState(600000);
  const [freightRate, setFreightRate] = useState(40);
  const [markdownRate, setMarkdownRate] = useState(15);
  const [pulse, setPulse] = useState(0);
  const mounted = useRef(false);
  const carrying = (((inventory * holding) / 100) * inventoryReduction) / 100;
  const recovered = (((((revenue * stockouts) / 100) * margin) / 100) * stockReduction) / 100;
  const freight = (freightSpend * freightRate) / 100;
  const markdown = (markdownSpend * markdownRate) / 100;
  const values = [carrying, recovered, freight, markdown];
  const total = values.reduce((a, b) => a + b, 0);
  const format = (n: number) => new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  const short = (n: number) => (currency === "INR" ? `₹${+(n / (n >= 1e7 ? 1e7 : 1e5)).toFixed(2)} ${n >= 1e7 ? "cr" : "lakh"}` : `$${+(n / 1e6).toFixed(2)}M`);
  const load = (curr: Currency, index: number) => {
    const p = presets[curr][index];
    setCurrency(curr);
    setSize(index);
    setRevenue(p.revenue);
    setInventory(p.inventory);
    setHolding(25);
    setMargin(30);
    setStockouts(5);
    setInventoryReduction(10);
    setStockReduction(20);
    setFreightSpend(p.revenue * 0.0035);
    setMarkdownSpend(p.revenue * 0.012);
    setFreightRate(40);
    setMarkdownRate(15);
  };
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setPulse(n => n + 1);
  }, [total]);
  // Once the visitor has worked the calculator, their estimate goes into the contact message.
  const initial = useRef(`${total}/${currency}/${size}`);
  const touched = useRef(false);
  useEffect(() => {
    touched.current ||= `${total}/${currency}/${size}` !== initial.current;
    if (!touched.current) return;
    const id = window.setTimeout(() => visit.set("roi", { label: format(total), line: contact.roi(format(total), c.sizes[size]) }), 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, currency, size, lang]);
  const p = presets[currency][size];
  const sliders = [
    { key: "revenue", label: c.revenue, value: revenue, set: setRevenue, min: p.revenue / 10, max: p.revenue * 5, step: p.revenue / 100, money: true },
    { key: "inventory", label: c.inventory, value: inventory, set: setInventory, min: p.inventory / 10, max: p.inventory * 5, step: p.inventory / 100, money: true },
    { key: "holding", label: c.holding, value: holding, set: setHolding, min: 5, max: 40, step: 1 },
    { key: "margin", label: c.margin, value: margin, set: setMargin, min: 5, max: 80, step: 1 },
    { key: "stockouts", label: c.stockouts, value: stockouts, set: setStockouts, min: 1, max: 20, step: 1 },
  ];
  return (
    <div className="roi-grid">
      <div className="roi-controls">
        <div className="seg seg-dark" role="group" aria-label={c.currency}>
          {(["INR", "USD"] as const).map(curr => (
            <button key={curr} aria-pressed={currency === curr} onClick={() => load(curr, size)}>
              {curr === "INR" ? "₹ INR" : "$ USD"}
            </button>
          ))}
        </div>
        <div className="seg seg-dark" role="group" aria-label={c.preset}>
          {c.sizes.map((label, i) => (
            <button key={i} aria-pressed={size === i} onClick={() => load(currency, i)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="roi-inputs">
        <div className="roi-inputs-head">
          <h3>{c.profile}</h3>
          <button className="link-line" onClick={() => load(currency, size)}>
            <RefreshCw size={14} aria-hidden="true" />
            {c.reset}
          </button>
        </div>
        <p className="mono muted">{c.raw}</p>
        {sliders.map(s => (
          <div className="roi-field" key={s.key}>
            <div className="roi-field-top">
              <label htmlFor={`roi-${s.key}`}>{s.label}</label>
              <span className="number-entry">
                <span aria-hidden="true">{s.money ? (currency === "INR" ? "₹" : "$") : "%"}</span>
                <EditableNumber id={`roi-${s.key}`} label={s.label} value={s.value} min={s.money ? 0 : s.min} max={s.money ? 1e12 : s.max} commit={s.set} />
              </span>
            </div>
            <input
              className="range"
              aria-label={`${s.label} slider`}
              type="range"
              min={Math.min(s.min, s.value)}
              max={Math.max(s.max, s.value)}
              step={s.step}
              value={s.value}
              onChange={e => s.set(+e.target.value)}
              style={{ ["--progress" as string]: `${Math.max(0, Math.min(100, ((s.value - s.min) / (s.max - s.min)) * 100))}%` }}
            />
            <span className="range-limits mono">
              <span>{s.money ? short(s.min) : `${s.min}%`}</span>
              <span>{s.money ? short(s.max) : `${s.max}%`}</span>
            </span>
          </div>
        ))}
        <div className="roi-selects">
          {(
            [
              [c.reduction, inventoryReduction, setInventoryReduction, [10, 15, 20, 25]],
              [c.stockReduction, stockReduction, setStockReduction, [20, 25, 30, 35, 40]],
            ] as const
          ).map(([label, value, set, options]) => (
            <label key={label}>
              <span>{label}</span>
              <select value={value} onChange={e => set(+e.target.value)}>
                {options.map(n => (
                  <option key={n} value={n}>
                    {n}%
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <details className="disclosure">
          <summary>
            {c.assumptions}
            <Plus size={14} aria-hidden="true" />
          </summary>
          <div className="assumptions">
            {(
              [
                [c.freight, freightSpend, setFreightSpend],
                [c.markdown, markdownSpend, setMarkdownSpend],
                [c.freightRate, freightRate, setFreightRate],
                [c.markdownRate, markdownRate, setMarkdownRate],
              ] as const
            ).map(([label, value, set], i) => (
              <label key={label}>
                <span>{label}</span>
                <EditableNumber label={label} value={value} min={0} max={i < 2 ? 1e12 : 100} commit={set} />
              </label>
            ))}
          </div>
        </details>
      </div>
      <div className="roi-result">
        <span className="mono accent">{c.impact}</span>
        <p className="roi-total display" data-testid="roi-total" key={pulse}>
          {format(total)}
        </p>
        <span className="muted">{c.sub}</span>
        <ul className="roi-rows">
          {values.map((n, i) => (
            <li key={c.rows[i]}>
              <span>{c.rows[i]}</span>
              <strong>+{format(n)}</strong>
              <i style={{ transform: `scaleX(${total ? n / total : 0})` }} aria-hidden="true" />
            </li>
          ))}
        </ul>
        <p className="mono muted fine">{c.note}</p>
        <details className="disclosure">
          <summary>
            {c.formula}
            <Plus size={14} aria-hidden="true" />
          </summary>
          <div className="formula mono">
            <p>
              {c.rows[0]} = {format(inventory)} × {holding}% × {inventoryReduction}%
            </p>
            <p>
              {c.rows[1]} = {format(revenue)} × {stockouts}% × {margin}% × {stockReduction}%
            </p>
            <p>
              {c.rows[2]} = {format(freightSpend)} × {freightRate}%
            </p>
            <p>
              {c.rows[3]} = {format(markdownSpend)} × {markdownRate}%
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}

function Stories() {
  const t = useT();
  const c = useCopy().proof;
  const [region, setRegion] = useState<"all" | "india" | "global">("all");
  const rows = storyMeta.map((meta, i) => ({ meta, text: t.stories.items[i] })).filter(({ meta }) => region === "all" || meta.region === region);
  return (
    <section id="stories" className="chapter light ledger" aria-labelledby="stories-title">
      <div className="wrap">
        <header className="ledger-head">
          <p className="plate mono">
            <b>05·2</b> {t.stories.eyebrow}
          </p>
          <RevealHeading id="stories-title" className="display ledger-title" lines={[t.stories.title]} />
          <p className="muted measure">{c.evidence}. {t.stories.footnote}</p>
          <div className="seg" role="group" aria-label={t.stories.eyebrow}>
            {(["all", "india", "global"] as const).map(r => (
              <button key={r} aria-pressed={region === r} onClick={() => setRegion(r)}>
                {t.stories[r]}
              </button>
            ))}
          </div>
        </header>
        <div className="ledger-row ledger-cols mono" aria-hidden="true">
            <span>{c.year}</span>
            <span>{c.company}</span>
            <span />
            <span>{c.what}</span>
          </div>
        <ul className="ledger-table">
          {rows.map(({ meta, text }) => (
            <li key={meta.year + text.company}>
            <details className="ledger-entry">
              <summary className="ledger-row">
                <span className="mono ledger-year">
                  {meta.year}
                  {meta.region === "india" && <em>{t.stories.india}</em>}
                </span>
                <span className="ledger-company">{text.company}</span>
                <span className="ledger-stat">
                  <strong>{text.stat}</strong>
                  <span className="mono">{text.statLabel}</span>
                </span>
                <span className="ledger-what">
                  {text.title}
                  <span className="ledger-open mono">
                    {c.read}
                    <Plus size={13} aria-hidden="true" />
                  </span>
                </span>
              </summary>
              <div className="ledger-detail">
                <p>{text.story}</p>
                <div>
                  <span className="mono accent">{t.stories.lesson}</span>
                  <p>{text.lesson}</p>
                </div>
                <p className="mono ledger-sources">
                  {t.stories.source}:{" "}
                  {meta.sources.map((s, n) => (
                    <span key={s.url}>
                      {n > 0 && " · "}
                      <a href={s.url} target="_blank" rel="noreferrer">
                        {s.label}
                        <ArrowUpRight size={11} aria-hidden="true" />
                      </a>
                    </span>
                  ))}
                </p>
              </div>
            </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Trust() {
  const t = useT();
  return (
    <section id="security" className="chapter trust" aria-labelledby="trust-title">
      <div className="wrap trust-grid">
        <div>
          <p className="plate mono">
            <b>05·3</b> {t.security.eyebrow}
          </p>
          <h2 id="trust-title" className="display trust-title">
            {t.security.title}
          </h2>
          <p className="muted">{t.security.desc}</p>
        </div>
        <ul className="trust-list">
          {t.security.items.map((s, i) => (
            <li key={i}>
              <span className="mono">0{i + 1}</span>
              <strong>{s.title}</strong>
              <span className="muted">{s.desc}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Proof() {
  const t = useT();
  const c = useCopy();
  const section = useReveal<HTMLElement>(0.08);
  return (
    <>
      <section ref={section} id="roi" className="chapter roi" aria-labelledby="roi-title">
        <div className="wrap">
          <header className="roi-head">
            <p className="plate mono rule-in">
              <b>05</b> {c.proof.plate} · {t.roi.eyebrow}
            </p>
            <RevealHeading id="roi-title" className="display h2 roi-title" lines={[t.roi.title]} />
            <p className="lead muted fade">{t.roi.desc}</p>
          </header>
          <ROI />
        </div>
      </section>
      <Stories />
      <Trust />
    </>
  );
}
