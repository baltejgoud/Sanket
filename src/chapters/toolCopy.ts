import { useContext } from "react";
import { LangContext, type Lang } from "../i18n";

/** Strings for the tool dialogs (forecast, connections, business case); they load with those chunks. */
export interface ToolCopy {
  /** "Send me this scenario" in the forecast and business-case tools. */
  share: { title: string; email: string; whatsapp: string; ask: string; illustrative: string };
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
}

const en: ToolCopy = {
  share: { title: "Send me this scenario", email: "By email", whatsapp: "On WhatsApp", ask: "Please send me this scenario and what it would look like with our data:", illustrative: "Illustrative data" },
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
};

const hi: ToolCopy = {
  share: { title: "यह परिदृश्य मुझे भेजें", email: "ईमेल से", whatsapp: "WhatsApp पर", ask: "कृपया यह परिदृश्य भेजें, और बताएँ कि हमारे डेटा के साथ यह कैसा दिखेगा:", illustrative: "उदाहरण के आँकड़े" },
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
};

const te: ToolCopy = {
  share: { title: "ఈ దృశ్యాన్ని నాకు పంపండి", email: "ఈమెయిల్ ద్వారా", whatsapp: "WhatsAppలో", ask: "దయచేసి ఈ దృశ్యాన్ని పంపండి, మా డేటాతో ఇది ఎలా ఉంటుందో చెప్పండి:", illustrative: "ఉదాహరణ డేటా" },
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
};

const toolCopy: Record<Lang, ToolCopy> = { en, hi, te };
export const useToolCopy = () => toolCopy[useContext(LangContext)];

type Story = {
  company: string;
  stat: string;
  statLabel: string;
  title: string;
  story: string;
  lesson: string;
};
type Heading = { eyebrow: string; title: string; desc: string };

/** The tools' longer copy: section headings, public stories and security notes. */
export type ToolDict = {
  stories: Heading & {
    lesson: string;
    source: string;
    all: string;
    india: string;
    global: string;
    footnote: string;
    items: Story[];
  };
  industries: Heading;
  platform: Heading & { connectEyebrow: string; connectTitle: string; search: string };
  roi: Heading;
  security: Heading & { items: { title: string; desc: string }[] };
};

