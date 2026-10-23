import { useContext } from "react";
import { LangContext, type Lang } from "./i18n";
import type { StageCopy } from "./field/FieldStage";

/** Strings introduced by the Stock Field experience. Existing copy stays in i18n.ts. */
export interface Copy {
  nav: { signal: string; forecast: string; decide: string; world: string; proof: string; talk: string; menu: string; close: string; index: string; pause: string; play: string; jump: string };
  rail: string[];
  hero: { pos: string; gloss: string; see: string; talk: string; scroll: string; cursor: string };
  stage: StageCopy;
  signal: { plate: string; a: string; b: string; body: string; listLabel: string; signals: string[]; caption: string };
  problems: { plate: string; fieldLabel: string; captions: string[] };
  forecast: {
    plate: string;
    band: string;
    scenarios: [string, string, string];
    horizon: (n: number) => string;
    expected: string;
    perWeek: string;
    vsPrior: string;
    actual: string;
    p50: string;
    range: string;
    forecastMark: string;
    adjust: string;
    reset: string;
    drag: string;
    decision: string;
    reorder: string;
    leadTime: string;
    technical: string;
    techBody: string;
    check: string;
    chartLabel: string;
  };
  film: { film: string; title: string; desc: string; play: string; example: string };
  decide: {
    plate: string;
    verbs: { verb: string; name: string; desc: string; result: string; detail: string }[];
    sandboxLabel: string;
    control: string;
    step: string;
  };
  world: {
    plate: string;
    private: string;
    telemetry: string;
    example: string;
    noMatch: string;
    englishNote: string;
    bridge: string;
    api: string;
    scoped: string;
    close: string;
    all: string;
  };
  proof: { plate: string; read: string; evidence: string; year: string; company: string; what: string };
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
  footer: { signature: string };
}

