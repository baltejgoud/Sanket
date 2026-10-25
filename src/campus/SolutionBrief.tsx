import type { Lang } from '../i18n';

// One illustrative planning case, kept separate from customer results or live product data.
export const solutionCards: Record<Lang, [string, string, string][]> = {
  en: [
    ['SANKET / 01 · CONNECT', 'Start with the data you already have.', 'Bring sales, inventory and supplier lead times together from your ERP, store or files. SANKET connects each product to where it sells and where stock is held.'],
    ['SANKET / 02 · FORECAST', 'See the gap before the shelf empties.', 'For A2, compare expected demand with available stock, incoming orders and the time to replenish. The figures show an earlier planning moment, before the stockout you just saw.'],
    ['SANKET / 03 · REPLENISH', 'A suggested order, with the reasoning visible.', 'This simplified A2 plan suggests 800 units after allowing for a buffer, stock on hand and confirmed inbound stock. Check delivery timing and supplier constraints before placing the order.'],
    ['SANKET / 04 · REBALANCE', 'Use the stock you already own.', 'A separate example: A3 has stock that could serve demand at the West location. Review a 360-unit transfer, checking the source buffer, transit time and destination need.'],
    ['SANKET / 05 · MARK DOWN', 'Give slow stock a better next move.', 'For the slow product in A4, review a possible 12% markdown in week 8. Check margin and expected sell-through before changing the price. This is a separate decision from the A2 order.'],
  ],
  hi: [
    ['SANKET / 01 · जोड़ें', 'शुरुआत आपके मौजूदा डेटा से।', 'ERP, स्टोर या फ़ाइलों से बिक्री, स्टॉक और सप्लायर का समय साथ लाएँ। SANKET हर उत्पाद को उसकी बिक्री और स्टॉक के स्थान से जोड़ता है।'],
    ['SANKET / 02 · पूर्वानुमान', 'शेल्फ खाली होने से पहले कमी देखें।', 'A2 की मांग को उपलब्ध और आने वाले स्टॉक तथा सप्लाई के समय से मिलाएँ। ये आँकड़े अभी देखे गए स्टॉकआउट से पहले की योजना का उदाहरण हैं।'],
    ['SANKET / 03 · मंगाएँ', 'खरीद का सुझाव, गणना के साथ।', 'A2 की सरल योजना सुरक्षा स्टॉक, उपलब्ध और आने वाले माल को देखकर 800 इकाइयाँ सुझाती है। ऑर्डर से पहले डिलीवरी का समय और सप्लायर की सीमाएँ जाँचें।'],
    ['SANKET / 04 · संतुलन', 'जो स्टॉक है, उसे सही जगह पहुँचाएँ।', 'अलग उदाहरण: A3 से पश्चिमी स्थान पर 360 इकाइयाँ भेजें। मंज़ूरी से पहले दोनों स्थानों का स्टॉक, मांग और ट्रांसफर का समय जाँचें।'],
    ['SANKET / 05 · कीमत', 'धीमे स्टॉक के लिए अगला कदम।', 'A4 के धीमे उत्पाद की कीमत सप्ताह 8 में 12% घटाने पर विचार करें। पहले मार्जिन और बिक्री जाँचें। यह A2 के ऑर्डर से अलग निर्णय है।'],
  ],
  te: [
    ['SANKET / 01 · అనుసంధానం', 'మీ వద్ద ఉన్న డేటాతో మొదలుపెట్టండి.', 'ERP, స్టోర్ లేదా ఫైళ్ల నుంచి అమ్మకాలు, స్టాక్, సరఫరా సమయాన్ని కలపండి. SANKET ప్రతి ఉత్పత్తిని అది అమ్ముడయ్యే, నిల్వ ఉండే ప్రదేశాలతో అనుసంధానిస్తుంది.'],
    ['SANKET / 02 · అంచనా', 'షెల్ఫ్ ఖాళీ కాకముందే కొరత చూడండి.', 'A2 డిమాండ్‌ను ఉన్న స్టాక్, రానున్న ఆర్డర్లు, సరఫరా సమయంతో పోల్చండి. ఈ సంఖ్యలు ఇప్పుడే చూసిన స్టాక్ కొరతకు ముందరి ప్రణాళిక ఉదాహరణ.'],
    ['SANKET / 03 · ఆర్డర్', 'లెక్కతో కూడిన ఆర్డర్ సూచన.', 'A2 ప్రణాళిక బఫర్, ఉన్న స్టాక్, రానున్న సరుకును పరిగణించి 800 యూనిట్లు సూచిస్తుంది. ఆర్డర్ ముందు డెలివరీ సమయం, సరఫరాదారు పరిమితులు చూడండి.'],
    ['SANKET / 04 · బదిలీ', 'ఇప్పటికే ఉన్న స్టాక్‌ను ఉపయోగించండి.', 'వేరే ఉదాహరణ: A3 నుంచి పశ్చిమ ప్రదేశానికి 360 యూనిట్లు. ఆమోదానికి ముందు రెండుచోట్ల స్టాక్, డిమాండ్, రవాణా సమయాన్ని తనిఖీ చేయండి.'],
    ['SANKET / 05 · ధర', 'నెమ్మది స్టాక్‌కు మంచి తదుపరి అడుగు.', 'A4 ఉత్పత్తికి 8వ వారంలో 12% ధర తగ్గింపును సమీక్షించండి. ముందు మార్జిన్, అమ్మకాలు చూడండి. ఇది A2 ఆర్డర్‌కు వేరే నిర్ణయం.'],
  ],
};

