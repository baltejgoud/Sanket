import type { Lang } from "../i18n";

/** Palette strings. They live in the palette's lazy chunk, not the page's first download. */
export interface PaletteCopy {
  label: string;
  placeholder: string;
  groups: { chapters: string; tools: string; actions: string };
  results: (n: number) => string;
  empty: string;
  keys: string;
  tools: { stories: string };
  actions: { pause: string; play: string; whatsapp: string; email: string; copy: string; copied: string; copyFail: string };
}

export const paletteCopy: Record<Lang, PaletteCopy> = {
  en: {
    label: "Jump to",
    placeholder: "Search chapters, tools and actions",
    groups: { chapters: "Chapters", tools: "Tools", actions: "Actions" },
    results: n => (n === 1 ? "1 result" : `${n} results`),
    empty: "Nothing matches. Try “ROI”, “sandbox” or “Hindi”.",
    keys: "↑↓ move · Enter open · Esc close",
    tools: { stories: "Public inventory failures" },
    actions: {
      pause: "Pause motion",
      play: "Play motion",
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
    tools: { stories: "स्टॉक की सार्वजनिक विफलताएँ" },
    actions: {
      pause: "गति रोकें",
      play: "गति चालू करें",
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
    tools: { stories: "బహిరంగ స్టాక్ వైఫల్యాలు" },
    actions: {
      pause: "కదలిక ఆపండి",
      play: "కదలిక ప్రారంభించండి",
      whatsapp: "WhatsAppలో మాట్లాడండి",
      email: "ఈమెయిల్ పంపండి",
      copy: "ఈమెయిల్ చిరునామా కాపీ చేయండి",
      copied: "ఈమెయిల్ చిరునామా కాపీ అయింది",
      copyFail: "కాపీ కాలేదు. చిరునామా",
    },
  },
};
