import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, Menu, Pause, Play, X } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { dict, languages, type Lang } from './i18n';

const ForecastSurface = lazy(() => import('./ForecastSurface'));
const copy = {
  en: {
    system: 'The system', playground: 'Playground', industries: 'Industries', talk: 'Let’s talk', menu: 'Open navigation', close: 'Close navigation',
    eyebrow: 'AN INTELLIGENT WORLD IN MOTION', first: 'A clearer', accent: 'future,', last: 'in stock.',
    desc: 'Know what to order, move or mark down. Demand intelligence for a world that won’t stand still.',
    explore: 'Explore the intelligence', demo: 'Try the playground', audience: 'FOR RETAILERS, BRANDS & DISTRIBUTORS',
    signals: 'Read the signals', forecast: 'See the possibilities', decisions: 'Make your move',
    states: ['Sales, seasons and outside signals. A changing world, brought into focus.', 'One forecast. A range of possibilities. Make room for uncertainty.', 'Order, transfer or mark down. Turn the forecast into your next move.'],
    study: 'Interactive forecast study · illustrative', pause: 'Pause scene motion', play: 'Resume scene motion',
    introLabel: '01 / FROM SIGNAL TO DECISION', introA: 'The world moves.', introB: 'Your inventory should, too.',
    intro: 'A trend takes off. The weather turns. Demand shifts before the spreadsheet does. SANKET connects the signals to help you see what comes next—and decide what to do about it.',
    retained: 'Stock what sells. Skip what doesn’t.', scroll: 'SCROLL TO CONNECT THE DOTS',
    chapter2: 'Clarity you can play with.', chapter3: 'Intelligence. In your world.',
    chapter2desc: 'Change the signals. Watch the decision change.', chapter3desc: 'One platform. The realities of your industry.',
    inputs: 'Signals in', uncertainty: 'Possibilities mapped', output: 'Decisions out', reduced: 'Static forecast study',
  },
  hi: {
    system: 'सिस्टम', playground: 'खुद आज़माएँ', industries: 'उद्योग', talk: 'बात करें', menu: 'नेविगेशन खोलें', close: 'नेविगेशन बंद करें',
    eyebrow: 'बदलती दुनिया के लिए समझदार निर्णय', first: 'बेहतर भविष्य,', accent: 'सही स्टॉक', last: 'के साथ।',
    desc: 'क्या मँगाएँ, कहाँ भेजें और कब कीमत घटाएँ। बदलती मांग के लिए स्पष्ट निर्णय।',
    explore: 'जानें कैसे काम करता है', demo: 'खुद आज़माएँ', audience: 'रिटेलर्स, ब्रांड्स और डिस्ट्रीब्यूटर्स के लिए',
    signals: 'संकेत समझें', forecast: 'संभावनाएँ देखें', decisions: 'अगला कदम चुनें',
    states: ['बिक्री, मौसम और बाहरी संकेत। बदलती दुनिया को समझें।', 'एक पूर्वानुमान, कई संभावनाएँ। अनिश्चितता को समझें।', 'ऑर्डर, ट्रांसफ़र या मार्कडाउन। अगला कदम तय करें।'],
    study: 'इंटरैक्टिव पूर्वानुमान अध्ययन · उदाहरण', pause: 'एनीमेशन रोकें', play: 'एनीमेशन चलाएँ',
    introLabel: '01 / संकेत से निर्णय तक', introA: 'दुनिया बदलती है।', introB: 'आपका स्टॉक भी बदले।',
    intro: 'रुझान बदलते हैं। मौसम बदलता है। स्प्रेडशीट से पहले मांग बदल जाती है। SANKET संकेतों को जोड़कर अगला कदम समझने में मदद करता है।',
    retained: 'जो बिकता है, वही रखें।', scroll: 'आगे जानने के लिए स्क्रॉल करें',
    chapter2: 'खुद आज़माकर समझें।', chapter3: 'आपके उद्योग की समझ।',
    chapter2desc: 'संकेत बदलें। निर्णय को बदलते देखें।', chapter3desc: 'एक प्लेटफ़ॉर्म। आपके उद्योग की ज़रूरतें।',
    inputs: 'संकेत', uncertainty: 'संभावनाएँ', output: 'निर्णय', reduced: 'स्थिर पूर्वानुमान अध्ययन',
  },
  te: {
    system: 'సిస్టమ్', playground: 'మీరే ప్రయత్నించండి', industries: 'పరిశ్రమలు', talk: 'మాట్లాడండి', menu: 'నావిగేషన్ తెరవండి', close: 'నావిగేషన్ మూసివేయండి',
    eyebrow: 'మారుతున్న ప్రపంచానికి తెలివైన నిర్ణయాలు', first: 'స్పష్టమైన భవిష్యత్తు,', accent: 'సరైన స్టాక్', last: 'తో మొదలు.',
    desc: 'ఏమి ఆర్డర్ చేయాలి, ఎక్కడికి తరలించాలి, ఎప్పుడు ధర తగ్గించాలి. మారుతున్న డిమాండ్‌కు స్పష్టమైన నిర్ణయాలు.',
    explore: 'ఎలా పనిచేస్తుందో చూడండి', demo: 'మీరే ప్రయత్నించండి', audience: 'రిటైలర్లు, బ్రాండ్లు, పంపిణీదారుల కోసం',
    signals: 'సంకేతాలను చదవండి', forecast: 'అవకాశాలను చూడండి', decisions: 'తదుపరి అడుగు వేయండి',
    states: ['అమ్మకాలు, సీజన్లు, బయటి సంకేతాలు. మారుతున్న ప్రపంచాన్ని అర్థం చేసుకోండి.', 'ఒక అంచనా. ఎన్నో అవకాశాలు. అనిశ్చితిని అర్థం చేసుకోండి.', 'ఆర్డర్, బదిలీ లేదా ధర తగ్గింపు. అంచనా నుంచి నిర్ణయానికి.'],
    study: 'ఇంటరాక్టివ్ అంచనా అధ్యయనం · ఉదాహరణ', pause: 'యానిమేషన్ ఆపండి', play: 'యానిమేషన్ కొనసాగించండి',
    introLabel: '01 / సంకేతం నుంచి నిర్ణయానికి', introA: 'ప్రపంచం మారుతుంది.', introB: 'మీ స్టాక్ కూడా మారాలి.',
    intro: 'ట్రెండ్ మొదలవుతుంది. వాతావరణం మారుతుంది. స్ప్రెడ్‌షీట్ కంటే ముందే డిమాండ్ మారుతుంది. SANKET సంకేతాలను కలిపి తదుపరి నిర్ణయానికి సహాయపడుతుంది.',
    retained: 'అమ్ముడయ్యేదే ఉంచండి.', scroll: 'మరింత తెలుసుకోవడానికి స్క్రోల్ చేయండి',
    chapter2: 'ప్రయత్నించి తెలుసుకోండి.', chapter3: 'మీ పరిశ్రమకు తగిన అవగాహన.',
    chapter2desc: 'సంకేతాలను మార్చండి. నిర్ణయం ఎలా మారుతుందో చూడండి.', chapter3desc: 'ఒక ప్లాట్‌ఫారమ్. మీ పరిశ్రమ అవసరాలు.',
    inputs: 'సంకేతాలు', uncertainty: 'అవకాశాలు', output: 'నిర్ణయాలు', reduced: 'స్థిర అంచనా అధ్యయనం',
  },
};

