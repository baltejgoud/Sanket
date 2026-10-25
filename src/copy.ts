import { useContext } from "react";
import { LangContext, type Lang } from "./i18n";

/** Strings the page shell needs up front (header, contact links). Tool strings live in chapters/toolCopy.ts. */
export interface Copy {
  nav: { signal: string; forecast: string; decide: string; world: string; proof: string; talk: string; menu: string; close: string; index: string; pause: string; play: string; jump: string; dock: string };
  contact: {
    plate: string;
    include: string;
    remove: string;
    /** heading for the context lines inside the message */
    lead: string;
    industry: (name: string) => string;
    roi: (value: string, size: string) => string;
    sandbox: (scenario: string, qty: string) => string;
  };
}

const en: Copy = {
  nav: { signal: "Signal", forecast: "Forecast", decide: "Decide", world: "Your world", proof: "Proof", talk: "Talk to us", menu: "Open menu", close: "Close menu", index: "Index", pause: "Pause motion", play: "Play motion", jump: "Jump to", dock: "Quick actions" },
  contact: {
    plate: "Talk to us",
    include: "Your message will mention what you explored:",
    remove: "Remove",
    lead: "What I looked at on your site:",
    industry: name => `Industry: ${name}`,
    roi: (value, size) => `ROI estimate: ${value} a year (${size} sample)`,
    sandbox: (scenario, qty) => `Forecast sandbox: ${scenario}, reorder ${qty} units`,
  },
};

const hi: Copy = {
  nav: { signal: "संकेत", forecast: "पूर्वानुमान", decide: "निर्णय", world: "आपकी दुनिया", proof: "प्रमाण", talk: "बात करें", menu: "मेन्यू खोलें", close: "मेन्यू बंद करें", index: "सूची", pause: "गति रोकें", play: "गति चालू करें", jump: "यहाँ जाएँ", dock: "त्वरित विकल्प" },
  contact: {
    plate: "बात करें",
    include: "आपके संदेश में वह भी होगा जो आपने यहाँ देखा:",
    remove: "हटाएँ",
    lead: "आपकी साइट पर मैंने यह देखा:",
    industry: name => `उद्योग: ${name}`,
    roi: (value, size) => `ROI अनुमान: ${value} प्रति वर्ष (${size} का उदाहरण)`,
    sandbox: (scenario, qty) => `पूर्वानुमान सैंडबॉक्स: ${scenario}, ${qty} यूनिट का दोबारा ऑर्डर`,
  },
};

const te: Copy = {
  nav: { signal: "సంకేతం", forecast: "అంచనా", decide: "నిర్ణయం", world: "మీ ప్రపంచం", proof: "రుజువు", talk: "మాట్లాడండి", menu: "మెనూ తెరవండి", close: "మెనూ మూసివేయండి", index: "సూచిక", pause: "కదలిక ఆపండి", play: "కదలిక ప్రారంభించండి", jump: "ఇక్కడికి వెళ్లండి", dock: "త్వరిత చర్యలు" },
  contact: {
    plate: "మాట్లాడండి",
    include: "మీరు ఇక్కడ చూసినవి మీ సందేశంలో ఉంటాయి:",
    remove: "తీసివేయండి",
    lead: "మీ సైట్‌లో నేను చూసినవి:",
    industry: name => `పరిశ్రమ: ${name}`,
    roi: (value, size) => `ROI అంచనా: సంవత్సరానికి ${value} (${size} ఉదాహరణ)`,
    sandbox: (scenario, qty) => `అంచనా శాండ్‌బాక్స్: ${scenario}, ${qty} యూనిట్ల రీఆర్డర్`,
  },
};

export const copy: Record<Lang, Copy> = { en, hi, te };
export const useCopy = () => copy[useContext(LangContext)];
