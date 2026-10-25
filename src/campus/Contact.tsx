import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowUpRight, Copy, Mail, X } from 'lucide-react';
import { dict, type Lang } from '../i18n';
import { toast } from '../components/Toast';
import { Mark, WhatsAppIcon } from '../components/Icons';
import { Odometer } from '../components/Odometer';
import { EMAIL, WHATSAPP_DISPLAY, mailLinkFor, useContactLinks, whatsappLink } from '../lib/contact';
import { track } from '../lib/analytics';
import { copy } from '../copy';
import { useReveal, useSheen } from '../lib/kinetic';
import { contextLines, useVisit, visit } from '../lib/visit';
import { storyCopy } from './storyCopy';
import { guideCopy } from './guideCopy';
import { motionCopy } from './motionCopy';
import { KineticTitle } from './Kinetic';

/** A channel drawn as a physical key: it lifts and catches light under the pointer, and presses in. */
function ContactKey({ href, external, icon, title, detail, cursor, channel }: { href: string; external?: boolean; icon: ReactNode; title: string; detail: string; cursor: string; channel: string }) {
  const ref = useSheen<HTMLAnchorElement>();
  return <a ref={ref} className="contact-key" href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} data-cursor={cursor} onClick={() => track('contact_click', { channel, from: 'contact' })}>
    <span className="key-icon">{icon}</span><span><strong>{title}</strong><small>{detail}</small></span><ArrowUpRight size={22} aria-hidden="true" />
  </a>;
}

function ToolCard({ index, name, note, cursor, onOpen }: { index: number; name: string; note: string; cursor: string; onOpen: () => void }) {
  const ref = useSheen<HTMLButtonElement>();
  return <button ref={ref} className="fade" style={{ '--d': `${index * 90}ms` } as CSSProperties} onClick={onOpen} data-cursor={cursor}>
    <span className="resource-number" aria-hidden="true">0{index + 1}</span><span><strong>{name}</strong><small>{note}</small></span><ArrowUpRight size={18} aria-hidden="true" />
  </button>;
}

/** The label rolls to its confirmation and a check draws itself, then both roll back. */
function CopyEmail({ lang }: { lang: Lang }) {
  const t = dict[lang];
  const [copied, setCopied] = useState(false);
  useEffect(() => { if (!copied) return; const done = setTimeout(() => setCopied(false), 2600); return () => clearTimeout(done); }, [copied]);
  return <button className="text-action copy-action" data-copied={copied} data-cursor={motionCopy[lang].cursor.copy} onClick={async () => {
    track('contact_click', { channel: 'copy_email', from: 'contact' });
    try { await navigator.clipboard.writeText(EMAIL); setCopied(true); toast(t.contact.copied); } catch { toast(`${t.contact.copyFail} ${EMAIL}`); }
  }}>
    <span className="copy-icon" aria-hidden="true"><Copy size={16} /><svg className="copy-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} /></svg></span>
    <span className="roll"><span aria-hidden={copied}>{t.contact.copy}</span><span aria-hidden={!copied}>{t.contact.copied}</span></span>
  </button>;
}