const briefs = {
  en: {
    label: 'ILLUSTRATIVE PLAN', review: 'Your team reviews. Your team decides.',
    values: ['Sales + stock', '1,200 units', 'Order 800', 'Transfer 360', '12% in week 8'],
    names: ['Product + location + time', 'A2 · Demand over the next 4 weeks', 'A2 · Suggested replenishment', 'A3 · Separate transfer example', 'A4 · Separate markdown example'],
    notes: ['Sales · stock · inbound orders · supplier lead times', '400 on hand · 200 inbound · 200 buffer · 14-day lead time', '1,200 demand + 200 buffer − 400 on hand − 200 inbound = 800 units', 'Central hub → West location · check stock at both ends', '12% price reduction · review margin first'],
    forecast: 'Illustrative demand trend over four weeks',
  },
  hi: {
    label: 'योजना का उदाहरण', review: 'समीक्षा और निर्णय आपकी टीम के हाथ में।',
    values: ['बिक्री + स्टॉक', '1,200 इकाइयाँ', '800 मंगाएँ', '360 भेजें', 'सप्ताह 8 में 12%'],
    names: ['उत्पाद + स्थान + समय', 'A2 · अगले 4 सप्ताह की मांग', 'A2 · खरीद का सुझाव', 'A3 · अलग ट्रांसफर उदाहरण', 'A4 · अलग कीमत का उदाहरण'],
    notes: ['बिक्री · स्टॉक · आने वाले ऑर्डर · सप्लायर का समय', '400 उपलब्ध · 200 आने वाला · 200 सुरक्षा · 14 दिन', '1,200 मांग + 200 सुरक्षा − 400 स्टॉक − 200 आने वाला = 800', 'केंद्रीय हब → पश्चिमी स्थान · दोनों का स्टॉक देखें', 'कीमत में 12% कमी · पहले मार्जिन देखें'],
    forecast: 'चार सप्ताह में मांग का उदाहरण',
  },
  te: {
    label: 'ఉదాహరణ ప్రణాళిక', review: 'మీ బృందమే సమీక్షించి నిర్ణయిస్తుంది.',
    values: ['అమ్మకాలు + స్టాక్', '1,200 యూనిట్లు', '800 ఆర్డర్', '360 బదిలీ', '8వ వారంలో 12%'],
    names: ['ఉత్పత్తి + ప్రదేశం + సమయం', 'A2 · వచ్చే 4 వారాల డిమాండ్', 'A2 · సూచించిన ఆర్డర్', 'A3 · వేరే బదిలీ ఉదాహరణ', 'A4 · వేరే ధర ఉదాహరణ'],
    notes: ['అమ్మకాలు · స్టాక్ · రానున్న ఆర్డర్లు · సరఫరా సమయం', '400 అందుబాటులో · 200 రానున్నవి · 200 బఫర్ · 14 రోజులు', '1,200 డిమాండ్ + 200 బఫర్ − 400 స్టాక్ − 200 రానున్నవి = 800', 'సెంట్రల్ హబ్ → పశ్చిమ ప్రదేశం · రెండుచోట్ల స్టాక్ చూడండి', 'ధరలో 12% తగ్గింపు · ముందు మార్జిన్ చూడండి'],
    forecast: 'నాలుగు వారాల డిమాండ్ ఉదాహరణ',
  },
};

export function SolutionBrief({ step, lang }: { step: number; lang: Lang }) {
  const copy = briefs[lang];
  return <aside className="solution-brief" aria-label={copy.label}>
    <p className="brief-label">{copy.label}</p>
    <strong>{copy.values[step]}</strong>
    <span>{copy.names[step]}</span>
    {step === 1 && <svg viewBox="0 0 220 35" role="img" aria-label={copy.forecast}>
      <path d="M0 30H220M0 10H220" stroke="currentColor" opacity=".15" />
      <path d="M1 28L32 25L62 27L94 19L124 21L155 12L187 14L219 3" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>}
    <small>{copy.notes[step]}</small>
    <p className="brief-review">{copy.review}</p>
  </aside>;
}
