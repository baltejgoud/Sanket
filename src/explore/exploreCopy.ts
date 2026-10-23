import type { Lang } from "../i18n";

/** Explore-mode strings. They live in its lazy chunk, not the page's first download. */
export interface ExploreCopy {
  eyebrow: string;
  title: string;
  close: string;
  timeline: string;
  next: string;
  signal: string;
  tilt: string;
  tiltOff: string;
  hint: string;
  none: string;
  role: string;
  help: string;
  ar: string;
  vr: string;
  quickLook: string;
  xrNote: string;
  xrFail: string;
  exit: string;
}

export const exploreCopy: Record<Lang, ExploreCopy> = {
  en: {
    eyebrow: "SANKET / Explore",
    title: "Explore the warehouse",
    close: "Close",
    timeline: "Timeline: unbalanced to in stock",
    next: "Next stockout",
    signal: "Send a signal",
    tilt: "Tilt to look",
    tiltOff: "Stop tilt",
    hint: "Select a column to read it, or press N for the next stockout.",
    none: "No stockouts left. The field is in stock.",
    role: "3D stock field",
    help: "Drag to orbit, scroll or pinch to zoom, right-drag or two fingers to pan. Keys: arrows orbit, + and − zoom, W A S D move, N next stockout, Enter sends a signal, Esc closes.",
    ar: "Place on your desk",
    vr: "View in space",
    quickLook: "View in AR",
    xrNote: "Uses your camera to find a surface. Nothing is recorded or sent.",
    xrFail: "Couldn’t start AR or VR on this device. You can keep exploring here.",
    exit: "Exit",
  },
  hi: {
    eyebrow: "SANKET / गोदाम",
    title: "गोदाम में घूमें",
    close: "बंद करें",
    timeline: "टाइमलाइन: असंतुलित से स्टॉक में",
    next: "अगला स्टॉकआउट",
    signal: "संकेत भेजें",
    tilt: "झुकाकर देखें",
    tiltOff: "झुकाना बंद करें",
    hint: "किसी कॉलम को चुनकर पढ़ें, या अगले स्टॉकआउट के लिए N दबाएँ।",
    none: "कोई स्टॉकआउट नहीं बचा। फ़ील्ड स्टॉक में है।",
    role: "3D स्टॉक फ़ील्ड",
    help: "घुमाने के लिए खींचें, ज़ूम के लिए स्क्रॉल या पिंच करें, खिसकाने के लिए राइट-ड्रैग या दो उँगलियाँ। कुंजियाँ: तीर घुमाते हैं, + और − ज़ूम, W A S D चलना, N अगला स्टॉकआउट, Enter संकेत भेजता है, Esc बंद करता है।",
    ar: "अपनी मेज़ पर रखें",
    vr: "स्पेस में देखें",
    quickLook: "AR में देखें",
    xrNote: "सतह खोजने के लिए आपका कैमरा इस्तेमाल होता है। कुछ भी रिकॉर्ड या भेजा नहीं जाता।",
    xrFail: "इस डिवाइस पर AR या VR शुरू नहीं हो सका। आप यहीं घूमना जारी रख सकते हैं।",
    exit: "बाहर निकलें",
  },
  te: {
    eyebrow: "SANKET / గోదాము",
    title: "గోదాములో తిరగండి",
    close: "మూసివేయండి",
    timeline: "టైమ్‌లైన్: అసమతుల్యం నుండి స్టాక్‌లో",
    next: "తదుపరి స్టాక్ కొరత",
    signal: "సంకేతం పంపండి",
    tilt: "వంచి చూడండి",
    tiltOff: "వంచడం ఆపండి",
    hint: "ఒక కాలమ్‌ను ఎంచుకుని చదవండి, లేదా తదుపరి స్టాక్ కొరతకు N నొక్కండి.",
    none: "స్టాక్ కొరత ఏదీ మిగలలేదు. ఫీల్డ్ స్టాక్‌లో ఉంది.",
    role: "3D స్టాక్ ఫీల్డ్",
    help: "తిప్పడానికి లాగండి, జూమ్ కోసం స్క్రోల్ లేదా పించ్ చేయండి, జరపడానికి రైట్-డ్రాగ్ లేదా రెండు వేళ్లు. కీలు: బాణాలు తిప్పుతాయి, + మరియు − జూమ్, W A S D కదలిక, N తదుపరి స్టాక్ కొరత, Enter సంకేతం పంపుతుంది, Esc మూసివేస్తుంది.",
    ar: "మీ టేబుల్‌పై ఉంచండి",
    vr: "స్పేస్‌లో చూడండి",
    quickLook: "ARలో చూడండి",
    xrNote: "ఉపరితలాన్ని కనుగొనడానికి మీ కెమెరా ఉపయోగపడుతుంది. ఏదీ రికార్డ్ చేయబడదు, పంపబడదు.",
    xrFail: "ఈ పరికరంలో AR లేదా VR ప్రారంభం కాలేదు. మీరు ఇక్కడే చూడటం కొనసాగించవచ్చు.",
    exit: "నిష్క్రమించండి",
  },
};