const en: Copy = {
  nav: { signal: "Signal", forecast: "Forecast", decide: "Decide", world: "Your world", proof: "Proof", talk: "Talk to us", menu: "Open menu", close: "Close menu", index: "Index", pause: "Pause motion", play: "Play motion", jump: "Jump to" },
  rail: ["Unbalanced", "Signal", "Forecast", "Decide", "In stock"],
  hero: {
    pos: "noun",
    gloss: "a signal; a sign of what comes next.",
    see: "See it decide",
    talk: "Talk to the builders",
    scroll: "Scroll to rebalance the field",
    cursor: "Send a signal",
  },
  stage: {
    readout: "Field readout",
    onHand: "On hand",
    need: "Forecast need",
    status: { short: "Stockout risk", over: "Overstock", ok: "Healthy", new: "New · no history", sheet: "Spreadsheet guess" },
    hint: "Hover the field · click to send a signal",
    hintTouch: "Tap the field to send a signal",
    illustrative: "Illustrative field · product × location",
    surplus: "Central hub · surplus",
    shortage: "West DC · stockout",
    signals: ["Weather", "Search trends", "Festival week"],
  },
  signal: {
    plate: "Signal",
    a: "The world moves.",
    b: "Your stock should, too.",
    body: "A trend takes off. The weather turns. Demand shifts before the spreadsheet does. SANKET connects the signals to help you see what comes next—and decide what to do about it.",
    listLabel: "Signals SANKET reads",
    signals: ["Sell-through", "Weather", "Search trends", "Social buzz", "Festival calendars", "Competitor prices", "Freight costs"],
    caption: "Each wave is a signal reaching the stock it affects.",
  },
  problems: {
    plate: "The cost of guessing",
    fieldLabel: "In the field",
    captions: [
      "Empty pits where demand is highest.",
      "Heavy towers far from any demand.",
      "One number copied across a whole patch.",
      "A new row with nothing to learn from.",
      "A signal arrives. The old plan can’t see it.",
      "A surplus tower beside an empty pit.",
    ],
  },
  forecast: {
    plate: "Forecast",
    band: "The pale band is where stock should be. The gap is the decision.",
    scenarios: ["Baseline", "Price cut", "Viral spike"],
    horizon: n => `${n}-week horizon`,
    expected: "Expected demand",
    perWeek: "units / week",
    vsPrior: "vs. prior period",
    actual: "Actual demand",
    p50: "p50 forecast",
    range: "p10–p90 range",
    forecastMark: "Forecast",
    adjust: "Demand adjustment",
    reset: "Reset forecast",
    drag: "Drag the chart, or use the demand slider, to adjust demand",
    decision: "Next best action",
    reorder: "units to reorder",
    leadTime: "Example · two-week lead time",
    technical: "Technical details",
    techBody:
      "Forecast range: p10–p90. The centre line is the median (p50). SLSQP quantile stacking / pinball loss are architecture concepts; this sandbox uses simulated data.",
    check: "Forecast error 18.42% · 38% better than a seasonal baseline · illustrative",
    chartLabel: "Probabilistic demand forecast",
  },
  film: {
    film: "The next order, explained",
    title: "See the next order take shape.",
    desc: "From a change in demand to a decision you can review. A 20-second example, using the product sandbox.",
    play: "Play the 20-second product film",
    example: "Illustrative product walkthrough · English · 20 seconds",
  },
  decide: {
    plate: "Decide",
    verbs: [
      { verb: "Order.", name: "Order the right amount", desc: "Balance carrying cost against lost sales at the optimal order quantity.", result: "Order 1,240 units", detail: "Service target 95% · Lead time 14 days" },
      { verb: "Move.", name: "Balance stock across locations", desc: "Put safety stock in the right place, across every node in your network.", result: "Transfer 360 units", detail: "Central hub → West distribution centre" },
      { verb: "Mark down.", name: "Time your markdowns", desc: "Find the right price and moment before inventory becomes dead stock.", result: "Markdown 12% in W8", detail: "Projected sell-through 92% · margin protected" },
      { verb: "Adapt.", name: "Adapt as demand changes", desc: "Continuously adapt replenishment policies to changing real-world conditions.", result: "Reorder point 820", detail: "PPO policy · simulation reward +12.8%" },
    ],
    sandboxLabel: "Sandbox decision · illustrative",
    control: "Ready for your approval. You stay in control; SANKET does the maths.",
    step: "Decision",
  },
  world: {
    plate: "Your world",
    private: "Private workspace",
    telemetry: "Sandbox workspace · illustrative telemetry",
    example: "Example product",
    noMatch: "No matching integrations.",
    englishNote: "Industry details are in English.",
    bridge: "XML / HTTP bridge",
    api: "API / batch ingestion",
    scoped: "Tenant-scoped configuration · Credentials required to connect",
    close: "Close",
    all: "All",
  },
  proof: { plate: "Proof", read: "Read the story and sources", evidence: "Public industry examples, not SANKET customer results", year: "Year", company: "Who", what: "What happened" },
  contact: {
    plate: "Talk to us",
    include: "Your message will mention what you explored:",
    remove: "Remove",
    lead: "What I looked at on your site:",
    industry: name => `Industry: ${name}`,
    roi: (value, size) => `ROI estimate: ${value} a year (${size} sample)`,
    sandbox: (scenario, qty) => `Forecast sandbox: ${scenario}, reorder ${qty} units`,
  },
  footer: { signature: "A signal of what comes next." },
};

