import { useEffect, useRef, useState, useMemo, useId, useCallback } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useSpring,
  MotionConfig,
  useTransform,
} from "framer-motion";
import {
  ArrowUpRight,
  ArrowRight,
  ChevronDown,
  Check,
  Plus,
  X,
  Menu,
  Activity,
  ShieldCheck,
  Database,
  Shirt,
  Cpu,
  Pill,
  Sprout,
  Wrench,
  TrendingUp,
  Network,
  Bot,
  Tags,
  PackageCheck,
  Copy,
  Mail,
  Lock,
  Terminal,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  Clock,
  Search,
  CheckCircle2,
  Zap,
  AlertTriangle,
  Coins,
  PackageX,
  Warehouse,
  FileSpreadsheet,
  Sparkles,
  CloudSun,
  MapPin,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import ROICalculator from "./ROICalculator";
import { ProductFilm, StockTransfer, useMotionCopy } from "./MotionExtras";
import {
  industries,
  connectors,
  optimizers,
  problemIcons,
  storyMeta,
} from "./data";
import { LangContext, useT, dict, languages, type Lang } from "./i18n";

const EMAIL = "baltej.panagatla@gmail.com";
const WHATSAPP_NUMBER = "917993969656";
const WHATSAPP_DISPLAY = "+91 79939 69656";
const mailLink = `mailto:${EMAIL}?subject=${encodeURIComponent(
  "SANKET enquiry",
)}&body=${encodeURIComponent(
  "Hi,\n\nI'd like to see how SANKET could work for our business.\n\nCompany:\nWhat we sell:\nBiggest inventory challenge:\n\nThanks",
)}`;
const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}

const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
const icons = {
  Shirt,
  Cpu,
  Pill,
  Sprout,
  Wrench,
  Network,
  Bot,
  Tags,
  PackageCheck,
  PackageX,
  Warehouse,
  FileSpreadsheet,
  Sparkles,
  CloudSun,
  MapPin,
};
function Logo({ plain = false }: { plain?: boolean }) {
  if (plain) return <a href="#" className="logo" aria-label="Sanket home">SANKET</a>;
  return (
    <a href="#" className="logo" aria-label="Sanket home">
      <span className="logo-mark">
        <svg viewBox="0 0 32 32" fill="none">
          <path
            d="m6 25 10-20 10 20M10.5 17h11"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <path
            d="M16 5v20"
            stroke="currentColor"
            strokeWidth="1"
            opacity=".45"
          />
        </svg>
      </span>
      SANKET
      <span className="logo-divider" />
      <span className="prisma">PRISMA</span>
    </a>
  );
}
function Count({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const spring = useSpring(0, { stiffness: 65, damping: 23 });
  const display = useTransform(
    spring,
    (v) =>
      `${prefix}${v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`,
  );
  useEffect(() => {
    if (seen) spring.set(value);
  }, [seen, value, spring]);
  return (
    <motion.span ref={ref}>
      {reduce
        ? `${prefix}${value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`
        : display}
    </motion.span>
  );
}
function SectionHeading({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {desc && <p>{desc}</p>}
    </div>
  );
}
function Magnetic({
  children,
  href,
  className = "primary",
  label,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
  label?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const external = href.startsWith("http");
  return (
    <motion.a
      ref={ref}
      href={href}
      aria-label={label}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={`button ${className}`}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        gsap.to(e.currentTarget, {
          x: (e.clientX - r.left - r.width / 2) * 0.12,
          y: (e.clientY - r.top - r.height / 2) * 0.12,
          duration: 0.3,
        });
      }}
      onPointerLeave={() => {
        gsap.to(ref.current, { x: 0, y: 0, duration: 0.4 });
      }}
    >
      {children}
    </motion.a>
  );
}

function ContactButtons() {
  const t = useT();
  return (
    <div className="contact-buttons">
      <Magnetic href={whatsappLink(t.cta.waMessage)}>
        <WhatsAppIcon size={18} />
        {t.cta.whatsapp}
      </Magnetic>
      <Magnetic href={mailLink} className="secondary">
        <Mail size={17} />
        {t.cta.email}
      </Magnetic>
    </div>
  );
}