const enDict: ToolDict = {
  stories: {
    eyebrow: "IT HAPPENS TO THE BIGGEST NAMES",
    title: "When the forecast is wrong, everyone notices.",
    desc: "Big planning teams and serious budgets didn't save them. Here's what happened in India and abroad, and what SANKET is built to catch.",
    lesson: "THE LESSON",
    source: "Source",
    all: "All",
    india: "India",
    global: "Global",
    footnote:
      "Summarised from public reporting. SANKET was not involved in these events; the lessons describe the problems it is designed to address.",
    items: [
      {
        company: "Indian car dealers",
        stat: "₹77,800 cr",
        statLabel: "of unsold cars",
        title: "The factories kept shipping. Buyers held back.",
        story: "Car sales fell in August 2024, yet manufacturers kept sending more vehicles to dealers. Dealers ended up holding about 7.8 lakh unsold cars worth ₹77,800 crore: 70–75 days of stock.",
        lesson: "Push-based planning ignores what buyers are actually doing. SANKET forecasts from real sell-through, festivals and live signals, so orders follow demand.",
      },
      {
        company: "Remdesivir makers",
        stat: "3×",
        statLabel: "capacity in two months",
        title: "From panic shortage to surplus, in weeks.",
        story: "In April 2021, families queued for Remdesivir. India scaled production capacity from 38.8 lakh to 1.22 crore vials a month by June, and the industry was soon expecting a surplus.",
        lesson: "A spike isn't the new normal. SANKET separates a temporary surge from lasting demand, so you scale up without getting stuck with the excess.",
      },
      {
        company: "Vehicle dealers (BS-IV)",
        stat: "₹6,350 cr",
        statLabel: "of stock stranded",
        title: "The deadline was known. The stock still piled up.",
        story: "BS-IV vehicles could not be sold after 31 March 2020, yet days before the deadline dealers still held an estimated ₹6,350 crore of them. The Supreme Court allowed only 10% to be sold after the lockdown.",
        lesson: "When a cut-off date is coming, every order should wind down toward it. SANKET plans stock against end-of-life dates, so nothing gets left behind.",
      },
      {
        company: "Nike",
        stat: "$100M+",
        statLabel: "in lost sales",
        title: "The software ordered the wrong shoes.",
        story: "A new demand-planning system over-ordered slow-selling models and under-ordered the ones customers wanted. Nike reported more than $100 million in lost sales, and its share price fell about 20%.",
        lesson: "A forecast you can't question is a forecast you can't trust. SANKET shows a range, not a single number, and a model only goes live after it beats a simple baseline.",
      },
      {
        company: "H&M",
        stat: "$4.3B",
        statLabel: "of unsold clothes",
        title: "The racks filled up as shoppers moved on.",
        story: "As shoppers shifted online and to cheaper rivals, H&M reported about $4.3 billion of unsold inventory and planned price cuts to clear it.",
        lesson: "Demand shifts show up in search trends and social buzz weeks before they show up in sales. SANKET reads those signals and adjusts the buy.",
      },
      {
        company: "Target Canada",
        stat: "133",
        statLabel: "stores closed",
        title: "The stores opened. The shelves stayed empty.",
        story: "Target opened 133 Canadian stores before its distribution centres were ready. Shoppers found empty shelves, and within two years Target left Canada, affecting about 17,600 jobs.",
        lesson: "Stock in the wrong place costs as much as no stock at all. SANKET plans inventory across every warehouse and store, and flags gaps before customers see them.",
      },
    ],
  },
  industries: {
    eyebrow: "ONE PLATFORM. YOUR WORLD.",
    title: "Built for your industry's reality.",
    desc: "One isolated workspace. The exact models, signals and rules your business needs.",
  },
  platform: {
    eyebrow: "FROM INSIGHT TO ACTION",
    title: "Don't just predict. Decide.",
    desc: "Four optimization engines turn forecasts into your next best move.",
    connectEyebrow: "MEETS YOU WHERE YOU WORK",
    connectTitle: "Fits the tools you already use.",
    search: "Find your integration",
  },
  roi: {
    eyebrow: "THE BUSINESS CASE, MADE PERSONAL",
    title: "A clearer forecast. A stronger bottom line.",
    desc: "Model the potential impact on your business. Move the inputs. See the difference.",
  },
  security: {
    eyebrow: "YOUR DATA STAYS YOURS",
    title: "Enterprise security, built in.",
    desc: "Your sales data is your competitive edge. It stays private, separated and auditable.",
    items: [
      { title: "Your own private workspace", desc: "Each business's data is kept separate at the database level." },
      { title: "Controlled access", desc: "Role-based permissions and short-lived sign-in sessions." },
      {
        title: "Audit trail for regulated teams",
        desc: "Append-only records and dual sign-off, designed for pharma (GxP / 21 CFR Part 11).",
      },
      { title: "Protected integrations", desc: "Signed webhooks and replay protection on every connection." },
    ],
  },
};