/** Local time where the team works, with the minutes rolling over on a mechanical counter. */
function IndiaTime({ lang }: { lang: Lang }) {
  const read = () => new Intl.DateTimeFormat(`${lang}-IN`, { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date());
  const [time, setTime] = useState(read);
  useEffect(() => { setTime(read()); const tick = setInterval(() => setTime(read()), 10000); return () => clearInterval(tick); }, [lang]);
  return <p className="contact-clock"><span className="clock-dot" aria-hidden="true" />{motionCopy[lang].clock}<span className="clock-time"><Odometer value={time} /> IST</span></p>;
}

/**
 * Three lines, composed into the visitor's own email or WhatsApp (with anything they explored on
 * the page). There is no form backend: nothing is posted from here, and the form says so.
 */
function EnquiryForm({ lang }: { lang: Lang }) {
  const f = guideCopy[lang].form, explored = useVisit();
  const [name, setName] = useState(''), [company, setCompany] = useState(''), [need, setNeed] = useState('');
  const send = (channel: 'email' | 'whatsapp') => {
    track('contact_click', { channel, from: 'form' });
    const lines = [name && `Name: ${name}`, company && `Company: ${company}`, need && `What we sell / hardest to predict: ${need}`].filter(Boolean).join('\n');
    const context = explored.length ? `\n\n${copy[lang].contact.lead}\n${contextLines(explored)}` : '';
    const body = `Hi,\n\nI'd like to see how SANKET could work for our business.\n\n${lines}${context}\n\nThanks`;
    if (channel === 'email') location.href = mailLinkFor(body);
    else window.open(whatsappLink(body), '_blank', 'noopener,noreferrer');
  };
  return <form className="enquiry" onSubmit={e => { e.preventDefault(); send('email'); }}>
    <h3>{f.title}</h3>
    <div className="enquiry-row">
      <label><span>{f.name}</span><input name="name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} /></label>
      <label><span>{f.company}</span><input name="organization" autoComplete="organization" value={company} onChange={e => setCompany(e.target.value)} /></label>
    </div>
    <label><span>{f.need}</span><textarea name="need" rows={2} value={need} onChange={e => setNeed(e.target.value)} /></label>
    <div className="enquiry-actions">
      <button type="submit"><Mail size={17} aria-hidden="true" />{f.email}</button>
      <button type="button" onClick={() => send('whatsapp')}><WhatsAppIcon size={17} />{f.whatsapp}</button>
    </div>
    <p className="enquiry-note">{f.note}</p>
  </form>;
}

export function Contact({ lang, openTool }: { lang: Lang; openTool: (tool: number) => void }) {
  const n = storyCopy[lang], t = dict[lang], guide = guideCopy[lang], m = motionCopy[lang];
  const links = useContactLinks(), explored = useVisit();
  const tools = useReveal<HTMLDivElement>(.2);
  return <section id="contact" className="story-section contact-section" aria-labelledby="contact-title">
    <div className="story-sticky"><div className="story-copy">
      <p className="story-eyebrow"><b>06</b>{n.chapters[5]}</p>
      <KineticTitle as="h2" id="contact-title" lines={n.contact} lang={lang} play="view" />
      <p className="story-lead">{n.contactBody}</p>
      <p className="contact-prepare">{guide.prepare}</p>
      {explored.length > 0 && <div className="contact-context"><p>{guide.context}</p><ul>{explored.map(item => <li key={item.key}><span>{item.label}</span><button onClick={() => visit.remove(item.key)} aria-label={`${guide.remove}: ${item.label}`}><X size={14} aria-hidden="true" /></button></li>)}</ul></div>}
      <div className="campus-contact">
        <ContactKey href={links.wa} external icon={<WhatsAppIcon size={24} />} title={t.cta.whatsapp} detail={WHATSAPP_DISPLAY} cursor={m.cursor.chat} channel="whatsapp" />
        <ContactKey href={links.mail} icon={<Mail size={24} />} title={t.cta.email} detail={EMAIL} cursor={m.cursor.write} channel="email" />
      </div>
      <div className="contact-meta"><CopyEmail lang={lang} /><IndiaTime lang={lang} /></div>
      <EnquiryForm lang={lang} />
      <div className="contact-tools"><h3>{guide.explore}</h3><div ref={tools} className="story-resources">{n.tools.map((name, i) => <ToolCard key={name} index={i} name={name} note={guide.toolNotes[i]} cursor={m.cursor.open} onOpen={() => openTool(i)} />)}</div></div>
      <div className="story-faq"><h3>{guide.faqTitle}</h3>{guide.questions.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
    </div>
    <p className="contact-wordmark" aria-hidden="true">SANKET</p>
    <footer className="campus-footer"><span><Mark size={20} /> SANKET</span><a href="#top">{t.footer.back}<ArrowUpRight size={16} /></a><small>© {new Date().getFullYear()} SANKET</small></footer></div>
  </section>;
}
