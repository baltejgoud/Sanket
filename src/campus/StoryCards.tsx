import { ArrowDown, ArrowLeft, ArrowUpRight, ScanLine } from 'lucide-react';
import type { Lang } from '../i18n';
import { solutionCards, SolutionBrief } from './SolutionBrief';
import { guideCopy, type StoryChapter } from './guideCopy';
import { storyCopy } from './storyCopy';
import { BEAT_COUNTS } from './timeline';
import { track } from '../lib/analytics';
import { cardDetails } from './cardDetails';
import { useState, type PointerEvent } from 'react';

/** A shareable scene address: #problems/2 is the second scene of “The problem”. */
export const SCENE_HASH = /^#(warehouse|problems|forecast|decide)\/(\d+)$/;

/** Where scene `index` of a chapter is read: its scroll hold, or the card itself when every card is listed. */
export function sceneTop(chapter: string, index: number) {
  const section = document.getElementById(chapter);
  if (!section) return null;
  const card = section.querySelector<HTMLElement>(`[data-card-index="${index}"]`);
  if (card && (document.querySelector('.campus-fallback') || matchMedia('(max-height: 520px)').matches)) return card.getBoundingClientRect().top + scrollY - 96;
  return section.getBoundingClientRect().top + scrollY + (section.offsetHeight - innerHeight) * ((index + .5) / BEAT_COUNTS[chapter]);
}