const hiDict: ToolDict = {
  stories: {
    eyebrow: "बड़े-बड़े नामों के साथ भी होता है",
    title: "जब पूर्वानुमान ग़लत होता है, तो सबको पता चलता है।",
    desc: "बड़ी प्लानिंग टीमें और भारी बजट भी इन्हें नहीं बचा पाए। देखिए भारत और दुनिया में क्या हुआ, और SANKET किन बातों को पकड़ने के लिए बना है।",
    lesson: "सबक",
    source: "स्रोत",
    all: "सभी",
    india: "भारत",
    global: "दुनिया",
    footnote:
      "सार्वजनिक रिपोर्टों पर आधारित सारांश। इन घटनाओं में SANKET शामिल नहीं था; सबक उन समस्याओं के बारे में हैं जिन्हें हल करने के लिए SANKET बना है।",
    items: [
      {
        company: "भारत के कार डीलर",
        stat: "₹77,800 करोड़",
        statLabel: "की बिना बिकी कारें",
        title: "फ़ैक्ट्रियाँ भेजती रहीं, ख़रीदार रुके रहे।",
        story: "अगस्त 2024 में कारों की बिक्री गिरी, फिर भी कंपनियाँ डीलरों को और गाड़ियाँ भेजती रहीं। डीलरों के पास लगभग 7.8 लाख बिना बिकी कारें जमा हो गईं — ₹77,800 करोड़ की, यानी 70–75 दिनों का स्टॉक।",
        lesson: "सिर्फ़ माल आगे धकेलने वाली प्लानिंग यह नहीं देखती कि ख़रीदार असल में क्या कर रहे हैं। SANKET असली बिक्री, त्योहारों और लाइव संकेतों से पूर्वानुमान लगाता है, ताकि ऑर्डर माँग के हिसाब से हों।",
      },
      {
        company: "रेमडेसिविर निर्माता",
        stat: "3×",
        statLabel: "क्षमता, सिर्फ़ दो महीनों में",
        title: "भारी कमी से सरप्लस तक, कुछ ही हफ़्तों में।",
        story: "अप्रैल 2021 में परिवार रेमडेसिविर के लिए कतारों में खड़े थे। जून तक भारत ने उत्पादन क्षमता 38.8 लाख से बढ़ाकर 1.22 करोड़ शीशियाँ प्रति माह कर दी, और जल्द ही उद्योग को सरप्लस की आशंका होने लगी।",
        lesson: "अचानक आई तेज़ी हमेशा के लिए नहीं होती। SANKET अस्थायी उछाल और स्थायी माँग में फ़र्क करता है, ताकि आप उत्पादन बढ़ाएँ पर अतिरिक्त माल में न फँसें।",
      },
      {
        company: "वाहन डीलर (BS-IV)",
        stat: "₹6,350 करोड़",
        statLabel: "का स्टॉक अटका",
        title: "समय-सीमा पहले से पता थी, फिर भी स्टॉक जमा हो गया।",
        story: "31 मार्च 2020 के बाद BS-IV वाहन बेचे नहीं जा सकते थे, फिर भी समय-सीमा से कुछ दिन पहले तक डीलरों के पास अनुमानित ₹6,350 करोड़ के ऐसे वाहन बचे थे। सुप्रीम कोर्ट ने लॉकडाउन के बाद इनमें से सिर्फ़ 10% बेचने की अनुमति दी।",
        lesson: "जब कोई आख़िरी तारीख़ आने वाली हो, तो हर ऑर्डर उसी के हिसाब से घटना चाहिए। SANKET एंड-ऑफ़-लाइफ़ तारीख़ों को ध्यान में रखकर स्टॉक की योजना बनाता है, ताकि कुछ भी पीछे न छूटे।",
      },
      {
        company: "Nike",
        stat: "$100M+",
        statLabel: "की खोई बिक्री",
        title: "सॉफ़्टवेयर ने ग़लत जूते ऑर्डर कर दिए।",
        story: "एक नए डिमांड-प्लानिंग सिस्टम ने धीमे बिकने वाले मॉडल ज़्यादा और ग्राहकों के पसंदीदा मॉडल कम ऑर्डर किए। Nike ने $100 मिलियन से ज़्यादा की खोई बिक्री बताई, और उसका शेयर लगभग 20% गिरा।",
        lesson: "जिस पूर्वानुमान पर सवाल न उठाया जा सके, उस पर भरोसा भी नहीं किया जा सकता। SANKET एक संख्या नहीं, पूरी रेंज दिखाता है, और कोई मॉडल तभी लागू होता है जब वह एक सरल बेसलाइन से बेहतर साबित हो।",
      },
      {
        company: "H&M",
        stat: "$4.3B",
        statLabel: "के बिना बिके कपड़े",
        title: "ग्राहक आगे बढ़ गए, रैक भरे रह गए।",
        story: "जब ग्राहक ऑनलाइन और सस्ते विकल्पों की ओर चले गए, H&M ने लगभग $4.3 बिलियन का बिना बिका माल बताया और उसे निकालने के लिए दाम घटाने की योजना बनाई।",
        lesson: "माँग में बदलाव बिक्री में दिखने से हफ़्तों पहले सर्च ट्रेंड और सोशल बज़ में दिखता है। SANKET इन संकेतों को पढ़कर ख़रीद को समय रहते बदलता है।",
      },
      {
        company: "Target कनाडा",
        stat: "133",
        statLabel: "स्टोर बंद",
        title: "स्टोर खुले, पर शेल्फ़ खाली रहे।",
        story: "Target ने अपने वितरण केंद्र तैयार होने से पहले ही कनाडा में 133 स्टोर खोल दिए। ग्राहकों को खाली शेल्फ़ मिले, और दो साल के भीतर Target कनाडा से निकल गया, जिससे लगभग 17,600 नौकरियाँ प्रभावित हुईं।",
        lesson: "ग़लत जगह रखा स्टॉक उतना ही महँगा है जितना स्टॉक का न होना। SANKET हर गोदाम और स्टोर के लिए इन्वेंटरी की योजना बनाता है और ग्राहकों के देखने से पहले कमी पकड़ लेता है।",
      },
    ],
  },
  industries: {
    eyebrow: "एक प्लेटफ़ॉर्म, आपकी दुनिया",
    title: "आपके उद्योग की असलियत के लिए बना।",
    desc: "एक अलग, सुरक्षित वर्कस्पेस — वही मॉडल, संकेत और नियम जिनकी आपके कारोबार को ज़रूरत है।",
  },
  platform: {
    eyebrow: "जानकारी से कार्रवाई तक",
    title: "सिर्फ़ अनुमान नहीं, फ़ैसला।",
    desc: "चार ऑप्टिमाइज़ेशन इंजन पूर्वानुमान को आपके अगले सबसे अच्छे क़दम में बदलते हैं।",
    connectEyebrow: "जहाँ आप काम करते हैं, वहीं",
    connectTitle: "आपके मौजूदा सिस्टम के साथ।",
    search: "अपना इंटीग्रेशन खोजें",
  },
  roi: {
    eyebrow: "आपके कारोबार का हिसाब",
    title: "बेहतर पूर्वानुमान, बेहतर मुनाफ़ा।",
    desc: "अपने कारोबार पर संभावित असर का अनुमान लगाएँ। आँकड़े बदलें, फ़र्क देखें।",
  },
  security: {
    eyebrow: "आपका डेटा, सिर्फ़ आपका",
    title: "एंटरप्राइज़-स्तर की सुरक्षा, शुरू से।",
    desc: "आपका सेल्स डेटा आपकी ताक़त है। यह निजी, अलग और ऑडिट-योग्य रहता है।",
    items: [
      { title: "आपका निजी वर्कस्पेस", desc: "हर कारोबार का डेटा डेटाबेस स्तर पर अलग रखा जाता है।" },
      { title: "नियंत्रित एक्सेस", desc: "रोल के आधार पर अनुमतियाँ और कम समय के लिए मान्य साइन-इन सेशन।" },
      {
        title: "नियमित उद्योगों के लिए ऑडिट ट्रेल",
        desc: "सिर्फ़ जोड़े जा सकने वाले रिकॉर्ड और दोहरी मंज़ूरी, फ़ार्मा के लिए (GxP / 21 CFR Part 11) डिज़ाइन किया गया।",
      },
      { title: "सुरक्षित इंटीग्रेशन", desc: "हर कनेक्शन पर साइन किए गए वेबहुक और रीप्ले से सुरक्षा।" },
    ],
  },
};