const hi: Copy = {
  nav: { signal: "संकेत", forecast: "पूर्वानुमान", decide: "निर्णय", world: "आपकी दुनिया", proof: "प्रमाण", talk: "बात करें", menu: "मेन्यू खोलें", close: "मेन्यू बंद करें", index: "सूची", pause: "गति रोकें", play: "गति चालू करें", jump: "यहाँ जाएँ" },
  rail: ["असंतुलित", "संकेत", "पूर्वानुमान", "निर्णय", "स्टॉक में"],
  hero: {
    pos: "संज्ञा",
    gloss: "एक संकेत; आगे क्या होने वाला है, उसका इशारा।",
    see: "निर्णय होते देखें",
    talk: "बनाने वालों से बात करें",
    scroll: "स्क्रॉल करें, स्टॉक को संतुलित होते देखें",
    cursor: "संकेत भेजें",
  },
  stage: {
    readout: "फ़ील्ड रीडआउट",
    onHand: "मौजूद",
    need: "अनुमानित ज़रूरत",
    status: { short: "स्टॉक ख़त्म होने का ख़तरा", over: "ज़रूरत से ज़्यादा", ok: "ठीक", new: "नया · कोई इतिहास नहीं", sheet: "स्प्रेडशीट का अंदाज़ा" },
    hint: "फ़ील्ड पर कर्सर रखें · क्लिक करके संकेत भेजें",
    hintTouch: "संकेत भेजने के लिए फ़ील्ड पर टैप करें",
    illustrative: "उदाहरण फ़ील्ड · प्रोडक्ट × लोकेशन",
    surplus: "केंद्रीय गोदाम · अतिरिक्त",
    shortage: "पश्चिम DC · स्टॉक ख़त्म",
    signals: ["मौसम", "सर्च ट्रेंड", "त्योहार का हफ़्ता"],
  },
  signal: {
    plate: "संकेत",
    a: "दुनिया बदलती है।",
    b: "आपका स्टॉक भी बदले।",
    body: "रुझान बदलते हैं। मौसम बदलता है। स्प्रेडशीट से पहले मांग बदल जाती है। SANKET संकेतों को जोड़कर अगला कदम समझने में मदद करता है।",
    listLabel: "SANKET किन संकेतों को पढ़ता है",
    signals: ["असली बिक्री", "मौसम", "सर्च ट्रेंड", "सोशल बज़", "त्योहारों का कैलेंडर", "प्रतिस्पर्धी की कीमतें", "माल-भाड़ा"],
    caption: "हर लहर एक संकेत है, जो उस स्टॉक तक पहुँचती है जिस पर उसका असर होता है।",
  },
  problems: {
    plate: "अंदाज़े की कीमत",
    fieldLabel: "फ़ील्ड में देखें",
    captions: [
      "जहाँ माँग सबसे ज़्यादा है, वहीं खाली गड्ढे।",
      "माँग से दूर, भारी ढेर।",
      "एक ही संख्या, पूरे हिस्से में कॉपी की हुई।",
      "एक नई पंक्ति, जिसके पास सीखने को कुछ नहीं।",
      "एक संकेत आता है। पुरानी योजना उसे देख नहीं पाती।",
      "खाली गड्ढे के ठीक बगल में अतिरिक्त स्टॉक का ढेर।",
    ],
  },
  forecast: {
    plate: "पूर्वानुमान",
    band: "हल्की पट्टी वह जगह है जहाँ स्टॉक होना चाहिए। बीच का फ़ासला ही निर्णय है।",
    scenarios: ["बेसलाइन", "कीमत में कटौती", "वायरल उछाल"],
    horizon: n => `${n} हफ़्ते`,
    expected: "अनुमानित माँग",
    perWeek: "यूनिट / हफ़्ता",
    vsPrior: "पिछली अवधि की तुलना में",
    actual: "असली माँग",
    p50: "p50 पूर्वानुमान",
    range: "p10–p90 रेंज",
    forecastMark: "पूर्वानुमान",
    adjust: "माँग में बदलाव",
    reset: "पूर्वानुमान रीसेट करें",
    drag: "माँग बदलने के लिए चार्ट को खींचें या स्लाइडर इस्तेमाल करें",
    decision: "अगला सबसे अच्छा क़दम",
    reorder: "यूनिट दोबारा ऑर्डर करें",
    leadTime: "उदाहरण · दो हफ़्ते का लीड टाइम",
    technical: "तकनीकी जानकारी",
    techBody:
      "पूर्वानुमान रेंज: p10–p90। बीच की रेखा माध्यिका (p50) है। SLSQP क्वांटाइल स्टैकिंग / पिनबॉल लॉस आर्किटेक्चर की अवधारणाएँ हैं; यह सैंडबॉक्स सिम्युलेटेड डेटा इस्तेमाल करता है।",
    check: "पूर्वानुमान त्रुटि 18.42% · सीज़नल बेसलाइन से 38% बेहतर · उदाहरण",
    chartLabel: "संभावित माँग का पूर्वानुमान",
  },
  film: {
    film: "अगला ऑर्डर समझें",
    title: "देखें, अगला ऑर्डर कैसे तय होता है।",
    desc: "मांग में बदलाव से आपके निर्णय तक। प्रोडक्ट सैंडबॉक्स का 20-सेकंड का उदाहरण।",
    play: "20-सेकंड का प्रोडक्ट वीडियो चलाएँ",
    example: "उदाहरण वॉकथ्रू · अंग्रेज़ी · 20 सेकंड",
  },
  decide: {
    plate: "निर्णय",
    verbs: [
      { verb: "ऑर्डर।", name: "सही मात्रा में ऑर्डर", desc: "स्टॉक रखने की लागत और खोई बिक्री के बीच संतुलन, सबसे सही ऑर्डर मात्रा पर।", result: "1,240 यूनिट ऑर्डर करें", detail: "सर्विस लक्ष्य 95% · लीड टाइम 14 दिन" },
      { verb: "भेजें।", name: "हर लोकेशन में स्टॉक का संतुलन", desc: "सेफ़्टी स्टॉक को सही जगह रखें, आपके नेटवर्क के हर हिस्से में।", result: "360 यूनिट ट्रांसफ़र करें", detail: "केंद्रीय गोदाम → पश्चिम वितरण केंद्र" },
      { verb: "छूट दें।", name: "छूट का सही समय", desc: "माल के डेड स्टॉक बनने से पहले सही कीमत और सही समय पहचानें।", result: "W8 में 12% छूट", detail: "अनुमानित बिक्री 92% · मार्जिन सुरक्षित" },
      { verb: "बदलें।", name: "माँग के साथ बदलें", desc: "असली दुनिया की बदलती स्थितियों के साथ दोबारा ऑर्डर की नीतियों को लगातार ढालें।", result: "रीऑर्डर पॉइंट 820", detail: "PPO नीति · सिमुलेशन रिवॉर्ड +12.8%" },
    ],
    sandboxLabel: "सैंडबॉक्स निर्णय · उदाहरण",
    control: "आपकी मंज़ूरी के लिए तैयार। नियंत्रण आपके हाथ में; हिसाब SANKET करता है।",
    step: "निर्णय",
  },
  world: {
    plate: "आपकी दुनिया",
    private: "निजी वर्कस्पेस",
    telemetry: "सैंडबॉक्स वर्कस्पेस · उदाहरण टेलीमेट्री",
    example: "उदाहरण प्रोडक्ट",
    noMatch: "कोई मिलता-जुलता इंटीग्रेशन नहीं।",
    englishNote: "उद्योग का विवरण अंग्रेज़ी में है।",
    bridge: "XML / HTTP ब्रिज",
    api: "API / बैच इनजेशन",
    scoped: "टेनेंट-स्तर की सेटिंग · जोड़ने के लिए क्रेडेंशियल ज़रूरी",
    close: "बंद करें",
    all: "सभी",
  },
  proof: { plate: "प्रमाण", read: "कहानी और स्रोत पढ़ें", evidence: "सार्वजनिक उद्योग उदाहरण, SANKET ग्राहकों के परिणाम नहीं", year: "वर्ष", company: "कौन", what: "क्या हुआ" },
  contact: {
    plate: "बात करें",
    include: "आपके संदेश में वह भी होगा जो आपने यहाँ देखा:",
    remove: "हटाएँ",
    lead: "आपकी साइट पर मैंने यह देखा:",
    industry: name => `उद्योग: ${name}`,
    roi: (value, size) => `ROI अनुमान: ${value} प्रति वर्ष (${size} का उदाहरण)`,
    sandbox: (scenario, qty) => `पूर्वानुमान सैंडबॉक्स: ${scenario}, ${qty} यूनिट का दोबारा ऑर्डर`,
  },
  footer: { signature: "आगे क्या होने वाला है, उसका संकेत।" },
};

