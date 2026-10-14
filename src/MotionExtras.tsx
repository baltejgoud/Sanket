import { useContext, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, PackageCheck, Play, Warehouse } from 'lucide-react';
import { LangContext } from './i18n';

export function useMotionCopy() {
  const lang = useContext(LangContext);
  return {
    en: { film: 'THE NEXT ORDER, EXPLAINED', title: 'See the next order take shape.', desc: 'From a change in demand to a decision you can review. A 20-second example, using the product sandbox.', play: 'Play the 20-second product film', example: 'Illustrative product walkthrough · English · 20 seconds', demo: 'Try it yourself', evidence: 'Public industry examples, not SANKET customer results', read: 'Read the story and sources', technical: 'Technical details', transfer: 'The right stock. In the right place.', transferDesc: 'Move surplus to where it is needed. An illustrative transfer recommendation.', surplus: 'Central hub', need: 'West distribution centre', ready: '360 units to transfer', paused: 'Motion paused', replay: 'Replay transfer', progress: 'Connect → Forecast → Decide' },
    hi: { film: 'अगला ऑर्डर समझें', title: 'देखें, अगला ऑर्डर कैसे तय होता है।', desc: 'मांग में बदलाव से आपके निर्णय तक। प्रोडक्ट सैंडबॉक्स का 20-सेकंड का उदाहरण।', play: '20-सेकंड का प्रोडक्ट वीडियो चलाएँ', example: 'उदाहरण वॉकथ्रू · अंग्रेज़ी · 20 सेकंड', demo: 'खुद आज़माएँ', evidence: 'सार्वजनिक उद्योग उदाहरण, SANKET ग्राहकों के परिणाम नहीं', read: 'कहानी और स्रोत पढ़ें', technical: 'तकनीकी जानकारी', transfer: 'सही जगह पर सही स्टॉक।', transferDesc: 'अतिरिक्त स्टॉक वहाँ भेजें जहाँ ज़रूरत है। एक उदाहरण सुझाव।', surplus: 'केंद्रीय गोदाम', need: 'पश्चिम वितरण केंद्र', ready: '360 यूनिट ट्रांसफ़र करें', paused: 'एनीमेशन रुका है', replay: 'ट्रांसफ़र फिर देखें', progress: 'जोड़ें → पूर्वानुमान → निर्णय' },
    te: { film: 'తదుపరి ఆర్డర్‌ను అర్థం చేసుకోండి', title: 'తదుపరి ఆర్డర్ ఎలా సిద్ధమవుతుందో చూడండి.', desc: 'డిమాండ్ మార్పు నుంచి మీ నిర్ణయం వరకు. ప్రోడక్ట్ శాండ్‌బాక్స్‌లో 20 సెకన్ల ఉదాహరణ.', play: '20 సెకన్ల ప్రోడక్ట్ వీడియోను ప్లే చేయండి', example: 'ఉదాహరణ వాక్‌త్రూ · ఇంగ్లీష్ · 20 సెకన్లు', demo: 'మీరే ప్రయత్నించండి', evidence: 'బహిరంగ పరిశ్రమ ఉదాహరణలు; SANKET కస్టమర్ ఫలితాలు కావు', read: 'కథ మరియు మూలాలను చదవండి', technical: 'సాంకేతిక వివరాలు', transfer: 'సరైన చోట సరైన స్టాక్.', transferDesc: 'అదనపు స్టాక్‌ను అవసరమైన చోటికి తరలించండి. ఒక ఉదాహరణ సూచన.', surplus: 'కేంద్ర గోదాము', need: 'పశ్చిమ పంపిణీ కేంద్రం', ready: '360 యూనిట్లను బదిలీ చేయండి', paused: 'యానిమేషన్ ఆగింది', replay: 'బదిలీని మళ్లీ చూడండి', progress: 'కనెక్ట్ → అంచనా → నిర్ణయం' },
  }[lang];
}

export function ProductFilm() {
  const c = useMotionCopy();
  const [started, setStarted] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!started || !video.current) return;
    const el = video.current;
    el.focus();
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) el.pause();
    }, { threshold: 0.15 });
    const onVisibility = () => { if (document.hidden) el.pause(); };
    observer.observe(el);
    document.addEventListener('visibilitychange', onVisibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility); };
  }, [started]);
  return <section className="section product-film" id="film" aria-labelledby="film-heading">
    <div className="film-copy"><span className="eyebrow">{c.film}</span><h2 id="film-heading">{c.title}</h2><p>{c.desc}</p><a className="text-button" href="#command">{c.demo}<ArrowRight size={16}/></a></div>
    <div className="film-stage">
      {started ? <video ref={video} tabIndex={0} controls autoPlay playsInline preload="metadata" poster="/assets/order-film-poster.jpg" aria-label={c.play}>
        <source src="/assets/order-film.mp4" type="video/mp4"/>
        <track kind="captions" src="/assets/order-film.vtt" srcLang="en" label="English"/>
      </video> : <button className="film-play" aria-label={c.play} onClick={() => setStarted(true)}><img src="/assets/order-film-poster.jpg" loading="lazy" alt="SANKET demand forecast and next order example"/><span><Play size={22} fill="currentColor"/> {c.play}</span></button>}
      <p className="film-caption">{c.example}</p>
    </div>
  </section>;
}

export function StockTransfer() {
  const c = useMotionCopy();
  const reduced = useReducedMotion();
  const [run, setRun] = useState(0);
  return <div className="stock-transfer">
    <div><span className="eyebrow">SANKET / EXAMPLE</span><h3>{c.transfer}</h3><p>{c.transferDesc}</p></div>
    <div className="transfer-route" aria-label={`${c.surplus} → ${c.need}: ${c.ready}`}>
      <div className="transfer-node"><Warehouse size={23}/><span>{c.surplus}</span></div>
      <div className="transfer-track"><motion.span key={run} initial={reduced ? false : {left:'4%',opacity:0}} whileInView={reduced ? {} : {left:['4%','4%','84%','84%'],opacity:[0,1,1,1]}} viewport={{once:true,amount:1}} transition={{duration:3.6,times:[0,.18,.82,1],ease:'easeInOut'}}><PackageCheck size={22}/></motion.span></div>
      <div className="transfer-node destination"><PackageCheck size={23}/><span>{c.need}</span></div>
    </div>
    <div className="transfer-footer"><strong>{c.ready}</strong>{!reduced && <button className="text-button" onClick={() => setRun(r => r+1)}>{c.replay}<ArrowRight size={14}/></button>}</div>
  </div>;
}