const teDict: ToolDict = {
  stories: {
    eyebrow: "పెద్ద పెద్ద కంపెనీలకూ ఇది జరుగుతుంది",
    title: "అంచనా తప్పినప్పుడు, అందరికీ తెలిసిపోతుంది.",
    desc: "పెద్ద ప్లానింగ్ టీమ్‌లు, భారీ బడ్జెట్‌లు కూడా వీరిని కాపాడలేకపోయాయి. భారత్‌లో, విదేశాల్లో ఏమి జరిగిందో, SANKET దేన్ని పట్టుకోవడానికి తయారైందో చూడండి.",
    lesson: "పాఠం",
    source: "మూలం",
    all: "అన్నీ",
    india: "భారత్",
    global: "ప్రపంచం",
    footnote:
      "బహిరంగ నివేదికల ఆధారంగా సారాంశం. ఈ ఘటనల్లో SANKET పాలుపంచుకోలేదు; పాఠాలు SANKET పరిష్కరించడానికి రూపొందిన సమస్యలను వివరిస్తాయి.",
    items: [
      {
        company: "భారత కార్ డీలర్లు",
        stat: "₹77,800 కోట్లు",
        statLabel: "విలువైన అమ్ముడుపోని కార్లు",
        title: "ఫ్యాక్టరీలు పంపుతూనే ఉన్నాయి. కొనుగోలుదారులు ఆగిపోయారు.",
        story: "ఆగస్టు 2024లో కార్ల అమ్మకాలు తగ్గాయి, అయినా తయారీదారులు డీలర్లకు మరిన్ని వాహనాలు పంపుతూనే ఉన్నారు. డీలర్ల దగ్గర సుమారు 7.8 లక్షల అమ్ముడుపోని కార్లు పేరుకుపోయాయి — ₹77,800 కోట్ల విలువ, అంటే 70–75 రోజుల స్టాక్.",
        lesson: "సరుకును ముందుకు నెట్టే ప్లానింగ్ కొనుగోలుదారులు నిజంగా ఏం చేస్తున్నారో పట్టించుకోదు. SANKET నిజమైన అమ్మకాలు, పండుగలు, లైవ్ సంకేతాల ఆధారంగా అంచనా వేస్తుంది, కాబట్టి ఆర్డర్లు డిమాండ్‌ను అనుసరిస్తాయి.",
      },
      {
        company: "రెమ్‌డెసివిర్ తయారీదారులు",
        stat: "3×",
        statLabel: "సామర్థ్యం, రెండు నెలల్లోనే",
        title: "తీవ్ర కొరత నుంచి మిగులు వరకు, కొన్ని వారాల్లోనే.",
        story: "ఏప్రిల్ 2021లో కుటుంబాలు రెమ్‌డెసివిర్ కోసం క్యూల్లో నిలబడ్డాయి. జూన్ నాటికి భారత్ ఉత్పత్తి సామర్థ్యాన్ని నెలకు 38.8 లక్షల నుంచి 1.22 కోట్ల వయల్స్‌కు పెంచింది, త్వరలోనే పరిశ్రమ మిగులును అంచనా వేయడం మొదలుపెట్టింది.",
        lesson: "ఒక్కసారి వచ్చిన పెరుగుదల శాశ్వతం కాదు. SANKET తాత్కాలిక ఉప్పెనను, నిలకడైన డిమాండ్‌ను వేరు చేస్తుంది, కాబట్టి మీరు ఉత్పత్తి పెంచినా మిగులు సరుకులో చిక్కుకోరు.",
      },
      {
        company: "వాహన డీలర్లు (BS-IV)",
        stat: "₹6,350 కోట్లు",
        statLabel: "స్టాక్ చిక్కుకుపోయింది",
        title: "గడువు ముందే తెలుసు. అయినా స్టాక్ పేరుకుపోయింది.",
        story: "31 మార్చి 2020 తర్వాత BS-IV వాహనాలు అమ్మడానికి వీల్లేదు, అయినా గడువుకు కొన్ని రోజుల ముందు కూడా డీలర్ల దగ్గర సుమారు ₹6,350 కోట్ల విలువైన అలాంటి వాహనాలు ఉన్నాయి. లాక్‌డౌన్ తర్వాత వాటిలో కేవలం 10% మాత్రమే అమ్మడానికి సుప్రీంకోర్టు అనుమతించింది.",
        lesson: "ఒక గడువు తేదీ రాబోతున్నప్పుడు, ప్రతి ఆర్డర్ దాని దిశగా తగ్గుతూ రావాలి. SANKET ఎండ్-ఆఫ్-లైఫ్ తేదీలను దృష్టిలో పెట్టుకుని స్టాక్‌ను ప్లాన్ చేస్తుంది, కాబట్టి ఏదీ మిగిలిపోదు.",
      },
      {
        company: "Nike",
        stat: "$100M+",
        statLabel: "అమ్మకాలు కోల్పోయింది",
        title: "సాఫ్ట్‌వేర్ తప్పు షూస్ ఆర్డర్ చేసింది.",
        story: "కొత్త డిమాండ్-ప్లానింగ్ సిస్టమ్ నెమ్మదిగా అమ్ముడయ్యే మోడళ్లను ఎక్కువగా, కస్టమర్లు కోరుకున్నవాటిని తక్కువగా ఆర్డర్ చేసింది. Nike $100 మిలియన్లకు పైగా అమ్మకాలు కోల్పోయినట్లు తెలిపింది, దాని షేర్ ధర సుమారు 20% పడిపోయింది.",
        lesson: "ప్రశ్నించలేని అంచనాను నమ్మలేం. SANKET ఒక్క అంకె కాకుండా పూర్తి శ్రేణిని చూపిస్తుంది, ఒక మోడల్ సాధారణ బేస్‌లైన్‌ను మించితేనే అమల్లోకి వస్తుంది.",
      },
      {
        company: "H&M",
        stat: "$4.3B",
        statLabel: "విలువైన అమ్ముడుపోని దుస్తులు",
        title: "కస్టమర్లు ముందుకు వెళ్లిపోయారు, ర్యాక్‌లు నిండిపోయాయి.",
        story: "కస్టమర్లు ఆన్‌లైన్‌కు, చౌకైన ప్రత్యామ్నాయాలకు మారడంతో, H&M సుమారు $4.3 బిలియన్ల అమ్ముడుపోని సరుకు ఉన్నట్లు తెలిపింది, దాన్ని వదిలించుకోవడానికి ధరలు తగ్గించాలని ప్లాన్ చేసింది.",
        lesson: "డిమాండ్‌లో మార్పు అమ్మకాల్లో కనిపించడానికి వారాల ముందే సెర్చ్ ట్రెండ్‌లు, సోషల్ బజ్‌లో కనిపిస్తుంది. SANKET ఆ సంకేతాలను చదివి కొనుగోళ్లను సమయానికి మారుస్తుంది.",
      },
      {
        company: "Target కెనడా",
        stat: "133",
        statLabel: "స్టోర్లు మూతపడ్డాయి",
        title: "స్టోర్లు తెరుచుకున్నాయి. షెల్ఫ్‌లు ఖాళీగానే ఉన్నాయి.",
        story: "తన పంపిణీ కేంద్రాలు సిద్ధం కాకముందే Target కెనడాలో 133 స్టోర్లు తెరిచింది. కస్టమర్లకు ఖాళీ షెల్ఫ్‌లు కనిపించాయి, రెండేళ్లలోనే Target కెనడా నుంచి వైదొలిగింది, సుమారు 17,600 ఉద్యోగాలపై ప్రభావం పడింది.",
        lesson: "తప్పు చోట ఉన్న స్టాక్ అసలు స్టాక్ లేనంత నష్టమే. SANKET ప్రతి గోడౌన్, స్టోర్‌కు ఇన్వెంటరీని ప్లాన్ చేస్తుంది, కస్టమర్లు చూసేలోపే లోటును గుర్తిస్తుంది.",
      },
    ],
  },
  industries: {
    eyebrow: "ఒకే ప్లాట్‌ఫామ్, మీ ప్రపంచం",
    title: "మీ పరిశ్రమ వాస్తవాలకు తగ్గట్టుగా రూపొందింది.",
    desc: "ఒక ప్రత్యేక, సురక్షిత వర్క్‌స్పేస్ — మీ వ్యాపారానికి కావాల్సిన మోడళ్లు, సంకేతాలు, నియమాలు.",
  },
  platform: {
    eyebrow: "అవగాహన నుంచి చర్య వరకు",
    title: "కేవలం అంచనా కాదు. నిర్ణయం.",
    desc: "నాలుగు ఆప్టిమైజేషన్ ఇంజిన్‌లు అంచనాలను మీ తదుపరి ఉత్తమ అడుగుగా మారుస్తాయి.",
    connectEyebrow: "మీరు పనిచేసే చోటే",
    connectTitle: "మీరు వాడే టూల్స్‌తో కలిసి.",
    search: "మీ ఇంటిగ్రేషన్‌ను వెతకండి",
  },
  roi: {
    eyebrow: "మీ వ్యాపారానికి లెక్క",
    title: "స్పష్టమైన అంచనా. బలమైన లాభం.",
    desc: "మీ వ్యాపారంపై సంభావ్య ప్రభావాన్ని అంచనా వేయండి. అంకెలు మార్చండి, తేడా చూడండి.",
  },
  security: {
    eyebrow: "మీ డేటా మీదే",
    title: "ఎంటర్‌ప్రైజ్ స్థాయి భద్రత, మొదటి నుంచే.",
    desc: "మీ సేల్స్ డేటా మీ పోటీ బలం. అది ప్రైవేట్‌గా, వేరుగా, ఆడిట్ చేయదగినదిగా ఉంటుంది.",
    items: [
      { title: "మీ సొంత ప్రైవేట్ వర్క్‌స్పేస్", desc: "ప్రతి వ్యాపారం డేటా డేటాబేస్ స్థాయిలోనే వేరుగా ఉంచబడుతుంది." },
      { title: "నియంత్రిత యాక్సెస్", desc: "పాత్రల ఆధారిత అనుమతులు, తక్కువ కాలం చెల్లే సైన్-ఇన్ సెషన్‌లు." },
      {
        title: "నియంత్రిత పరిశ్రమలకు ఆడిట్ ట్రైల్",
        desc: "మార్చలేని రికార్డులు, ద్వంద్వ ఆమోదం — ఫార్మా కోసం (GxP / 21 CFR Part 11) రూపొందించబడింది.",
      },
      { title: "సురక్షిత ఇంటిగ్రేషన్లు", desc: "ప్రతి కనెక్షన్‌పై సంతకం చేసిన వెబ్‌హుక్‌లు, రీప్లే రక్షణ." },
    ],
  },
};

const toolDict: Record<Lang, ToolDict> = { en: enDict, hi: hiDict, te: teDict };
export const useToolT = () => toolDict[useContext(LangContext)];