type Card = [string, string, string];
type Chapter = StoryChapter;
const cards: Record<Lang, Record<Chapter, Card[]>> = {
  en: {
    warehouse: [
      ['THE BIG PICTURE', 'Stock on a shelf is cash waiting to return.', 'Goods arrive, wait in storage and leave through dispatch. Follow three products through this warehouse to see why having plenty of stock is different from having the right stock.'],
      ['LOOK INSIDE', 'Same warehouse. Different stock decisions.', 'The roof lifts to reveal the racks. A2 will sell out, A4 will hold slow stock, and A3 will supply a transfer. Keep these rack labels in view as the story moves closer.'],
    ],
    problems: [
      ['01 / THE WARNING', 'The shelf looks full. The clock says otherwise.', 'A2 has about 9 days of stock. The next delivery takes 14. Even before the shelf empties, a five-day gap is already taking shape.'],
      ['02 / THE STOCKOUT', 'The stock runs out. The demand doesn’t.', 'Now A2 is empty, with replacement stock still on the way. Customers must wait or buy elsewhere. The time to act was before the last box left.'],
      ['03 / THE SURPLUS', 'Too much here. Too little where it matters.', 'A4 holds about 120 days of slow-selling stock while A2 stands empty. Cash and space are tied up in a different product. Buying more of everything repeats the problem.'],
    ],
    forecast: solutionCards.en,
    decide: [
      ['HOW IT WORKS / 01', 'Approve the move before stock leaves.', 'Continue the separate A3 transfer example: 360 units from the central hub to the West location. Your team checks that the source has stock to spare and the receiving location needs it.'],
      ['HOW IT WORKS / 02', 'A decision becomes work on the floor.', 'Follow the pallet out of the rack and into the aisle. The warehouse team picks the stock and takes it to dispatch.'],
      ['HOW IT WORKS / 03', 'Prepare the stock for its next location.', 'The pallet reaches the loading bay. Your operations team checks and loads the shipment. The truck stays put until loading is complete.'],
      ['HOW IT WORKS / 04', 'Send it where there is demand.', 'This shipment is intended for the West location. Your operations team arranges transport and checks arrival timing. The route illustrates the transfer; it is not a live tracking feed.'],
      ['HOW IT WORKS / 05', 'Dispatch is one step. Review what happens next.', 'After delivery, update stock at both locations and compare actual sales with the forecast. Use what changed to review the next order, transfer or markdown.'],
    ],
  },
  hi: {
    warehouse: [
      ['पूरी तस्वीर', 'संभावनाओं से भरा गोदाम।', 'हर डिब्बे में भविष्य की बिक्री के लिए पैसा लगा है। सवाल यह है कि ज़रूरत के समय सही उत्पाद उपलब्ध होगा या नहीं।'],
      ['अंदर देखें', 'डिब्बों से आगे की बात।', 'छत खुलती है। हर रैक में अलग उत्पाद, बिक्री की अलग गति और फिर मंगाने की अलग ज़रूरत है। भरा गोदाम भी स्टॉक का असंतुलन छिपा सकता है।'],
    ],
    problems: [
      ['01 / बदलती मांग', 'कल की योजना, आज की मांग।', 'एक उत्पाद तेज़ बिकने लगता है। शेल्फ अभी भरा दिखता है, लेकिन मांग स्टॉक योजना से आगे निकल रही है।'],
      ['02 / स्टॉक खत्म', 'जो ग्राहक चाहते हैं, वही खत्म।', 'चुना हुआ रैक खाली होते देखें। समय रहते स्टॉक नहीं आया तो अगला ऑर्डर छूट सकता है या ग्राहक को इंतज़ार करना होगा।'],
      ['03 / दूसरी ओर', 'यह स्टॉक वहीं पड़ा है।', 'कैमरा भरे रैक पर आता है। धीमे उत्पाद जगह घेरते हैं और पैसा रोकते हैं। हर चीज़ ज़्यादा मंगाना इसका समाधान नहीं है।'],
    ],
    forecast: solutionCards.hi,
    decide: [
      ['कैसे काम करता है / 01', 'भेजने योग्य स्टॉक पहचानें।', 'इस उदाहरण में मांग ट्रांसफर का संकेत देती है। कदम उठाने से पहले उत्पाद, उपलब्ध स्टॉक और मंज़िल की समीक्षा करें।'],
      ['कैसे काम करता है / 02', 'निर्णय गोदाम में काम बनता है।', 'पैलेट को रैक से रास्ते में आते देखें। गोदाम टीम स्टॉक उठाकर डिस्पैच तक ले जाती है।'],
      ['कैसे काम करता है / 03', 'अगली जगह के लिए स्टॉक तैयार करें।', 'पैलेट लोडिंग बे तक पहुँचता है। संचालन टीम जाँच करके लोड करती है। लोडिंग पूरी होने तक ट्रक वहीं रहता है।'],
      ['कैसे काम करता है / 04', 'स्टॉक को मंज़िल से जोड़ें।', 'दिखाया गया रास्ता ट्रांसफर स्पष्ट करता है। उद्देश्य है मौजूदा स्टॉक को वहाँ भेजना जहाँ मांग है।'],
      ['कैसे काम करता है / 05', 'स्टॉक भेजें। मांग समझते रहें।', 'शिपमेंट रवाना होता है। बिक्री और स्टॉक बदलने पर अगला पूर्वानुमान और निर्णय देखें। मांग की योजना लगातार चलती है।'],
    ],
  },
  te: {
    warehouse: [
      ['పూర్తి దృశ్యం', 'అవకాశాలతో నిండిన గిడ్డంగి.', 'ప్రతి పెట్టె భవిష్యత్ అమ్మకానికి పెట్టిన పెట్టుబడి. అవసరమైనప్పుడు సరైన ఉత్పత్తి అందుబాటులో ఉంటుందా అనేదే ప్రశ్న.'],
      ['లోపల చూడండి', 'పెట్టెల వెనుక కథ చూడండి.', 'పైకప్పు తెరుచుకుంటుంది. ప్రతి ర్యాక్‌లో వేరే ఉత్పత్తి, అమ్మకాల వేగం, ఆర్డర్ అవసరం ఉన్నాయి. నిండిన గిడ్డంగిలోనూ స్టాక్ అసమతుల్యత ఉండవచ్చు.'],
    ],
    problems: [
      ['01 / మారే డిమాండ్', 'నిన్నటి ప్రణాళిక, నేటి డిమాండ్.', 'ఒక ఉత్పత్తి వేగంగా అమ్ముడవుతుంది. షెల్ఫ్ నిండినట్లు కనిపించినా, డిమాండ్ స్టాక్ ప్రణాళికను దాటుతోంది.'],
      ['02 / స్టాక్ అయిపోయింది', 'కస్టమర్లకు కావాల్సిందే అయిపోయింది.', 'ఎంచుకున్న ర్యాక్ ఖాళీ అవుతుంది. సమయానికి స్టాక్ రాకపోతే తదుపరి అమ్మకం చేజారవచ్చు లేదా కస్టమర్ వేచి ఉండాలి.'],
      ['03 / మరో వైపు', 'ఈ స్టాక్ మాత్రం అలాగే ఉంది.', 'కెమెరా నిండిన ర్యాక్‌లకు వెళ్తుంది. నెమ్మదిగా అమ్ముడయ్యే ఉత్పత్తులు స్థలాన్ని, డబ్బును ఆక్రమిస్తాయి. అన్నింటినీ ఎక్కువగా కొనడం పరిష్కారం కాదు.'],
    ],
    forecast: solutionCards.te,
    decide: [
      ['ఎలా పనిచేస్తుంది / 01', 'తరలించాల్సిన స్టాక్‌ను ఎంచుకోండి.', 'ఈ ఉదాహరణలో డిమాండ్ బదిలీని సూచిస్తుంది. చర్యకు ముందు ఉత్పత్తి, అందుబాటులోని స్టాక్, గమ్యాన్ని సమీక్షించండి.'],
      ['ఎలా పనిచేస్తుంది / 02', 'నిర్ణయం గిడ్డంగిలో చర్య అవుతుంది.', 'ప్యాలెట్ ర్యాక్ నుంచి బయటకు వస్తుంది. గిడ్డంగి బృందం స్టాక్‌ను తీసుకొని డిస్పాచ్‌కు తరలిస్తుంది.'],
      ['ఎలా పనిచేస్తుంది / 03', 'తదుపరి ప్రదేశానికి సిద్ధం చేయండి.', 'ప్యాలెట్ లోడింగ్ బేకు చేరుతుంది. బృందం తనిఖీ చేసి లోడ్ చేస్తుంది. లోడింగ్ పూర్తయ్యే వరకు ట్రక్ ఆగి ఉంటుంది.'],
      ['ఎలా పనిచేస్తుంది / 04', 'స్టాక్‌ను గమ్యంతో కలపండి.', 'హైలైట్ చేసిన మార్గం బదిలీని చూపిస్తుంది. ఉన్న స్టాక్‌ను డిమాండ్ ఉన్న చోటికి పంపడమే లక్ష్యం.'],
      ['ఎలా పనిచేస్తుంది / 05', 'స్టాక్ పంపండి. డిమాండ్ గమనించండి.', 'షిప్‌మెంట్ బయలుదేరుతుంది. అమ్మకాలు, స్టాక్ మారినప్పుడు తదుపరి అంచనా, నిర్ణయాన్ని సమీక్షించండి. డిమాండ్ ప్రణాళిక నిరంతరం కొనసాగుతుంది.'],
    ],
  },
};

