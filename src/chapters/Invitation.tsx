import { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { useT } from "../i18n";
import { useCopy } from "../copy";
import { useFieldScene } from "../field/useFieldScene";
import { fieldStore } from "../field/store";
import { useMagnetic, useReveal } from "../lib/motion";
import { EMAIL, mailLink, WHATSAPP_DISPLAY, whatsappLink } from "../lib/contact";
import { Mark, WhatsAppIcon } from "../components/Icons";
import { RevealHeading } from "../components/Words";

export function Invitation() {
  const t = useT();
  const c = useCopy();
  const section = useReveal<HTMLElement>(0.25);
  const [copied, setCopied] = useState<"" | "ok" | "fail">("");
  const timer = useRef<number>();
  const wa = useMagnetic<HTMLAnchorElement>(0.12);
  const mail = useMagnetic<HTMLAnchorElement>(0.12);
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
    } catch {
      setCopied("fail");
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
          />
          <p className="lead invitation-lead fade" style={{ ["--d" as string]: "300ms" }}>
            {t.contact.p}
          </p>
          <div className="contact-rows fade" style={{ ["--d" as string]: "420ms" }}>
            <a ref={wa} className="contact-row" href={whatsappLink(t.cta.waMessage)} target="_blank" rel="noreferrer">
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
            <a ref={mail} className="contact-row" href={mailLink}>
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
          <button className="link-line copy-email" onClick={copyEmail}>
            {copied === "ok" ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
            {copied === "ok" ? t.contact.copied : copied === "fail" ? t.contact.copyFail : t.contact.copy}
          </button>
          <p className="sr-only" role="status">
            {copied === "ok" ? t.contact.copied : copied === "fail" ? t.contact.copyFail : ""}
          </p>
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
              <a className="link-line" href={mailLink}>
                {t.cta.email}
              </a>
              <a className="link-line" href={whatsappLink(t.cta.waMessage)} target="_blank" rel="noreferrer">
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
