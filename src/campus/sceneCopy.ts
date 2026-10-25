import type { Lang } from '../i18n';

/**
 * Strings drawn inside the 3D scene: rack status, signal sources, data panels and the hero hint.
 * All figures belong to the same illustrative case as the story cards (A2: 400 on hand, ~43 a day,
 * 14-day lead time, 1,200 forecast, order 800; A3: transfer 360; A4: 12% markdown in week 8).
 */
type Rack = [name: string, detail: string];
export type SceneCopy = {
  hint: string; lens: string; xray: string;
  racks: [Rack, Rack, Rack, Rack];
  /** Rack tags on phones, where four full names cannot sit side by side. */
  racksShort: [string, string, string, string];
  sources: [string, string, string];
  gap: { title: string; onHand: string; rate: string; today: string; lasts: string; delivery: string; empty: string };
  out: { title: string; left: string; waiting: string; stamp: string };
  slow: { title: string; days: string; note: string };
  forecast: { title: string; units: string; band: string; week: string };
  order: { title: string; rows: [string, string, string, string, string] };
  transfer: { title: string; units: string; from: string; to: string };
  markdown: { title: string; note: string };
};

export const sceneCopy: Record<Lang, SceneCopy> = {
  en: {
    hint: 'Scroll to explore', lens: 'Point at the roof to look inside', xray: 'X-RAY',
    racksShort: ['A1 · Steady', 'A2 · Fast', 'A3 · Spare', 'A4 · Slow'],
    racks: [['A1 · Steady seller', 'Stock matches demand'], ['A2 · Selling fast', 'Runs out in about 9 days'], ['A3 · Spare stock', 'Could supply a transfer'], ['A4 · Selling slowly', 'About 120 days of stock']],
    sources: ['Sales', 'Stock on hand', 'Supplier lead times'],
    gap: { title: 'A2 · Will the stock last?', onHand: 'on hand', rate: 'Selling about 43 a day', today: 'Today', lasts: 'Stock lasts ~9 days', delivery: 'Next delivery · day 14', empty: '5 days with nothing to sell' },
    out: { title: 'A2 · Out of stock', left: 'left on the shelf', waiting: 'units asked for, none to sell', stamp: 'Out of stock' },
    slow: { title: 'A4 · Selling slowly', days: 'days of stock', note: 'Space and cash tied up' },
    forecast: { title: 'A2 · Next 4 weeks', units: 'units forecast', band: 'Shaded: likely range', week: 'Week' },
    order: { title: 'A2 · Suggested order', rows: ['Demand', '+ Buffer', '− On hand', '− Inbound', '= Order'] },
    transfer: { title: 'A3 · Suggested transfer', units: 'units', from: 'Central hub', to: 'West' },
    markdown: { title: 'A4 · Possible markdown', note: 'Week 8 · check margin first' },
  },
  hi: {
    hint: 'स्क्रॉल करके देखें', lens: 'छत पर कर्सर ले जाकर अंदर देखें', xray: 'एक्स-रे',
    racksShort: ['A1 · स्थिर', 'A2 · तेज़', 'A3 · अतिरिक्त', 'A4 · धीमा'],
    racks: [['A1 · स्थिर बिक्री', 'स्टॉक मांग के बराबर'], ['A2 · तेज़ बिक्री', 'लगभग 9 दिन में खत्म'], ['A3 · अतिरिक्त स्टॉक', 'ट्रांसफर के लिए उपलब्ध'], ['A4 · धीमी बिक्री', 'लगभग 120 दिन का स्टॉक']],
    sources: ['बिक्री', 'उपलब्ध स्टॉक', 'सप्लायर का समय'],
    gap: { title: 'A2 · क्या स्टॉक चलेगा?', onHand: 'उपलब्ध', rate: 'रोज़ लगभग 43 की बिक्री', today: 'आज', lasts: 'स्टॉक ~9 दिन चलेगा', delivery: 'अगली डिलीवरी · दिन 14', empty: '5 दिन बेचने को कुछ नहीं' },
    out: { title: 'A2 · स्टॉक खत्म', left: 'शेल्फ पर बचा', waiting: 'इकाइयों की मांग, बेचने को कुछ नहीं', stamp: 'स्टॉक खत्म' },
    slow: { title: 'A4 · धीमी बिक्री', days: 'दिन का स्टॉक', note: 'जगह और पैसा अटका' },
    forecast: { title: 'A2 · अगले 4 सप्ताह', units: 'इकाइयों का पूर्वानुमान', band: 'छायांकित: संभावित सीमा', week: 'सप्ताह' },
    order: { title: 'A2 · खरीद का सुझाव', rows: ['मांग', '+ सुरक्षा', '− उपलब्ध', '− आने वाला', '= मंगाएँ'] },
    transfer: { title: 'A3 · ट्रांसफर का सुझाव', units: 'इकाइयाँ', from: 'केंद्रीय हब', to: 'पश्चिम' },
    markdown: { title: 'A4 · संभावित कीमत कमी', note: 'सप्ताह 8 · पहले मार्जिन देखें' },
  },
  te: {
    hint: 'స్క్రోల్ చేసి చూడండి', lens: 'లోపల చూడటానికి పైకప్పుపై కర్సర్ ఉంచండి', xray: 'ఎక్స్-రే',
    racksShort: ['A1 · స్థిరం', 'A2 · వేగం', 'A3 · అదనం', 'A4 · నెమ్మది'],
    racks: [['A1 · స్థిరమైన అమ్మకం', 'డిమాండ్‌కు సరిపడా స్టాక్'], ['A2 · వేగంగా అమ్ముడవుతోంది', 'సుమారు 9 రోజుల్లో ఖాళీ'], ['A3 · అదనపు స్టాక్', 'బదిలీకి అందుబాటులో'], ['A4 · నెమ్మదిగా అమ్మకం', 'సుమారు 120 రోజుల స్టాక్']],
    sources: ['అమ్మకాలు', 'ఉన్న స్టాక్', 'సరఫరా సమయం'],
    gap: { title: 'A2 · స్టాక్ సరిపోతుందా?', onHand: 'అందుబాటులో', rate: 'రోజుకు సుమారు 43 అమ్మకం', today: 'ఈరోజు', lasts: 'స్టాక్ ~9 రోజులు', delivery: 'తదుపరి డెలివరీ · 14వ రోజు', empty: '5 రోజులు అమ్మడానికి ఏమీ లేదు' },
    out: { title: 'A2 · స్టాక్ ఖాళీ', left: 'షెల్ఫ్‌పై మిగిలింది', waiting: 'యూనిట్లకు డిమాండ్, అమ్మడానికి లేవు', stamp: 'స్టాక్ ఖాళీ' },
    slow: { title: 'A4 · నెమ్మదిగా అమ్మకం', days: 'రోజుల స్టాక్', note: 'స్థలం, డబ్బు నిలిచిపోయాయి' },
    forecast: { title: 'A2 · వచ్చే 4 వారాలు', units: 'యూనిట్ల అంచనా', band: 'నీడ: సంభావ్య పరిధి', week: 'వారం' },
    order: { title: 'A2 · సూచించిన ఆర్డర్', rows: ['డిమాండ్', '+ బఫర్', '− అందుబాటులో', '− రానున్నవి', '= ఆర్డర్'] },
    transfer: { title: 'A3 · సూచించిన బదిలీ', units: 'యూనిట్లు', from: 'సెంట్రల్ హబ్', to: 'పశ్చిమం' },
    markdown: { title: 'A4 · సాధ్యమైన ధర తగ్గింపు', note: '8వ వారం · ముందు మార్జిన్ చూడండి' },
  },
};