export function CinematicHeader({ lang, setLang, active }: { lang: Lang; setLang: (lang: Lang) => void; active: string }) {
  const c = copy[lang];
  const modal = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const links = [{ href: '#journey', label: c.system, ids: ['journey', 'problems', 'how'] }, { href: '#command', label: c.playground, ids: ['command', 'film'] }, { href: '#industries', label: c.industries, ids: ['industries', 'platform'] }];
  useEffect(() => {
    if (open) modal.current?.showModal();
    else modal.current?.close();
    const prev = document.body.style.overflow;
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);
  const close = () => { setOpen(false); opener.current?.focus(); };
  return <>
    <header className="cinema-header">
      <a href="#main" className="cinema-logo" aria-label="Sanket home">SANKET<span>PRISMA / DEMAND INTELLIGENCE</span></a>
      <nav className="cinema-nav" aria-label="Main navigation">{links.map(link => <a key={link.href} href={link.href} aria-current={link.ids.includes(active) ? 'location' : undefined}>{link.label}</a>)}</nav>
      <div className="cinema-header-actions"><div className="cinema-languages" role="group" aria-label={dict[lang].langLabel}>{languages.map(l => <button key={l.code} lang={l.code} aria-label={l.name} aria-pressed={lang === l.code} onClick={() => setLang(l.code)}>{l.label}</button>)}</div><a className="cinema-talk" href="#contact">{c.talk}<ArrowUpRight size={16}/></a><button ref={opener} className="cinema-menu" aria-label={c.menu} aria-haspopup="dialog" aria-controls="cinema-navigation" aria-expanded={open} onClick={() => setOpen(true)}><Menu size={22}/></button></div>
    </header>
    <dialog ref={modal} id="cinema-navigation" className="cinema-dialog" onCancel={close} onClose={() => setOpen(false)} aria-label={c.menu}>
      <div className="cinema-dialog-top"><span>SANKET / INDEX</span><button aria-label={c.close} onClick={close}><X size={26}/></button></div>
      <nav aria-label="Expanded navigation">{[...links, { href: '#roi', label: dict[lang].nav.roi }, { href: '#stories', label: dict[lang].nav.stories }, { href: '#contact', label: c.talk }].map((link, i) => <a href={link.href} key={link.href} onClick={close}><span>0{i + 1}</span>{link.label}<ArrowUpRight/></a>)}</nav>
      <p>{dict[lang].footer.tagline}</p>
    </dialog>
    <div className="reading-progress" aria-hidden="true"/>
  </>;
}

export function CinematicHero({ lang }: { lang: Lang }) {
  const c = copy[lang];
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState(1);
  const [paused, setPaused] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const stage = useRef<HTMLElement>(null);
  useEffect(() => {
    const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const query = matchMedia('(min-width: 900px)');
    const enable = () => setEnabled(query.matches && !reduced && !device.connection?.saveData && (device.deviceMemory ?? 8) >= 4);
    enable(); query.addEventListener('change', enable);
    return () => query.removeEventListener('change', enable);
  }, [reduced]);
  return <section ref={stage} className={`cinema-hero ${ready && enabled ? 'scene-ready' : ''}`} id="intelligence" aria-labelledby="cinema-title" data-phase={phase}>
    <div className="cinema-art" aria-hidden="true"><img src="/assets/forecast-surface.webp" width="1536" height="1024" alt=""/>{enabled && <Suspense fallback={null}><ForecastSurface phase={phase} paused={paused} onReady={setReady} /></Suspense>}</div>
    <div className="cinema-hero-content">
      <p className="cinema-kicker"><span>01</span> / {c.eyebrow}</p>
      <h1 id="cinema-title"><span>{c.first}</span><span><em>{c.accent}</em> {c.last}</span></h1>
      <p className="cinema-hero-desc">{c.desc}</p>
      <div className="cinema-hero-ctas"><a href="#journey" className="cinema-primary">{c.explore}<span><ArrowDownRight size={22}/></span></a><a href="#command" className="cinema-secondary">{c.demo}<ArrowUpRight size={15}/></a></div>
      <p className="cinema-audience"><i/>{c.audience}</p>
    </div>
    <div className="surface-annotations" aria-hidden="true"><span>{c.inputs}</span><span>{c.uncertainty}</span><span>{c.output}</span></div>
    <div className="cinema-study"><span>{c.study}</span>{enabled && ready && <button onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={paused ? c.play : c.pause}>{paused ? <Play size={12}/> : <Pause size={12}/>}</button>}</div>
    <div className="cinema-stages" role="group" aria-label={lang === 'en' ? 'Explore the forecast study' : c.study}>{[c.signals, c.forecast, c.decisions].map((label, i) => <button key={i} aria-pressed={phase === i} onClick={() => setPhase(i)}><span className="stage-number">0{i + 1}<i/></span><span className="stage-name">{label}<ArrowUpRight size={19}/></span></button>)}</div>
    <div className="cinema-stage-caption"><p aria-live="polite">{c.states[phase]}</p><span><ArrowDown size={12}/>{c.scroll}</span></div>
  </section>;
}

export function SignalJourney({ lang }: { lang: Lang }) {
  const c = copy[lang];
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const target = section.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      target.classList.toggle('journey-seen', entry.isIntersecting);
    }, { threshold: .3 });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  return <section className="signal-journey" id="journey" ref={section} aria-labelledby="journey-title">
    <div className="journey-top"><span>{c.introLabel}</span><span>SANKET / PRISMA</span></div>
    <div className="journey-grid"><h2 id="journey-title">{c.introA}<br/><span>{c.introB}</span></h2><div><p>{c.intro}</p><a href="#problems">{c.retained}<ArrowDownRight size={22}/></a></div></div>
    <div className="signal-thread" aria-hidden="true"><span>01 / {c.inputs}</span><i/><span>02 / {c.uncertainty}</span><i/><span>03 / {c.output}</span></div>
  </section>;
}

export function ChapterBreak({ lang, number }: { lang: Lang; number: '02' | '03' }) {
  const c = copy[lang];
  return <div className={`chapter-break chapter-${number}`}><div><span className="chapter-number">{number}</span><h2>{number === '02' ? c.chapter2 : c.chapter3}</h2></div><p>{number === '02' ? c.chapter2desc : c.chapter3desc}<ArrowDownRight size={25}/></p></div>;
}