const te: Copy = {
  nav: { signal: "సంకేతం", forecast: "అంచనా", decide: "నిర్ణయం", world: "మీ ప్రపంచం", proof: "రుజువు", talk: "మాట్లాడండి", menu: "మెనూ తెరవండి", close: "మెనూ మూసివేయండి", index: "సూచిక", pause: "కదలిక ఆపండి", play: "కదలిక ప్రారంభించండి", jump: "ఇక్కడికి వెళ్లండి" },
  rail: ["అసమతుల్యం", "సంకేతం", "అంచనా", "నిర్ణయం", "స్టాక్‌లో"],
  hero: {
    pos: "నామవాచకం",
    gloss: "ఒక సంకేతం; రాబోయేదాని సూచన.",
    see: "నిర్ణయం చూడండి",
    talk: "తయారు చేసినవారితో మాట్లాడండి",
    scroll: "స్క్రోల్ చేయండి, స్టాక్ సమతుల్యం కావడం చూడండి",
    cursor: "సంకేతం పంపండి",
  },
  stage: {
    readout: "ఫీల్డ్ రీడౌట్",
    onHand: "చేతిలో",
    need: "అంచనా అవసరం",
    status: { short: "స్టాక్ అయిపోయే ప్రమాదం", over: "అవసరానికి మించి", ok: "సరిగ్గా ఉంది", new: "కొత్తది · చరిత్ర లేదు", sheet: "స్ప్రెడ్‌షీట్ ఊహ" },
    hint: "ఫీల్డ్‌పై కర్సర్ ఉంచండి · క్లిక్ చేసి సంకేతం పంపండి",
    hintTouch: "సంకేతం పంపడానికి ఫీల్డ్‌పై ట్యాప్ చేయండి",
    illustrative: "ఉదాహరణ ఫీల్డ్ · ప్రొడక్ట్ × లొకేషన్",
    surplus: "కేంద్ర గోదాము · అదనపు స్టాక్",
    shortage: "పశ్చిమ DC · స్టాక్ లేదు",
    signals: ["వాతావరణం", "సెర్చ్ ట్రెండ్‌లు", "పండుగ వారం"],
  },
  signal: {
    plate: "సంకేతం",
    a: "ప్రపంచం మారుతుంది.",
    b: "మీ స్టాక్ కూడా మారాలి.",
    body: "ట్రెండ్ మొదలవుతుంది. వాతావరణం మారుతుంది. స్ప్రెడ్‌షీట్ కంటే ముందే డిమాండ్ మారుతుంది. SANKET సంకేతాలను కలిపి తదుపరి నిర్ణయానికి సహాయపడుతుంది.",
    listLabel: "SANKET చదివే సంకేతాలు",
    signals: ["నిజమైన అమ్మకాలు", "వాతావరణం", "సెర్చ్ ట్రెండ్‌లు", "సోషల్ బజ్", "పండుగల క్యాలెండర్", "పోటీదారుల ధరలు", "రవాణా ఖర్చులు"],
    caption: "ప్రతి అల ఒక సంకేతం, అది ప్రభావితం చేసే స్టాక్‌కు చేరుతుంది.",
  },
  problems: {
    plate: "ఊహకు చెల్లించే మూల్యం",
    fieldLabel: "ఫీల్డ్‌లో చూడండి",
    captions: [
      "డిమాండ్ ఎక్కువగా ఉన్నచోటే ఖాళీ గుంతలు.",
      "డిమాండ్‌కు దూరంగా బరువైన గుట్టలు.",
      "ఒకే అంకె, మొత్తం భాగానికి కాపీ చేసినది.",
      "నేర్చుకోవడానికి ఏమీ లేని కొత్త వరుస.",
      "ఒక సంకేతం వస్తుంది. పాత ప్లాన్ దాన్ని చూడలేదు.",
      "ఖాళీ గుంత పక్కనే అదనపు స్టాక్ గుట్ట.",
    ],
  },
  forecast: {
    plate: "అంచనా",
    band: "లేత పట్టీ స్టాక్ ఉండాల్సిన చోటు. మధ్యలో ఉన్న ఖాళీయే నిర్ణయం.",
    scenarios: ["బేస్‌లైన్", "ధర తగ్గింపు", "వైరల్ ఉప్పెన"],
    horizon: n => `${n} వారాలు`,
    expected: "అంచనా డిమాండ్",
    perWeek: "యూనిట్లు / వారం",
    vsPrior: "గత కాలంతో పోలిస్తే",
    actual: "నిజమైన డిమాండ్",
    p50: "p50 అంచనా",
    range: "p10–p90 శ్రేణి",
    forecastMark: "అంచనా",
    adjust: "డిమాండ్ సర్దుబాటు",
    reset: "అంచనాను రీసెట్ చేయండి",
    drag: "డిమాండ్ మార్చడానికి చార్ట్‌ను లాగండి లేదా స్లైడర్ వాడండి",
    decision: "తదుపరి ఉత్తమ చర్య",
    reorder: "యూనిట్లు రీఆర్డర్ చేయండి",
    leadTime: "ఉదాహరణ · రెండు వారాల లీడ్ టైమ్",
    technical: "సాంకేతిక వివరాలు",
    techBody:
      "అంచనా శ్రేణి: p10–p90. మధ్య రేఖ మధ్యస్థం (p50). SLSQP క్వాంటైల్ స్టాకింగ్ / పిన్‌బాల్ లాస్ ఆర్కిటెక్చర్ భావనలు; ఈ శాండ్‌బాక్స్ సిమ్యులేటెడ్ డేటాను వాడుతుంది.",
    check: "అంచనా లోపం 18.42% · సీజనల్ బేస్‌లైన్ కంటే 38% మెరుగు · ఉదాహరణ",
    chartLabel: "సంభావ్య డిమాండ్ అంచనా",
  },
  film: {
    film: "తదుపరి ఆర్డర్‌ను అర్థం చేసుకోండి",
    title: "తదుపరి ఆర్డర్ ఎలా సిద్ధమవుతుందో చూడండి.",
    desc: "డిమాండ్ మార్పు నుంచి మీ నిర్ణయం వరకు. ప్రోడక్ట్ శాండ్‌బాక్స్‌లో 20 సెకన్ల ఉదాహరణ.",
    play: "20 సెకన్ల ప్రోడక్ట్ వీడియోను ప్లే చేయండి",
    example: "ఉదాహరణ వాక్‌త్రూ · ఇంగ్లీష్ · 20 సెకన్లు",
  },
  decide: {
    plate: "నిర్ణయం",
    verbs: [
      { verb: "ఆర్డర్.", name: "సరైన మొత్తంలో ఆర్డర్", desc: "నిల్వ ఖర్చు, కోల్పోయిన అమ్మకాల మధ్య సమతుల్యం, సరైన ఆర్డర్ పరిమాణంలో.", result: "1,240 యూనిట్లు ఆర్డర్ చేయండి", detail: "సర్వీస్ లక్ష్యం 95% · లీడ్ టైమ్ 14 రోజులు" },
      { verb: "తరలించండి.", name: "అన్ని లొకేషన్లలో స్టాక్ సమతుల్యం", desc: "మీ నెట్‌వర్క్‌లోని ప్రతి చోట సేఫ్టీ స్టాక్‌ను సరైన స్థానంలో ఉంచండి.", result: "360 యూనిట్లు బదిలీ చేయండి", detail: "కేంద్ర గోదాము → పశ్చిమ పంపిణీ కేంద్రం" },
      { verb: "తగ్గించండి.", name: "డిస్కౌంట్‌కు సరైన సమయం", desc: "సరుకు డెడ్ స్టాక్‌గా మారకముందే సరైన ధర, సరైన సమయం కనుగొనండి.", result: "W8లో 12% డిస్కౌంట్", detail: "అంచనా అమ్మకం 92% · మార్జిన్ సురక్షితం" },
      { verb: "మారండి.", name: "డిమాండ్‌తో పాటు మారండి", desc: "మారుతున్న వాస్తవ పరిస్థితులకు తగ్గట్టు రీప్లెనిష్‌మెంట్ విధానాలను నిరంతరం మార్చండి.", result: "రీఆర్డర్ పాయింట్ 820", detail: "PPO విధానం · సిమ్యులేషన్ రివార్డ్ +12.8%" },
    ],
    sandboxLabel: "శాండ్‌బాక్స్ నిర్ణయం · ఉదాహరణ",
    control: "మీ ఆమోదం కోసం సిద్ధంగా. నియంత్రణ మీదే; లెక్కలు SANKET చూసుకుంటుంది.",
    step: "నిర్ణయం",
  },
  world: {
    plate: "మీ ప్రపంచం",
    private: "ప్రైవేట్ వర్క్‌స్పేస్",
    telemetry: "శాండ్‌బాక్స్ వర్క్‌స్పేస్ · ఉదాహరణ టెలిమెట్రీ",
    example: "ఉదాహరణ ప్రొడక్ట్",
    noMatch: "సరిపోలే ఇంటిగ్రేషన్లు లేవు.",
    englishNote: "పరిశ్రమ వివరాలు ఇంగ్లీష్‌లో ఉన్నాయి.",
    bridge: "XML / HTTP బ్రిడ్జ్",
    api: "API / బ్యాచ్ ఇంజెషన్",
    scoped: "టెనెంట్ స్థాయి సెట్టింగ్ · కనెక్ట్ చేయడానికి క్రెడెన్షియల్స్ అవసరం",
    close: "మూసివేయండి",
    all: "అన్నీ",
  },
  proof: { plate: "రుజువు", read: "కథ మరియు మూలాలను చదవండి", evidence: "బహిరంగ పరిశ్రమ ఉదాహరణలు; SANKET కస్టమర్ ఫలితాలు కావు", year: "సంవత్సరం", company: "ఎవరు", what: "ఏం జరిగింది" },
  contact: {
    plate: "మాట్లాడండి",
    include: "మీరు ఇక్కడ చూసినవి మీ సందేశంలో ఉంటాయి:",
    remove: "తీసివేయండి",
    lead: "మీ సైట్‌లో నేను చూసినవి:",
    industry: name => `పరిశ్రమ: ${name}`,
    roi: (value, size) => `ROI అంచనా: సంవత్సరానికి ${value} (${size} ఉదాహరణ)`,
    sandbox: (scenario, qty) => `అంచనా శాండ్‌బాక్స్: ${scenario}, ${qty} యూనిట్ల రీఆర్డర్`,
  },
  footer: { signature: "రాబోయేదాని సంకేతం." },
};

export const copy: Record<Lang, Copy> = { en, hi, te };
export const useCopy = () => copy[useContext(LangContext)];
