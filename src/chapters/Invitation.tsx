import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowUpRight, Check, Copy, Mail, X } from "lucide-react";
import { LangContext, useT } from "../i18n";
import { useCopy } from "../copy";
import { useFieldScene } from "../field/useFieldScene";
import { fieldStore } from "../field/store";
import { prefersReducedMotion, ScrollTrigger, useMagnetic, useReveal } from "../lib/motion";
import { useMotion } from "../lib/prefs";
import { toast } from "../components/Toast";
import { EMAIL, WHATSAPP_DISPLAY, useContactLinks } from "../lib/contact";
import { useVisit, visit } from "../lib/visit";
import { Mark, WhatsAppIcon } from "../components/Icons";
import { RevealHeading } from "../components/Words";

/** A stable pseudo-random offset per position, in -1..1. */
const jitter = (n: number) => {
  const x = Math.sin(n * 12.9898 + 4.1) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};

/**
 * The first line of the contact title is uneven stock: each letter (each word in Hindi and
 * Telugu, so conjuncts stay whole) sits at its own height and levels as the chapter scrolls in,
 * flush by the time the field reads "in stock". Transform only; level at once when calm.
 */
function LevelLine({ text, latin }: { text: string; latin: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const calm = useMotion() === "calm";
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (calm || prefersReducedMotion()) {
      el.style.setProperty("--lv", "0");
      return;
    }
    const st = ScrollTrigger.create({
      trigger: el.closest("section"),
      start: "top bottom",
      end: "top 25%",
      onUpdate: self => el.style.setProperty("--lv", (1 - self.progress).toFixed(3)),
      onRefresh: self => el.style.setProperty("--lv", (1 - self.progress).toFixed(3)),
    });
    return () => st.kill();
  }, [calm]);
  // Latin: letters, grouped per word so lines only break between words. Indic: whole words.
  let i = 0;
  const lc = (u: string) => (
    <span key={i} className="lc" style={{ ["--off" as string]: `${(jitter(i++) * 0.36).toFixed(3)}em` }}>
      {u}
    </span>
  );
  const words = text.split(" ");
  return (
    <span ref={ref} className="level-line">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, n) => (
          <Fragment key={n}>
            {latin ? <span className="lw">{[...w].map(lc)}</span> : lc(w)}
            {n < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </span>
  );
}

export function Invitation() {
  const t = useT();
  const lang = useContext(LangContext);
  const c = useCopy();
  const section = useReveal<HTMLElement>(0.25);
  const [copied, setCopied] = useState<"" | "ok" | "fail">("");
  const timer = useRef<number>();
  const wa = useMagnetic<HTMLAnchorElement>(0.12);
  const mail = useMagnetic<HTMLAnchorElement>(0.12);
  const links = useContactLinks();
  const explored = useVisit();
  useFieldScene(section, { shot: "level", signal: 0, forecast: 0, level: 1, focus: -1 });

  // One last signal crosses the now-level field.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) fieldStore.pulse(0, 0.5, 0.7);
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [section]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied("ok");
      toast(t.contact.copied);
    } catch {
      setCopied("fail");
      toast(`${t.contact.copyFail} ${EMAIL}`);
    }
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(""), 3200);
  };

  return (
    <>
      <section ref={section} id="contact" className="chapter invitation" data-field="show" aria-labelledby="contact-title">
        <div className="invitation-zone" data-field-zone aria-hidden="true" />
        <div className="wrap invitation-grid">
          <p className="plate mono rule-in">
            <b>06</b> {t.contact.eyebrow}
          </p>
          <RevealHeading
            id="contact-title"
            className="display invitation-title"
            lines={[t.contact.h2a, `${t.contact.h2b}SANKET${t.contact.h2c}`.trim()]}
            accentLine={1}
            renderLine={(line, n) => (n === 0 ? <LevelLine text={line} latin={lang === "en"} /> : undefined)}
          />
          <p className="lead invitation-lead fade" style={{ ["--d" as string]: "300ms" }}>
            {t.contact.p}
          </p>
          <div className="contact-rows fade" style={{ ["--d" as string]: "420ms" }}>
            <a ref={wa} className="contact-row" href={links.wa} target="_blank" rel="noreferrer">
              <span className="contact-icon">
                <WhatsAppIcon size={24} />
              </span>
              <span className="contact-text">
                <strong>{t.cta.whatsapp}</strong>
                <span className="mono">{WHATSAPP_DISPLAY}</span>
                <small>{t.contact.waNote}</small>
              </span>
              <ArrowUpRight className="contact-arrow" size={26} aria-hidden="true" />
            </a>
            <a ref={mail} className="contact-row" href={links.mail}>
              <span className="contact-icon">
                <Mail size={22} aria-hidden="true" />
              </span>
              <span className="contact-text">
                <strong>{t.contact.emailTitle}</strong>
                <span className="mono">{EMAIL}</span>
                <small>{t.contact.emailNote}</small>
              </span>
              <ArrowUpRight className="contact-arrow" size={26} aria-hidden="true" />
            </a>
          </div>
          {explored.length > 0 && (
            <div className="context">
              <p className="mono muted">{c.contact.include}</p>
              <ul className="context-chips">
                {explored.map(item => (
                  <li key={item.key}>
                    <span>{item.label}</span>
                    <button aria-label={`${c.contact.remove}: ${item.label}`} onClick={() => visit.remove(item.key)}>
                      <X size={14} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button className="link-line copy-email" onClick={copyEmail}>
            {copied === "ok" ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
            {copied === "ok" ? t.contact.copied : copied === "fail" ? t.contact.copyFail : t.contact.copy}
          </button>
        </div>
      </section>
      <footer className="site-footer">
        <div className="wrap">
          <p className="signature" aria-label="SANKET">
            <span>SANKET</span>
            <span lang="hi">संकेत</span>
            <span lang="te">సంకేతం</span>
          </p>
          <div className="footer-row">
            <span className="footer-brand">
              <Mark size={22} />
              <span>
                {t.footer.tagline}
                <em className="muted"> {c.footer.signature}</em>
              </span>
            </span>
            <nav className="footer-links" aria-label="Contact">
              <a className="link-line" href={links.mail}>
                {t.cta.email}
              </a>
              <a className="link-line" href={links.wa} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
              <a className="link-line" href="#top">
                {t.footer.back}
                <ArrowUp size={14} aria-hidden="true" />
              </a>
            </nav>
          </div>
          <p className="mono muted footer-legal">
            © {new Date().getFullYear()} SANKET / PRISMA. {t.footer.rights}
          </p>
        </div>
      </footer>
    </>
  );
}