export function StoryCards({ chapter, lang, openTool }: { chapter: Chapter; lang: Lang; openTool?: (tool: number) => void }) {
  const items = chapter === 'forecast' ? solutionCards[lang] : cards[lang][chapter];
  const guide = guideCopy[lang];
  const detail = cardDetails[lang];
  const light = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse' || document.documentElement.classList.contains('is-calm') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const card = e.currentTarget, rect = card.getBoundingClientRect();
    card.style.setProperty('--light-x', `${((e.clientX - rect.left) / rect.width * 100).toFixed(1)}%`);
    card.style.setProperty('--light-y', `${((e.clientY - rect.top) / rect.height * 100).toFixed(1)}%`);
  };
  // Scene steppers are groups, not landmarks; the chapter name tells the four apart.
  const chapterName = storyCopy[lang].chapters[{ warehouse: 1, problems: 2, forecast: 3, decide: 4 }[chapter]];
  const next = lang === 'hi' ? 'अगला दृश्य' : lang === 'te' ? 'తదుపరి దృశ్యం' : 'Next scene';
  // Phones show a short card over the scene; “More” opens the full explanation (and keeps it open for later scenes).
  const [expanded, setExpanded] = useState(false);
  const more = expanded ? (lang === 'hi' ? 'कम दिखाएँ' : lang === 'te' ? 'తక్కువ చూపు' : 'Less') : (lang === 'hi' ? 'और पढ़ें' : lang === 'te' ? 'మరింత చదవండి' : 'More');
  const goToScene = (index: number) => {
    track('scene_stepped', { chapter, scene: index + 1 });
    const section = document.getElementById(chapter)!;
    const target = index < items.length ? sceneTop(chapter, index)! : section.getBoundingClientRect().top + scrollY + section.offsetHeight;
    if (index === items.length) {
      const nextSection = section.nextElementSibling;
      nextSection?.querySelector<HTMLElement>('.story-detail-card:not([hidden]) button, .campus-contact a')?.focus({ preventScroll: true });
    }
    const calm = document.documentElement.classList.contains('is-calm') || matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: target, behavior: calm ? 'instant' : 'smooth' });
  };
  return <div className="story-card-deck" data-card-deck={chapter} data-expanded={expanded}>
    {items.map(([eyebrow, title, body], i) => <article key={i} className={`story-detail-card${chapter === 'forecast' ? ' with-brief' : ''}`} data-card-index={i} hidden={i !== 0} onPointerMove={light}>
      <div className="model-cue"><ScanLine size={16} aria-hidden="true" /><span><b>{guide.model}</b>{guide.cues[chapter][i]}</span><span className="card-fact">{detail.facts[chapter][i]}</span></div>
      <div className="card-heading"><p className="card-kicker">{eyebrow}<span className="card-scene-count" aria-hidden="true">{String(i + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span></p><h3>{title}</h3><div role="group" className="card-progress" aria-label={`${chapterName} · ${guide.scene} ${i + 1} / ${items.length}`}>{items.map((item, j) => <button key={j} data-scene-focus={`step-${j}`} onClick={() => goToScene(j)} aria-label={`${guide.scene} ${j + 1}: ${item[1]}`} aria-current={j === i ? 'step' : undefined} data-complete={j < i}><span>{String(j + 1).padStart(2, '0')}</span><small aria-hidden="true">{detail.steps[chapter][j]}</small></button>)}</div></div>
      <div className="card-explanation"><p>{body}</p><div className="card-actions">
        <button data-scene-focus="previous" onClick={() => goToScene(i - 1)} disabled={i === 0} aria-label={guide.previous}><ArrowLeft size={17} aria-hidden="true" /></button>
        <button data-scene-focus="next" onClick={() => goToScene(i + 1)}>{i === items.length - 1 ? guide.nextChapter : next}<ArrowDown size={17} aria-hidden="true" /></button>
        <button className="card-more" aria-expanded={expanded} onClick={() => setExpanded(e => !e)}>{more}</button>
        {openTool && chapter === 'forecast' && i === 0 && <button onClick={() => openTool(2)}>{lang === 'hi' ? 'कनेक्शन देखें' : lang === 'te' ? 'కనెక్షన్లు చూడండి' : 'Explore connections'}<ArrowUpRight size={17} aria-hidden="true" /></button>}
        {openTool && chapter === 'problems' && i === 2 && <button onClick={() => openTool(1)}>{lang === 'hi' ? 'संभावित लाभ देखें' : lang === 'te' ? 'ప్రయోజనం అంచనా వేయండి' : 'Estimate the impact'}<ArrowUpRight size={17} aria-hidden="true" /></button>}
        {openTool && chapter === 'forecast' && (i === 1 || i === items.length - 1) && <button onClick={() => openTool(0)}>{lang === 'hi' ? 'पूर्वानुमान आज़माएँ' : lang === 'te' ? 'ఫోర్‌కాస్ట్ చూడండి' : 'Try a forecast'}<ArrowUpRight size={17} aria-hidden="true" /></button>}
      </div></div>
      {chapter === 'forecast' && <SolutionBrief step={i} lang={lang} />}
    </article>)}
  </div>;
}
