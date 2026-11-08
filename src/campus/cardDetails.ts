import type { Lang } from '../i18n';
import type { StoryChapter } from './guideCopy';

type Details = { steps: Record<StoryChapter, string[]>; facts: Record<StoryChapter, string[]> };
export const cardDetails: Record<Lang, Details> = {
  en: {
    steps: { warehouse: ['Outside', 'Inside'], problems: ['Demand', 'Stockout', 'Surplus'], forecast: ['Connect', 'Forecast', 'Order', 'Transfer', 'Price'], decide: ['Review', 'Pick', 'Load', 'Route', 'Dispatch'] },
    facts: { warehouse: ['ONE CONNECTED WAREHOUSE', '4 RACKS · 3 STOCK DECISIONS'], problems: ['A2 · 9 DAYS OF COVER / 14-DAY LEAD TIME', 'A2 · 0 ON HAND', 'A4 · 120 DAYS OF STOCK'], forecast: ['DATA → DECISION', 'A2 · 1,200 UNITS / 4 WEEKS', 'A2 · ORDER 800', 'A3 · TRANSFER 360', 'A4 · −12% IN WEEK 8'], decide: ['360 UNITS · TEAM REVIEW', 'RACK → DISPATCH', 'CHECK → LOAD', 'CENTRAL HUB → WEST', 'DISPATCH → REVIEW'] },
  },
  hi: {
    steps: { warehouse: ['बाहर', 'अंदर'], problems: ['मांग', 'स्टॉक खत्म', 'अतिरिक्त'], forecast: ['जोड़ें', 'पूर्वानुमान', 'ऑर्डर', 'ट्रांसफर', 'कीमत'], decide: ['समीक्षा', 'उठाएँ', 'लोड', 'रास्ता', 'डिस्पैच'] },
    facts: { warehouse: ['एक जुड़ा हुआ गोदाम', '4 रैक · 3 स्टॉक निर्णय'], problems: ['A2 · 9 दिन का स्टॉक / 14 दिन में डिलीवरी', 'A2 · 0 उपलब्ध', 'A4 · 120 दिन का स्टॉक'], forecast: ['डेटा → निर्णय', 'A2 · 1,200 इकाइयाँ / 4 सप्ताह', 'A2 · 800 मंगाएँ', 'A3 · 360 भेजें', 'A4 · सप्ताह 8 में −12%'], decide: ['360 इकाइयाँ · टीम की समीक्षा', 'रैक → डिस्पैच', 'जाँच → लोड', 'केंद्रीय हब → पश्चिम', 'डिस्पैच → समीक्षा'] },
  },
  te: {
    steps: { warehouse: ['బయట', 'లోపల'], problems: ['డిమాండ్', 'స్టాక్ లేదు', 'అదనపు'], forecast: ['అనుసంధానం', 'అంచనా', 'ఆర్డర్', 'బదిలీ', 'ధర'], decide: ['సమీక్ష', 'పిక్', 'లోడ్', 'మార్గం', 'డిస్పాచ్'] },
    facts: { warehouse: ['ఒక అనుసంధాన గిడ్డంగి', '4 ర్యాక్‌లు · 3 నిర్ణయాలు'], problems: ['A2 · 9 రోజుల స్టాక్ / 14 రోజుల సరఫరా', 'A2 · 0 అందుబాటులో', 'A4 · 120 రోజుల స్టాక్'], forecast: ['డేటా → నిర్ణయం', 'A2 · 1,200 యూనిట్లు / 4 వారాలు', 'A2 · 800 ఆర్డర్', 'A3 · 360 బదిలీ', 'A4 · 8వ వారంలో −12%'], decide: ['360 యూనిట్లు · బృంద సమీక్ష', 'ర్యాక్ → డిస్పాచ్', 'తనిఖీ → లోడ్', 'సెంట్రల్ హబ్ → పశ్చిమ', 'డిస్పాచ్ → సమీక్ష'] },
  },
};
