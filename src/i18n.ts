import { createContext, useContext } from "react";

export type Lang = "en" | "hi" | "te";

export const languages: { code: Lang; label: string; name: string }[] = [
  { code: "en", label: "EN", name: "English" },
  { code: "hi", label: "हिं", name: "हिन्दी" },
  { code: "te", label: "తె", name: "తెలుగు" },
];

/** Shell strings needed up front. The tool dialogs' strings load with them (chapters/toolCopy.ts). */
export type Dict = {
  langLabel: string;
  skip: string;
  cta: { whatsapp: string; whatsappShort: string; email: string; floating: string; waMessage: string };
  contact: {
    eyebrow: string;
    h2a: string;
    h2b: string;
    h2c: string;
    p: string;
    waNote: string;
    emailTitle: string;
    emailNote: string;
    copy: string;
    copied: string;
    copyFail: string;
  };
  footer: { tagline: string; rights: string; back: string };
};

const en: Dict = {
  langLabel: "Language",
  skip: "Skip to content",
  cta: {
    whatsapp: "Chat on WhatsApp",
    whatsappShort: "WhatsApp us",
    email: "Email us",
    floating: "Chat with us",
    waMessage: "Hi, I'd like to see how SANKET could work for our business.",
  },
  contact: {
    eyebrow: "TALK TO US DIRECTLY",
    h2a: "Tell us what's going wrong.",
    h2b: "We'll show you what ",
    h2c: " would do.",
    p: "No forms and no sales queue. Message the people who built it, and we'll walk you through your own products and your own numbers.",
    waNote: "Opens WhatsApp with a message ready to send",
    emailTitle: "Send us an email",
    emailNote: "Opens your email app with a message ready to send",
    copy: "Copy email address",
    copied: "Email copied to clipboard",
    copyFail: "Copy unavailable. Use the email link.",
  },
  footer: {
    tagline: "Intelligence for a world that won't stand still.",
    rights: "All rights reserved.",
    back: "Back to top",
  },
};

const hi: Dict = {
  langLabel: "भाषा",
  skip: "सीधे सामग्री पर जाएँ",
  cta: {
    whatsapp: "WhatsApp पर बात करें",
    whatsappShort: "WhatsApp करें",
    email: "ईमेल करें",
    floating: "हमसे बात करें",
    waMessage: "नमस्ते, मैं जानना चाहता/चाहती हूँ कि SANKET हमारे कारोबार के लिए कैसे काम कर सकता है।",
  },
  contact: {
    eyebrow: "हमसे सीधे बात करें",
    h2a: "बताइए क्या ग़लत हो रहा है।",
    h2b: "हम दिखाएँगे कि ",
    h2c: " क्या करेगा।",
    p: "कोई फ़ॉर्म नहीं, कोई सेल्स कतार नहीं। इसे बनाने वालों को सीधे मैसेज करें, और हम आपके अपने प्रोडक्ट्स और आँकड़ों के साथ आपको सब दिखाएँगे।",
    waNote: "WhatsApp एक तैयार मैसेज के साथ खुलेगा",
    emailTitle: "हमें ईमेल भेजें",
    emailNote: "आपका ईमेल ऐप एक तैयार मैसेज के साथ खुलेगा",
    copy: "ईमेल पता कॉपी करें",
    copied: "ईमेल कॉपी हो गया",
    copyFail: "कॉपी नहीं हो सका। ईमेल लिंक का इस्तेमाल करें।",
  },
  footer: {
    tagline: "एक ऐसी दुनिया के लिए समझदारी, जो कभी नहीं रुकती।",
    rights: "सर्वाधिकार सुरक्षित।",
    back: "ऊपर जाएँ",
  },
};

const te: Dict = {
  langLabel: "భాష",
  skip: "నేరుగా విషయానికి వెళ్ళండి",
  cta: {
    whatsapp: "WhatsAppలో మాట్లాడండి",
    whatsappShort: "WhatsApp చేయండి",
    email: "ఈమెయిల్ చేయండి",
    floating: "మాతో మాట్లాడండి",
    waMessage: "నమస్తే, SANKET మా వ్యాపారానికి ఎలా ఉపయోగపడుతుందో చూడాలనుకుంటున్నాను.",
  },
  contact: {
    eyebrow: "మాతో నేరుగా మాట్లాడండి",
    h2a: "ఏం తప్పు జరుగుతోందో చెప్పండి.",
    h2b: "",
    h2c: " ఏం చేస్తుందో మేము చూపిస్తాం.",
    p: "ఫారాలు లేవు, సేల్స్ క్యూ లేదు. దీన్ని తయారు చేసినవారికి నేరుగా మెసేజ్ చేయండి, మీ సొంత ప్రొడక్ట్‌లు, మీ సొంత అంకెలతో మీకు అన్నీ చూపిస్తాం.",
    waNote: "సిద్ధంగా ఉన్న మెసేజ్‌తో WhatsApp తెరుచుకుంటుంది",
    emailTitle: "మాకు ఈమెయిల్ పంపండి",
    emailNote: "సిద్ధంగా ఉన్న మెసేజ్‌తో మీ ఈమెయిల్ యాప్ తెరుచుకుంటుంది",
    copy: "ఈమెయిల్ చిరునామా కాపీ చేయండి",
    copied: "ఈమెయిల్ కాపీ అయింది",
    copyFail: "కాపీ కాలేదు. ఈమెయిల్ లింక్ ఉపయోగించండి.",
  },
  footer: {
    tagline: "ఎప్పుడూ ఆగని ప్రపంచం కోసం తెలివైన నిర్ణయాలు.",
    rights: "సర్వ హక్కులు ప్రత్యేకించబడ్డాయి.",
    back: "పైకి వెళ్ళండి",
  },
};

export const dict: Record<Lang, Dict> = { en, hi, te };

export const LangContext = createContext<Lang>("en");
export const useT = () => dict[useContext(LangContext)];