function Forecast({
  compact = false,
  product = "Essential cotton tee",
  onDecision,
}: {
  compact?: boolean;
  product?: string;
  onDecision?: (quantity: number) => void;
}) {
  const [scenario, setScenario] = useState("Baseline");
  const [horizon, setHorizon] = useState(13);
  const [offset, setOffset] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const gradientId = useId().replace(/:/g, "");
  const data = useMemo(
    () =>
      Array.from({ length: horizon }, (_, i) => {
        const p = i < 5 ? 0 : (i - 4) / (horizon - 4);
        const base = 1060 + Math.sin(i * 0.7) * 100 + i * 14;
        const change =
          scenario === "Viral spike"
            ? Math.sin(p * Math.PI * 0.8) * 590
            : scenario === "Price cut"
              ? -p * 280
              : 0;
        const mid = Math.round(base + change + offset * p);
        const spread = 80 + i * 15;
        return {
          week: `W${i + 1}`,
          median: mid,
          band: [Math.max(0, mid - spread), mid + spread],
          observed: i < 5 ? mid + Math.sin(i) * 42 : null,
        };
      }),
    [scenario, horizon, offset],
  );
  const quantity = Math.max(0, Math.round((data[data.length - 1].median * 2 - 1386) / 10) * 10);
  useEffect(() => { onDecision?.(quantity); }, [quantity, onDecision]);
  const c = useMotionCopy();
  const yMax = Math.max(2400, Math.ceil(Math.max(...data.map(d => d.band[1])) / 400) * 400);
  return (
    <div className={`forecast ${compact ? "compact" : ""}`}>
      <div className="forecast-top">
        <div className="forecast-title">
          <span className="app-icon">
            <Activity size={17} />
          </span>
          <div>
            <strong>Demand intelligence</strong>
            <span>
              {product} <span className="dot-text">/</span> SKU-1042
            </span>
          </div>
        </div>
        <span className="pill good">
          <span className="status-dot" />
          Model calibrated
        </span>
      </div>
      <div className="forecast-toolbar">
        <div
          className="tabs scenario"
          role="group"
          aria-label="Forecast scenario"
        >
          {["Baseline", "Price cut", "Viral spike"].map((s) => (
            <button
              key={s}
              aria-pressed={scenario === s}
              className={scenario === s ? "active" : ""}
              onClick={() => setScenario(s)}
            >
              {s === "Viral spike" && <Zap size={12} />} {s}
            </button>
          ))}
        </div>
        <label className="select-wrap">
          <select
            aria-label="Forecast horizon"
            value={horizon}
            onChange={(e) => setHorizon(+e.target.value)}
          >
            {[13, 26, 52].map((v) => (
              <option key={v} value={v}>
                {v}-week horizon
              </option>
            ))}
          </select>
          <ChevronDown size={13} />
        </label>
      </div>
      <div className="chart-stats">
        <div>
          <span>Expected demand</span>
          <strong>
            <Count value={data[data.length - 1].median} />{" "}
            <small>units / week</small>
          </strong>
        </div>
        <span className="chart-delta">
          <TrendingUp size={14} />{" "}
          {scenario === "Price cut"
            ? "−18.6%"
            : scenario === "Viral spike"
              ? "+38.2%"
              : "+12.4%"}{" "}
          vs. prior period
        </span>
      </div>
      <div
        className="chart"
        aria-label="Probabilistic demand forecast. Drag horizontally to adjust demand."
        onPointerDown={(e) => {
          if (e.target instanceof Element && e.target.closest("select,button"))
            return;
          setDrag(e.clientX);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (drag !== null) {
            setOffset((o) =>
              Math.max(-350, Math.min(350, o + (e.clientX - drag) * 2)),
            );
            setDrag(e.clientX);
          }
        }}
        onPointerUp={() => setDrag(null)}
        onPointerCancel={() => setDrag(null)}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 12, left: -12, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#93b8ff" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#dbeafe" stopOpacity={0.25} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="#e8edf4"
              vertical={false}
              strokeDasharray="3 4"
            />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              interval={horizon > 13 ? 4 : 2}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              domain={[400, yMax]}
              ticks={Array.from({length:6},(_,i)=>Math.round((400+(yMax-400)*i/5)/100)*100)}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
              formatter={(v, name) =>
                name === "band"
                  ? [
                      Array.isArray(v) ? `${v[0]}–${v[1]} units` : v,
                      "p10–p90 range",
                    ]
                  : [v, name === "median" ? "p50 expected" : "Observed"]
              }
            />
            <ReferenceLine
              x="W5"
              stroke="#a0aec0"
              strokeDasharray="4 4"
              label={{
                value: "FORECAST →",
                position: "insideTopRight",
                fill: "#64748b",
                fontSize: 11,
              }}
            />
            <Area
              type="monotone"
              dataKey="band"
              stroke="none"
              fill={`url(#${gradientId})`}
              isAnimationActive={!reduced && drag === null}
              animationDuration={300}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="median"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={!reduced && drag === null}
              animationDuration={300}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="observed"
              stroke="#0f172a"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls={false}
              isAnimationActive={!reduced && drag === null}
              animationDuration={300}
              animationEasing="ease-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-footer">
        <div className="legend">
          <span>
            <i className="observed" />
            Actual demand
          </span>
          <span>
            <i />
            p50 forecast
          </span>
          <span>
            <i className="range" />
            p10–p90 interval
          </span>
        </div>
        <details className="technical-details"><summary>{c.technical}</summary><p>Forecast range: p10–p90. The centre line is the median (p50). SLSQP quantile stacking / pinball loss are architecture concepts; this sandbox uses simulated data.</p></details>
      </div>
      {!compact && (
        <div className="forecast-note">
          <SlidersHorizontal size={13} />
          <label>
            Demand adjustment{" "}
            <input
              aria-label="Demand adjustment"
              type="range"
              min="-350"
              max="350"
              value={offset}
              onChange={(e) => setOffset(+e.target.value)}
            />
          </label>
          <span>
            {offset > 0 ? "+" : ""}
            {offset} units
          </span>
          <button
            onClick={() => {
              setOffset(0);
              setScenario("Baseline");
            }}
            aria-label="Reset forecast"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

function tabKeys(e: React.KeyboardEvent<HTMLButtonElement>, index: number, count: number, select: (n: number) => void, prefix: string) {
  let next = index;
  if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % count;
  else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index - 1 + count) % count;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = count - 1;
  else return;
  e.preventDefault(); select(next); document.getElementById(prefix + next)?.focus();
}

function Demo() {
  const t = useT();
  const [quantity, setQuantity] = useState(1240);
  const updateDecision = useCallback((n: number) => setQuantity(n), []);
  return (<section className="section command" id="command">
            <div className="heading-split">
              <SectionHeading
                eyebrow={t.command.eyebrow}
                title={t.command.title}
                desc={t.command.desc}
              />
              <span className="pill blue">
                <span className="status-dot" />
                {t.command.sandbox}
              </span>
            </div>
            <div className="command-layout">
              <Forecast onDecision={updateDecision} />
              <aside className="command-sidebar">
                <div className="command-metric card">
                  <span className="mono">FORECAST ERROR / EXAMPLE</span>
                  <strong>
                    <Count value={18.42} decimals={2} suffix="%" />
                  </strong>
                  <span>Forecast error · illustrative example</span>
                  <div className="metric-line">
                    <span className="pill good">
                      <TrendingUp size={11} />
                      38% skill gain
                    </span>
                    <span>vs. seasonal naive</span>
                  </div>
                  <div className="spark-bars">
                    {[44, 56, 35, 64, 50, 72, 65, 83, 72, 91, 87, 100].map(
                      (h, i) => (
                        <span
                          style={{ height: h / 2, opacity: 0.25 + i * 0.06 }}
                          key={i}
                        />
                      ),
                    )}
                  </div>
                </div>
                <div className="decision-card card">
                  <span className="pill good">
                    <Check size={12} />
                    NEXT BEST ACTION
                  </span>
                  <h3>Stay ahead of demand.</h3>
                  <p>
                    Change the demand scenario. See how the suggested order changes.
                  </p>
                  <div className="decision-quantity" key={quantity} aria-live="polite">
                    <PackageCheck size={19} />
                    <strong>
                      {quantity.toLocaleString("en-US")} <span>units to reorder</span>
                    </strong>
                  </div>
                  <span className="mono">EXAMPLE / TWO-WEEK LEAD TIME</span>
                </div>
              </aside>
            </div>
          </section>);
}

function Problems() {
  const t = useT();
  const [active, setActive] = useState(0);
  const p = t.problems.items[active];
  const Icon = icons[problemIcons[active] as keyof typeof icons];
  return (
    <section className="section problems" id="problems">
      <SectionHeading
        eyebrow={t.problems.eyebrow}
        title={t.problems.title}
        desc={t.problems.desc}
      />
      <div className="problems-layout">
        <div className="problem-list" role="tablist" aria-label={t.problems.eyebrow}>
          {t.problems.items.map((item, i) => {
            const I = icons[problemIcons[i] as keyof typeof icons];
            return (
              <button
                key={i}
                role="tab"
                id={`problem-tab-${i}`}
                aria-selected={active === i}
                aria-controls="problem-panel"
                className={active === i ? "active" : ""}
                onClick={() => setActive(i)}
                tabIndex={active === i ? 0 : -1}
                onKeyDown={e => tabKeys(e, i, t.problems.items.length, setActive, "problem-tab-")}
              >
                {active === i && <motion.span className="tab-indicator" layoutId="problem-selection" transition={{duration:.2}}/>}
                <span className="problem-icon">
                  <I size={18} />
                </span>
                {item.short}
                <ArrowRight size={15} className="problem-arrow" />
              </button>
            );
          })}
        </div>
        <div
          className="problem-panel card"
          id="problem-panel"
          role="tabpanel"
          aria-labelledby={`problem-tab-${active}`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <span className="problem-panel-icon">
                <Icon size={24} />
              </span>
              <h3>{p.title}</h3>
              <p className="problem-feel">{p.feel}</p>
              <div className="problem-cost">
                <AlertTriangle size={16} />
                <span>{p.cost}</span>
              </div>
              <div className="problem-fix">
                <span className="mono">{t.problems.withSanket}</span>
                <p>{p.fix}</p>
              </div>
              <div className="problem-outcome">
                <strong>{p.value}</strong>
                <span>{p.label}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <p className="section-footnote">{t.problems.footnote}</p>
    </section>
  );
}

function Stories() {
  const t = useT();
  const c = useMotionCopy();
  const [region, setRegion] = useState<"all" | "india" | "global">("all");
  const shown = storyMeta
    .map((meta, i) => ({ meta, text: t.stories.items[i] }))
    .filter(({ meta }) => region === "all" || meta.region === region);
  return (
    <section className="section stories" id="stories">
      <div className="heading-split">
        <SectionHeading
          eyebrow={t.stories.eyebrow}
          title={t.stories.title}
          desc={c.evidence}
        />
        <div className="tabs story-filter" role="group" aria-label={t.stories.eyebrow}>
          {(["all", "india", "global"] as const).map((r) => (
            <button
              key={r}
              aria-pressed={region === r}
              className={region === r ? "active" : ""}
              onClick={() => setRegion(r)}
            >
              {t.stories[r]}
            </button>
          ))}
        </div>
      </div>
      <p className="evidence-note">{t.stories.footnote}</p>
      <div className="stories-grid" key={region}>
        {shown.map(({ meta, text }) => (
          <article className="story card" key={meta.year + text.company}>
            <div className="story-head">
              <strong>{text.company}</strong>
              <span className={meta.region === "india" ? "india" : ""}>
                {meta.region === "india" ? `${t.stories.india} · ` : ""}
                {meta.year}
              </span>
            </div>
            <div className="story-stat">
              <strong>{text.stat}</strong>
              <span>{text.statLabel}</span>
            </div>
            <h3>{text.title}</h3>
            <details className="story-expand"><summary>{c.read}<ChevronDown size={15}/></summary>
            <p>{text.story}</p>
            <div className="story-lesson">
              <span className="mono">{t.stories.lesson}</span>
              <p>{text.lesson}</p>
            </div>
            <div className="story-sources">
              {t.stories.source}:{" "}
              {meta.sources.map((src, n) => (
                <span key={src.url}>
                  {n > 0 && " · "}
                  <a href={src.url} target="_blank" rel="noreferrer">
                    {src.label}
                    <ExternalLink size={11} />
                  </a>
                </span>
              ))}
            </div>
            </details>
          </article>
        ))}
      </div>
      <p className="section-footnote">{t.stories.footnote}</p>
    </section>
  );
}

function HowItWorks() {
  const t = useT();
  const reduced = useReducedMotion();
  const stepIcons = [Database, TrendingUp, PackageCheck];
  const benefitIcons = [PackageCheck, Coins, Clock, ShieldCheck];
  return (
    <section className="section how" id="how">
      <SectionHeading eyebrow={t.how.eyebrow} title={t.how.title} desc={t.how.desc} />
      <ol className="how-steps">
        {t.how.steps.map((s, i) => {
          const I = stepIcons[i];
          return (
            <motion.li
              key={i}
              className="card"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
            >
              <motion.div className="step-progress" aria-hidden="true" initial={reduced ? false : {scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true}} transition={{duration:.7,delay:i*.28+.2}}/>
              <span className="how-number">0{i + 1}</span>
              <span className="how-icon">
                <I size={22} />
              </span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <div className="how-chips">
                {s.chips.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
            </motion.li>
          );
        })}
      </ol>
      <div className="benefits">
        {t.how.benefits.map((b, i) => {
          const I = benefitIcons[i];
          return (
            <div key={i}>
              <I size={20} />
              <strong>{b.title}</strong>
              <span>{b.desc}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Workspace() {
  const t = useT();
  const c = useMotionCopy();
  const [selected, setSelected] = useState(0);
  const industry = industries[selected];
  const Icon = icons[industry.icon as keyof typeof icons];
  return (
    <section className="section workspace" id="industries">
      <SectionHeading
        eyebrow={t.industries.eyebrow}
        title={t.industries.title}
        desc={t.industries.desc}
      />
      <div
        className="industry-tabs"
        role="tablist"
        aria-label="Industry workspace"
      >
        {industries.map((i, n) => {
          const I = icons[i.icon as keyof typeof icons];
          return (
            <button
              key={i.name}
              role="tab"
              aria-selected={n === selected}
              aria-controls="industry-panel"
              id={`industry-tab-${n}`}
              className={n === selected ? "active" : ""}
              tabIndex={selected === n ? 0 : -1}
              onKeyDown={e => tabKeys(e, n, industries.length, setSelected, "industry-tab-")}
              onClick={() => setSelected(n)}
            >
              {selected === n && <motion.span className="tab-indicator" layoutId="industry-selection" transition={{duration:.2}}/>}
              <I size={17} />
              {i.short}
            </button>
          );
        })}
      </div>
      <div
        className="workspace-panel"
        id="industry-panel"
        role="tabpanel"
        aria-labelledby={`industry-tab-${selected}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            className="workspace-copy"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            <span className="industry-icon">
              <Icon size={25} />
            </span>
            <span className="eyebrow">{industry.name}</span>
            <h3>{industry.tag}</h3>
            <p>{industry.desc}</p>
            <ul className="check-list">
              {industry.features.map((f) => (
                <li key={f}>
                  <CheckCircle2 size={16} />
                  {f}
                </li>
              ))}
            </ul>
            <div className="industry-metric">
              <strong>{industry.metric}</strong>
              <span>{industry.label}</span>
            </div>
            <span className="mono isolated"><Lock size={12}/>Private workspace</span>
            <details className="technical-details"><summary>{c.technical}</summary><p>Separate database access rules for each business (tenant isolation / row-level security). Architecture demonstration.</p></details>
          </motion.div>
        </AnimatePresence>
        <div className="workspace-chart">
          <div className="workspace-browser">
            <span />
            <span />
            <span />
            <div>workspace.sanket / {industry.short.toLowerCase()}</div>
            <Lock size={11} />
          </div>
          <Forecast compact product={industry.product} />
          <div className="workspace-bottom">
            <span className="pill good">
              <Check size={12} />
              Scope enforced
            </span>
            <span>Sandbox workspace · illustrative telemetry</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Optimization() {
  const t = useT();
  const c = useMotionCopy();
  const [active, setActive] = useState(0);

  const [category, setCategory] =
    useState<keyof typeof connectors>("Global commerce");
  const [query, setQuery] = useState("");
  const [connector, setConnector] = useState<string | null>(null);
  return (
    <section className="section optimizers" id="platform">
      <SectionHeading
        eyebrow={t.platform.eyebrow}
        title={t.platform.title}
        desc={t.platform.desc}
      />
      <StockTransfer />
      <div className="optimizer-grid">
        {optimizers.map((o, i) => {
          const Icon = icons[o.icon as keyof typeof icons];
          return (
            <button
              key={o.name}
              className={`optimizer-card card ${active === i ? "selected" : ""}`}
              onClick={() => setActive(i)}
              aria-pressed={active === i}
            >
              <span className="optimizer-icon">
                <Icon size={22} />
              </span>
              <span className="mono">0{i + 1} / DECISION ENGINE</span>
              <h3>{o.name}</h3>
              <p>{o.desc}</p>
              <span className="optimizer-action">
                Inspect decision <ArrowUpRight size={16} />
              </span>
            </button>
          );
        })}
      </div>
      <div className="decision-preview" key={active} aria-live="polite">
        <span className="decision-pulse" aria-hidden="true"/>
        <span className="pill good">
          <Check size={12} />
          Sandbox decision
        </span>
        <strong>{optimizers[active].result}</strong>
        <span>{optimizers[active].detail}</span>
        <details className="technical-details"><summary>{c.technical}</summary><p>{optimizers[active].label} · {optimizers[active].file} · Simulated recommendation.</p></details>
      </div>
      <div className="connectors">
        <div className="connector-heading">
          <div>
            <span className="eyebrow">{t.platform.connectEyebrow}</span>
            <h3>{t.platform.connectTitle}</h3>
          </div>
          <label className="search-input">
            <Search size={15} />
            <input
              aria-label="Search connectors"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.platform.search}
            />
          </label>
        </div>
        <div className="tabs connector-tabs">
          {(Object.keys(connectors) as (keyof typeof connectors)[]).map((c) => (
            <button
              key={c}
              aria-pressed={category === c}
              className={category === c ? "active" : ""}
              onClick={() => {
                setCategory(c);
                setConnector(null);
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="connector-grid" key={category + query}>
          {connectors[category]
            .filter((c) => c.toLowerCase().includes(query.toLowerCase()))
            .map((c) => (
              <button onClick={() => setConnector(c)} key={c}>
                <Database size={15} />
                {c}
                <ArrowUpRight size={12} />
              </button>
            ))}
          {!connectors[category].some((c) =>
            c.toLowerCase().includes(query.toLowerCase()),
          ) && <p>No matching integrations in this category.</p>}
        </div>
        {connector && (
          <div className="connector-detail">
            <CheckCircle2 size={16} />
            <strong>{connector}</strong>
            <span>
              {category === "India ERP"
                ? "XML / HTTP bridge"
                : "API / batch ingestion"}{" "}
              · Tenant-scoped configuration · Credentials required to connect
            </span>
            <button
              onClick={() => setConnector(null)}
              aria-label="Close connector details"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Trust() {
  const t = useT();
  const reduced = useReducedMotion();
  const securityIcons = [Database, Lock, Terminal, ShieldCheck];
  return (
    <section className="section trust" id="security">
      <SectionHeading
        eyebrow={t.security.eyebrow}
        title={t.security.title}
        desc={t.security.desc}
      />
      <div className="benefits security-grid">
        {t.security.items.map((s, i) => {
          const I = securityIcons[i];
          return (
            <motion.div key={i} initial={reduced ? false : {opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.35,delay:i*.09}}>
              <I size={20} /><strong>{s.title}</strong><span>{s.desc}</span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function HeroVideo({ label }: { label: string }) {
  const reduced = useReducedMotion();
  return (
    <div className="hero-video">
      {reduced ? (
        <img src="/assets/hero-loop-poster.jpg" alt={label} />
      ) : (
        <video
          src="/assets/hero-loop.mp4"
          poster="/assets/hero-loop-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label={label}
        />
      )}
    </div>
  );
}

function readLang(): Lang {
  try {
    const saved = localStorage.getItem("sanket-lang");
    if (saved === "en" || saved === "hi" || saved === "te") return saved;
  } catch {
    // storage unavailable: fall back to English
  }
  return "en";
}

export default function App() {
  const [lang, setLang] = useState<Lang>(readLang);
  const t = dict[lang];
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [activeNav, setActiveNav] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const reduced = useReducedMotion();
  const wa = whatsappLink(t.cta.waMessage);
  const notify = (s: string) => {
    setToast(s);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3500);
  };
  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("sanket-lang", lang);
    } catch {
      // storage unavailable: language just won't persist
    }
  }, [lang]);
  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ duration: 1.05, anchors: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      lenis.destroy();
      gsap.ticker.remove(tick);
    };
  }, [reduced]);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".section-heading").forEach((el) =>
        gsap.fromTo(
          el,
          { y: 25, opacity: 0.2 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          },
        ),
      );
    });
    return () => ctx.revert();
  }, [reduced]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveNav(e.target.id);
        });
      },
      { rootMargin: "-15% 0px -65% 0px" },
    );
    document
      .querySelectorAll("section[id]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return (
    <LangContext.Provider value={lang}>
      <MotionConfig reducedMotion="user">
      <div
        className={`lang-${lang}`}
        onPointerMove={(e) => {
          const card = (e.target as HTMLElement).closest<HTMLElement>(
            ".optimizer-card",
          );
          if (card) {
            const rect = card.getBoundingClientRect();
            card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
            card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
          }
        }}
      >
        <a href="#main" className="skip-link">
          {t.skip}
        </a>
        <header className="header">
          <div className="nav-container">
            <Logo plain />
            <nav aria-label="Main navigation" className={menu ? "open" : ""}>
              {(
                [
                  ["problems", t.nav.problems],
                  ["how", t.nav.how],
                  ["command", lang === "hi" ? "डेमो" : lang === "te" ? "డెమో" : "Try the demo"],
                  ["industries", t.nav.industries],
                  ["roi", t.nav.roi],
                ] as const
              ).map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setMenu(false)}
                  className={activeNav === id ? "active" : ""}
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="nav-actions">
              <div className="lang-switch" role="group" aria-label={t.langLabel}>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    lang={l.code}
                    aria-pressed={lang === l.code}
                    aria-label={l.name}
                    title={l.name}
                    className={lang === l.code ? "active" : ""}
                    onClick={() => setLang(l.code)}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <Magnetic href={wa} className="primary nav-cta" label={t.cta.whatsappShort}>
                <WhatsAppIcon size={16} />
                <span>{t.cta.whatsappShort}</span>
              </Magnetic>
              <button
                className="menu-toggle"
                aria-label={menu ? "Close menu" : "Open menu"}
                aria-expanded={menu}
                onClick={() => setMenu(!menu)}
              >
                {menu ? <X size={21} /> : <Menu size={21} />}
              </button>
            </div>
          </div>
        </header>
        <main id="main">
          <section className="hero">
            <div className="hero-grid" />
            <div className="hero-layout container">
              <motion.div
                className="hero-copy"
                initial={reduced ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75 }}
              >
                <a href="#problems" className="release-pill">
                  <span className="status-dot" />
                  {t.hero.pill}
                  <span className="pill-arrow">
                    <ArrowRight size={12} />
                  </span>
                </a>
                <h1>
                  {t.hero.h1a} <span>{t.hero.h1b}</span>
                </h1>
                <p className="hero-lead">
                  {t.hero.leadPre}
                  <strong>{t.hero.leadStrong}</strong>
                  {t.hero.leadPost}
                </p>
                <p className="hero-desc">{t.hero.desc}</p>
                <div className="hero-ctas">
                  <ContactButtons />
                </div>
                <div className="hero-proof">
                  <span>
                    <Check size={13} />
                    {t.hero.proof}
                  </span>
                  <span className="hero-source">{t.hero.source}</span>
                </div>
              </motion.div>
              <motion.div
                className="hero-art"
                initial={reduced ? false : { opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <HeroVideo label={t.hero.videoLabel} />
              </motion.div>
            </div>
          </section>
          <Problems />
          <Stories />
          <HowItWorks />
          <ProductFilm />
          <Demo />
          <Workspace />
          <Optimization />
          <ROICalculator />
          <Trust />
          <section className="contact-section">
            <div className="container">
              <span className="eyebrow">{t.contact.eyebrow}</span>
              <h2>
                {t.contact.h2a}{" "}
                <br />
                {t.contact.h2b}
                <span>SANKET</span>
                {t.contact.h2c}
              </h2>
              <p>{t.contact.p}</p>
              <div className="contact-cards">
                <a
                  className="contact-card whatsapp"
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="contact-card-icon">
                    <WhatsAppIcon size={24} />
                  </span>
                  <span className="contact-card-text">
                    <strong>{t.cta.whatsapp}</strong>
                    <span>{WHATSAPP_DISPLAY}</span>
                    <small>{t.contact.waNote}</small>
                  </span>
                  <ArrowUpRight size={18} />
                </a>
                <a className="contact-card" href={mailLink}>
                  <span className="contact-card-icon">
                    <Mail size={22} />
                  </span>
                  <span className="contact-card-text">
                    <strong>{t.contact.emailTitle}</strong>
                    <span>{EMAIL}</span>
                    <small>{t.contact.emailNote}</small>
                  </span>
                  <ArrowUpRight size={18} />
                </a>
              </div>
              <button
                className="text-button copy-email"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(EMAIL);
                    notify(t.contact.copied);
                  } catch {
                    notify(t.contact.copyFail);
                  }
                }}
              >
                {toast === t.contact.copied ? <Check size={14}/> : <Copy size={14}/>}
                {toast === t.contact.copied ? t.contact.copied : t.contact.copy}
              </button>
            </div>
            <div className="contact-decoration" />
          </section>
        </main>
        <footer>
          <div className="container footer-top">
            <Logo />
            <span>{t.footer.tagline}</span>
            <a href="#main" className="back-top">
              {t.footer.back} <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="container footer-bottom">
            <span>
              © {new Date().getFullYear()} SANKET / PRISMA. {t.footer.rights}
            </span>
            <div>
              <a href={mailLink}>{t.cta.email}</a>
              <a href={wa} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </div>
          </div>
        </footer>
        <AnimatePresence>
          {toast && (
            <motion.div
              className="toast"
              role="status"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CheckCircle2 size={17} />
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </MotionConfig>
    </LangContext.Provider>
  );
}
