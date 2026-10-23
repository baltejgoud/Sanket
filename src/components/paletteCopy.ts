import type { Lang } from "../i18n";

/** Palette strings. They live in the palette's lazy chunk, not the page's first download. */
export interface PaletteCopy {
  label: string;
  placeholder: string;
  groups: { chapters: string; tools: string; actions: string };
  results: (n: number) => string;
  empty: string;
  keys: string;
  chapters: Record<string, string>;
  tools: { roi: string; sandbox: string; connectors: string; stories: string; film: string };
  actions: { pause: string; play: string; explore: string; whatsapp: string; email: string; copy: string; copied: string; copyFail: string };
}

export const paletteCopy: Record<Lang, PaletteCopy> = {
  en: {
    label: "Jump to",
    placeholder: "Search chapters, tools and actions",
    groups: { chapters: "Chapters", tools: "Tools", actions: "Actions" },
    results: n => (n === 1 ? "1 result" : `${n} results`),
    empty: "Nothing matches. Try “ROI”, “sandbox” or “Hindi”.",
    keys: "↑↓ move · Enter open · Esc close",
    chapters: {
      top: "Start: Stock what sells",
      signal: "Signal: the world moves",
      problems: "The cost of guessing",
      forecast: "Forecast: three steps",
      command: "Try the forecast",
      decide: "Decide: order, move, mark down",
      industries: "Your industry",
      integrations: "Integrations",
      roi: "Proof: the business case",
      stories: "When the forecast is wrong",
      security: "Security",
      contact: "Talk to us",
    },
    tools: { roi: "ROI calculator", sandbox: "Forecast sandbox", connectors: "Search integrations", stories: "Public inventory failures", film: "Watch the 20-second film" },
    actions: {
      pause: "Pause motion",
      play: "Play motion",
      explore: "Explore the warehouse",
      whatsapp: "Chat on WhatsApp",
      email: "Send an email",
      copy: "Copy email address",
      copied: "Email address copied",
      copyFail: "Couldn’t copy. The address is",
    },
  },
  hi: {
    label: "यहाँ जाएँ",
    placeholder: "अध्याय, टूल और काम खोजें",
    groups: { chapters: "अध्याय", tools: "टूल", actions: "काम" },
    results: n => `${n} परिणाम`,
    empty: "कुछ नहीं मिला। “ROI”, “सैंडबॉक्स” या “हिन्दी” आज़माएँ।",
    keys: "↑↓ चुनें · Enter खोलें · Esc बंद करें",
    chapters: {
      top: "शुरुआत: जो बिकता है, वही रखें",
      signal: "संकेत: दुनिया बदलती है",
      problems: "अंदाज़े की कीमत",
      forecast: "पूर्वानुमान: तीन कदम",
      command: "पूर्वानुमान आज़माएँ",
      decide: "निर्णय: ऑर्डर, ट्रांसफ़र, मार्कडाउन",
      industries: "आपका उद्योग",
      integrations: "इंटीग्रेशन",
      roi: "प्रमाण: कारोबारी फ़ायदा",
      stories: "जब पूर्वानुमान गलत होता है",
      security: "सुरक्षा",
      contact: "बात करें",
    },
    tools: { roi: "ROI कैलकुलेटर", sandbox: "पूर्वानुमान सैंडबॉक्स", connectors: "इंटीग्रेशन खोजें", stories: "स्टॉक की सार्वजनिक विफलताएँ", film: "20 सेकंड की फ़िल्म देखें" },
    actions: {
      pause: "गति रोकें",
      play: "गति चालू करें",
      explore: "गोदाम में घूमें",
      whatsapp: "WhatsApp पर बात करें",
      email: "ईमेल भेजें",
      copy: "ईमेल पता कॉपी करें",
      copied: "ईमेल पता कॉपी हो गया",
      copyFail: "कॉपी नहीं हुआ। पता है",
    },
  },
  te: {
    label: "ఇక్కడికి వెళ్లండి",
    placeholder: "అధ్యాయాలు, టూల్స్, చర్యలను వెతకండి",
    groups: { chapters: "అధ్యాయాలు", tools: "టూల్స్", actions: "చర్యలు" },
    results: n => `${n} ఫలితాలు`,
    empty: "ఏమీ దొరకలేదు. “ROI”, “శాండ్‌బాక్స్” లేదా “తెలుగు” ప్రయత్నించండి.",
    keys: "↑↓ ఎంచుకోండి · Enter తెరవండి · Esc మూసివేయండి",
    chapters: {
      top: "ప్రారంభం: అమ్ముడయ్యేదే నిల్వ చేయండి",
      signal: "సంకేతం: ప్రపంచం మారుతుంది",
      problems: "ఊహించడం వల్ల నష్టం",
      forecast: "అంచనా: మూడు దశలు",
      command: "అంచనాను ప్రయత్నించండి",
      decide: "నిర్ణయం: ఆర్డర్, బదిలీ, మార్క్‌డౌన్",
      industries: "మీ పరిశ్రమ",
      integrations: "ఇంటిగ్రేషన్‌లు",
      roi: "రుజువు: వ్యాపార లాభం",
      stories: "అంచనా తప్పినప్పుడు",
      security: "భద్రత",
      contact: "మాట్లాడండి",
    },
    tools: { roi: "ROI కాలిక్యులేటర్", sandbox: "అంచనా శాండ్‌బాక్స్", connectors: "ఇంటిగ్రేషన్‌లను వెతకండి", stories: "బహిరంగ స్టాక్ వైఫల్యాలు", film: "20 సెకన్ల ఫిల్మ్ చూడండి" },
    actions: {
      pause: "కదలిక ఆపండి",
      play: "కదలిక ప్రారంభించండి",
      explore: "గోదాములో తిరగండి",
      whatsapp: "WhatsAppలో మాట్లాడండి",
      email: "ఈమెయిల్ పంపండి",
      copy: "ఈమెయిల్ చిరునామా కాపీ చేయండి",
      copied: "ఈమెయిల్ చిరునామా కాపీ అయింది",
      copyFail: "కాపీ కాలేదు. చిరునామా",
    },
  },
};
