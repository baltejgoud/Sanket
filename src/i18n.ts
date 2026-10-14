import { createContext, useContext } from "react";

export type Lang = "en" | "hi" | "te";

export const languages: { code: Lang; label: string; name: string }[] = [
  { code: "en", label: "EN", name: "English" },
  { code: "hi", label: "हिं", name: "हिन्दी" },
  { code: "te", label: "తె", name: "తెలుగు" },
];

type Problem = {
  short: string;
  title: string;
  feel: string;
  cost: string;
  fix: string;
  value: string;
  label: string;
};
type Story = {
  company: string;
  stat: string;
  statLabel: string;
  title: string;
  story: string;
  lesson: string;
};
type Heading = { eyebrow: string; title: string; desc: string };

export type Dict = {
  langLabel: string;
  skip: string;
  nav: { problems: string; stories: string; how: string; industries: string; roi: string };
  cta: { whatsapp: string; whatsappShort: string; email: string; floating: string; waMessage: string };
  hero: {
    pill: string;
    h1a: string;
    h1b: string;
    leadPre: string;
    leadStrong: string;
    leadPost: string;
    desc: string;
    proof: string;
    source: string;
    videoLabel: string;
  };
  problems: Heading & { withSanket: string; footnote: string; items: Problem[] };
  stories: Heading & {
    lesson: string;
    source: string;
    all: string;
    india: string;
    global: string;
    footnote: string;
    items: Story[];
  };
  how: Heading & {
    steps: { title: string; desc: string; chips: string[] }[];
    benefits: { title: string; desc: string }[];
  };
  command: Heading & { sandbox: string };
  industries: Heading;
  platform: Heading & { connectEyebrow: string; connectTitle: string; search: string };
  roi: Heading;
  security: Heading & { items: { title: string; desc: string }[] };
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
  nav: {
    problems: "Why SANKET",
    stories: "Real stories",
    how: "How it works",
    industries: "Industries",
    roi: "ROI",
  },
  cta: {
    whatsapp: "Chat on WhatsApp",
    whatsappShort: "WhatsApp us",
    email: "Email us",
    floating: "Chat with us",
    waMessage: "Hi, I'd like to see how SANKET could work for our business.",
  },
  hero: {
    pill: "FOR RETAILERS, BRANDS & DISTRIBUTORS",
    h1a: "Stock what sells.",
    h1b: "Skip what doesn't.",
    leadPre: "Retailers lose ",
    leadStrong: "$1.77 trillion a year",
    leadPost: " to empty shelves and unsold stock.",
    desc: "SANKET predicts what your customers will buy next, product by product and week by week, then tells you exactly what to order, move or mark down.",
    proof: "Works with Tally, SAP, Shopify & Excel",
    source: "Loss figure: IHL Group, 2025",
    videoLabel:
      "Animation: outside signals flow into SANKET, which draws a demand forecast, recommends reordering 1,240 units and cuts stockouts.",
  },
  problems: {
    eyebrow: "SOUND FAMILIAR?",
    title: "Every week, inventory decisions quietly cost you money.",
    desc: "Pick the problem that keeps you up at night. See what it costs, and what changes with SANKET.",
    withSanket: "WITH SANKET",
    footnote:
      "Market figures: IHL Group inventory distortion research, 2025. Outcome ranges are illustrative planning targets, not guarantees.",
    items: [
      {
        short: "Best-sellers sell out",
        title: "Your best-seller sold out. Again.",
        feel: "Customers walk to a competitor. Worse, your sales data now says demand was low, so next time you order even less.",
        cost: "Out-of-stocks cost retailers about $1.2 trillion a year worldwide.",
        fix: "SANKET rebuilds the demand you missed while you were out of stock, warns you before the next stockout, and gives you the exact quantity to reorder.",
        value: "Up to 40%",
        label: "fewer stockouts",
      },
      {
        short: "Warehouse full of slow stock",
        title: "The warehouse is full of what nobody wants.",
        feel: "Cash is locked in cartons. The season ends, and the only way out is a deep discount that eats your margin.",
        cost: "Overstock costs retailers about $572 billion a year worldwide.",
        fix: "Every order is sized from a forecast range, not a single guess. Slow movers are flagged weeks early, along with the best moment to mark them down.",
        value: "10–25%",
        label: "less inventory to carry",
      },
      {
        short: "Forecast lives in a spreadsheet",
        title: "The forecast lives in one person's spreadsheet.",
        feel: "It takes days to update, breaks when someone edits a formula, and when that person is on leave, planning stops.",
        cost: "Decisions get made late, on old numbers, by gut feel.",
        fix: "One shared forecast for every product, refreshed automatically, with the reasoning shown so anyone on the team can trust it and act on it.",
        value: "Every SKU",
        label: "forecast automatically, every week",
      },
      {
        short: "New launch, no history",
        title: "New product. Zero sales history.",
        feel: "You're asked how many to buy for a launch, and the honest answer is a guess.",
        cost: "Buy too many and it's dead stock. Too few and the launch sells out on day three.",
        fix: "Foundation models forecast new items from day one by learning from similar products. No sales history required.",
        value: "Day 1",
        label: "forecasts for new launches",
      },
      {
        short: "The world changes overnight",
        title: "A heatwave, a viral post, a price war, and the plan breaks.",
        feel: "Your plan was built on last year. Your customers didn't get the memo.",
        cost: "By the time the change shows up in sales, it's too late to reorder.",
        fix: "Twelve live signals, including weather, search trends, social buzz, competitor prices and freight costs, feed the forecast as they change.",
        value: "12",
        label: "live outside signals",
      },
      {
        short: "Right stock, wrong place",
        title: "Right stock. Wrong city.",
        feel: "One warehouse has sold out while another is sitting on the same item.",
        cost: "You pay for rush freight and still lose the sale.",
        fix: "SANKET plans stock across every warehouse and store, and tells you what to transfer before it becomes urgent.",
        value: "1 view",
        label: "of stock across every location",
      },
    ],
  },
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
  how: {
    eyebrow: "HOW IT WORKS",
    title: "From your data to your next order, in three steps.",
    desc: "No data science team needed. If you can read a sales report, you can use SANKET.",
    steps: [
      {
        title: "Connect what you already use",
        desc: "Tally, Zoho, SAP, Shopify, Amazon, POS systems or plain Excel. No rip-and-replace, and no new system for your team to learn.",
        chips: ["Tally", "Shopify", "SAP", "Excel"],
      },
      {
        title: "See what's coming",
        desc: "A forecast for every product, every week, with a best case, a worst case and the most likely case, updated as the world changes.",
        chips: ["Every SKU", "Every week", "With a range"],
      },
      {
        title: "Know exactly what to do",
        desc: "Order quantities, stock transfers and markdown timing, ready for your approval. You stay in control; SANKET does the maths.",
        chips: ["Reorder", "Transfer", "Mark down"],
      },
    ],
    benefits: [
      { title: "Fewer empty shelves", desc: "Catch stockouts before your customers do." },
      { title: "Less cash in the warehouse", desc: "Buy closer to real demand and free up working capital." },
      { title: "Hours back every week", desc: "Stop rebuilding spreadsheets. Start reviewing decisions." },
      { title: "Decisions you can explain", desc: "Every number shows its range and its reasons." },
    ],
  },
  command: {
    eyebrow: "TRY IT YOURSELF",
    title: "This is what your Monday morning looks like.",
    desc: "Switch scenarios, drag the forecast, change the horizon. Every number comes with a range and a recommended action.",
    sandbox: "INTERACTIVE SANDBOX",
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
    connectTitle: "Your stack. Already connected.",
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
  nav: {
    problems: "SANKET क्यों",
    stories: "असली कहानियाँ",
    how: "कैसे काम करता है",
    industries: "उद्योग",
    roi: "ROI",
  },
  cta: {
    whatsapp: "WhatsApp पर बात करें",
    whatsappShort: "WhatsApp करें",
    email: "ईमेल करें",
    floating: "हमसे बात करें",
    waMessage: "नमस्ते, मैं जानना चाहता/चाहती हूँ कि SANKET हमारे कारोबार के लिए कैसे काम कर सकता है।",
  },
  hero: {
    pill: "रिटेलर्स, ब्रांड्स और डिस्ट्रीब्यूटर्स के लिए",
    h1a: "जो बिकता है, वही रखें।",
    h1b: "जो नहीं बिकता, उसे छोड़ें।",
    leadPre: "खाली शेल्फ़ और न बिके माल की वजह से रिटेलर्स हर साल ",
    leadStrong: "$1.77 ट्रिलियन",
    leadPost: " गँवाते हैं।",
    desc: "SANKET बताता है कि आपके ग्राहक आगे क्या ख़रीदेंगे — हर प्रोडक्ट, हर हफ़्ते — और फिर ठीक-ठीक बताता है कि क्या ऑर्डर करें, कहाँ भेजें और किस पर छूट दें।",
    proof: "Tally, SAP, Shopify और Excel के साथ काम करता है",
    source: "नुकसान का आँकड़ा: IHL Group, 2025",
    videoLabel:
      "एनिमेशन: बाहरी संकेत SANKET तक पहुँचते हैं, जो माँग का पूर्वानुमान बनाता है, 1,240 यूनिट दोबारा ऑर्डर करने की सलाह देता है और स्टॉक-आउट घटाता है।",
  },
  problems: {
    eyebrow: "क्या यह जाना-पहचाना लगता है?",
    title: "हर हफ़्ते, स्टॉक के फ़ैसले चुपचाप आपका पैसा खा रहे हैं।",
    desc: "वह समस्या चुनें जो आपको सबसे ज़्यादा परेशान करती है। देखें इसकी कीमत क्या है, और SANKET से क्या बदलता है।",
    withSanket: "SANKET के साथ",
    footnote:
      "बाज़ार के आँकड़े: IHL Group इन्वेंटरी डिस्टॉर्शन रिसर्च, 2025। नतीजों की रेंज योजना के लिए उदाहरण हैं, गारंटी नहीं।",
    items: [
      {
        short: "बेस्ट-सेलर ख़त्म हो जाता है",
        title: "आपका बेस्ट-सेलर फिर से ख़त्म हो गया।",
        feel: "ग्राहक प्रतिस्पर्धी के पास चला जाता है। ऊपर से, आपका सेल्स डेटा अब कहता है कि माँग कम थी — इसलिए अगली बार आप और भी कम ऑर्डर करते हैं।",
        cost: "स्टॉक ख़त्म होने से दुनिया भर के रिटेलर्स को हर साल लगभग $1.2 ट्रिलियन का नुकसान होता है।",
        fix: "SANKET स्टॉक ख़त्म रहने के दौरान छूटी हुई माँग को फिर से गिनता है, अगली कमी से पहले आपको चेतावनी देता है, और बताता है कि ठीक कितना दोबारा ऑर्डर करना है।",
        value: "40% तक",
        label: "कम स्टॉक-आउट",
      },
      {
        short: "गोदाम धीमे माल से भरा",
        title: "गोदाम उस माल से भरा है जिसे कोई नहीं चाहता।",
        feel: "पैसा डिब्बों में बंद पड़ा है। सीज़न ख़त्म होता है, और निकलने का एक ही रास्ता बचता है — भारी छूट, जो आपका मार्जिन खा जाती है।",
        cost: "ज़रूरत से ज़्यादा स्टॉक से रिटेलर्स को हर साल लगभग $572 बिलियन का नुकसान होता है।",
        fix: "हर ऑर्डर एक अंदाज़े पर नहीं, बल्कि पूर्वानुमान की रेंज पर तय होता है। धीमे बिकने वाले सामान हफ़्तों पहले पहचान लिए जाते हैं, साथ में छूट देने का सही समय भी।",
        value: "10–25%",
        label: "कम इन्वेंटरी रखनी पड़ती है",
      },
      {
        short: "पूर्वानुमान एक स्प्रेडशीट में",
        title: "पूरा पूर्वानुमान एक ही व्यक्ति की स्प्रेडशीट में है।",
        feel: "इसे अपडेट करने में दिन लगते हैं, कोई फ़ॉर्मूला बदले तो यह टूट जाता है, और वह व्यक्ति छुट्टी पर हो तो प्लानिंग रुक जाती है।",
        cost: "फ़ैसले देर से, पुराने आँकड़ों पर, अंदाज़े से लिए जाते हैं।",
        fix: "हर प्रोडक्ट के लिए एक साझा पूर्वानुमान, जो अपने-आप अपडेट होता है और उसका कारण भी दिखाता है — ताकि टीम का कोई भी व्यक्ति उस पर भरोसा करके काम कर सके।",
        value: "हर SKU",
        label: "का पूर्वानुमान, हर हफ़्ते अपने-आप",
      },
      {
        short: "नया लॉन्च, कोई इतिहास नहीं",
        title: "नया प्रोडक्ट। बिक्री का कोई इतिहास नहीं।",
        feel: "लॉन्च के लिए कितना ख़रीदें, यह पूछा जाता है — और ईमानदार जवाब है: अंदाज़ा।",
        cost: "ज़्यादा ख़रीदा तो माल पड़ा रहेगा। कम ख़रीदा तो लॉन्च तीसरे दिन ही ख़त्म।",
        fix: "फ़ाउंडेशन मॉडल मिलते-जुलते प्रोडक्ट्स से सीखकर पहले दिन से ही नए आइटम का पूर्वानुमान देते हैं। बिक्री के इतिहास की ज़रूरत नहीं।",
        value: "पहले दिन",
        label: "से नए लॉन्च का पूर्वानुमान",
      },
      {
        short: "दुनिया रातों-रात बदल जाती है",
        title: "एक लू, एक वायरल पोस्ट, एक प्राइस वॉर — और पूरी प्लानिंग बिखर जाती है।",
        feel: "आपकी प्लानिंग पिछले साल के हिसाब से बनी थी। आपके ग्राहकों को यह बात पता नहीं थी।",
        cost: "जब तक बदलाव बिक्री में दिखता है, तब तक दोबारा ऑर्डर करने में देर हो चुकी होती है।",
        fix: "मौसम, सर्च ट्रेंड, सोशल बज़, प्रतिस्पर्धी की कीमतें और माल-भाड़ा जैसे बारह लाइव संकेत बदलते ही पूर्वानुमान में शामिल हो जाते हैं।",
        value: "12",
        label: "लाइव बाहरी संकेत",
      },
      {
        short: "सही माल, ग़लत जगह",
        title: "सही माल। ग़लत शहर।",
        feel: "एक गोदाम में माल ख़त्म हो गया है, जबकि दूसरे में वही सामान पड़ा है।",
        cost: "आप जल्दबाज़ी में माल-भाड़ा भरते हैं और फिर भी बिक्री गँवा देते हैं।",
        fix: "SANKET हर गोदाम और स्टोर में स्टॉक की योजना बनाता है, और ज़रूरत पड़ने से पहले बताता है कि क्या कहाँ भेजना है।",
        value: "एक नज़र",
        label: "में हर जगह का स्टॉक",
      },
    ],
  },
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
  how: {
    eyebrow: "यह कैसे काम करता है",
    title: "आपके डेटा से आपके अगले ऑर्डर तक, सिर्फ़ तीन क़दमों में।",
    desc: "डेटा साइंस टीम की ज़रूरत नहीं। अगर आप सेल्स रिपोर्ट पढ़ सकते हैं, तो आप SANKET चला सकते हैं।",
    steps: [
      {
        title: "जो पहले से इस्तेमाल करते हैं, उसे जोड़ें",
        desc: "Tally, Zoho, SAP, Shopify, Amazon, POS सिस्टम या सीधा Excel। कुछ भी बदलने की ज़रूरत नहीं, और टीम को कोई नया सिस्टम नहीं सीखना पड़ता।",
        chips: ["Tally", "Shopify", "SAP", "Excel"],
      },
      {
        title: "आगे क्या आने वाला है, देखें",
        desc: "हर प्रोडक्ट के लिए, हर हफ़्ते का पूर्वानुमान — सबसे अच्छी, सबसे ख़राब और सबसे संभावित स्थिति के साथ, जो दुनिया बदलने के साथ अपडेट होता रहता है।",
        chips: ["हर SKU", "हर हफ़्ते", "रेंज के साथ"],
      },
      {
        title: "ठीक-ठीक जानें कि क्या करना है",
        desc: "ऑर्डर की मात्रा, स्टॉक ट्रांसफ़र और छूट का समय — आपकी मंज़ूरी के लिए तैयार। नियंत्रण आपके हाथ में; हिसाब SANKET करता है।",
        chips: ["दोबारा ऑर्डर", "ट्रांसफ़र", "छूट"],
      },
    ],
    benefits: [
      { title: "कम खाली शेल्फ़", desc: "ग्राहकों से पहले कमी पकड़ें।" },
      { title: "गोदाम में कम पैसा फँसा", desc: "असली माँग के क़रीब ख़रीदें और वर्किंग कैपिटल खाली करें।" },
      { title: "हर हफ़्ते घंटों की बचत", desc: "स्प्रेडशीट दोबारा बनाना बंद करें। फ़ैसलों की समीक्षा शुरू करें।" },
      { title: "ऐसे फ़ैसले जिन्हें आप समझा सकें", desc: "हर संख्या अपनी रेंज और अपने कारण दिखाती है।" },
    ],
  },
  command: {
    eyebrow: "ख़ुद आज़माकर देखें",
    title: "आपकी सोमवार की सुबह कुछ ऐसी दिखेगी।",
    desc: "परिदृश्य बदलें, पूर्वानुमान को खींचें, अवधि बदलें। हर संख्या के साथ एक रेंज और सुझाया गया क़दम मिलता है।",
    sandbox: "इंटरैक्टिव सैंडबॉक्स",
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
    connectTitle: "आपके सिस्टम, पहले से जुड़े हुए।",
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
  nav: {
    problems: "SANKET ఎందుకు",
    stories: "నిజమైన కథలు",
    how: "ఎలా పనిచేస్తుంది",
    industries: "పరిశ్రమలు",
    roi: "ROI",
  },
  cta: {
    whatsapp: "WhatsAppలో మాట్లాడండి",
    whatsappShort: "WhatsApp చేయండి",
    email: "ఈమెయిల్ చేయండి",
    floating: "మాతో మాట్లాడండి",
    waMessage: "నమస్తే, SANKET మా వ్యాపారానికి ఎలా ఉపయోగపడుతుందో చూడాలనుకుంటున్నాను.",
  },
  hero: {
    pill: "రిటైలర్లు, బ్రాండ్లు & డిస్ట్రిబ్యూటర్ల కోసం",
    h1a: "అమ్ముడయ్యేదే నిల్వ చేయండి.",
    h1b: "అమ్ముడవనిది వదిలేయండి.",
    leadPre: "ఖాళీ షెల్ఫ్‌లు, అమ్ముడుపోని సరుకు వల్ల రిటైలర్లు ఏటా ",
    leadStrong: "$1.77 ట్రిలియన్లు",
    leadPost: " నష్టపోతున్నారు.",
    desc: "మీ కస్టమర్లు తర్వాత ఏమి కొంటారో SANKET ముందే అంచనా వేస్తుంది — ప్రతి ప్రొడక్ట్‌కు, ప్రతి వారానికి — ఆపై ఏది ఆర్డర్ చేయాలో, ఎక్కడికి తరలించాలో, దేనిపై డిస్కౌంట్ ఇవ్వాలో స్పష్టంగా చెబుతుంది.",
    proof: "Tally, SAP, Shopify & Excelతో పనిచేస్తుంది",
    source: "నష్టం గణాంకం: IHL Group, 2025",
    videoLabel:
      "యానిమేషన్: బయటి సంకేతాలు SANKETకు చేరతాయి; అది డిమాండ్ అంచనా వేసి, 1,240 యూనిట్లు రీఆర్డర్ చేయమని సూచించి, స్టాక్-అవుట్‌లను తగ్గిస్తుంది.",
  },
  problems: {
    eyebrow: "ఇది మీకూ ఎదురైందా?",
    title: "ప్రతి వారం, స్టాక్ నిర్ణయాలు నిశ్శబ్దంగా మీ డబ్బును తినేస్తున్నాయి.",
    desc: "మిమ్మల్ని ఎక్కువగా ఇబ్బంది పెడుతున్న సమస్యను ఎంచుకోండి. దాని ఖరీదు ఏమిటో, SANKETతో ఏమి మారుతుందో చూడండి.",
    withSanket: "SANKETతో",
    footnote:
      "మార్కెట్ గణాంకాలు: IHL Group ఇన్వెంటరీ డిస్టార్షన్ రీసెర్చ్, 2025. ఫలితాల శ్రేణులు ప్లానింగ్ కోసం ఉదాహరణలు మాత్రమే, హామీలు కావు.",
    items: [
      {
        short: "బెస్ట్-సెల్లర్ అయిపోతుంది",
        title: "మీ బెస్ట్-సెల్లర్ మళ్లీ అయిపోయింది.",
        feel: "కస్టమర్ పోటీదారు దగ్గరకు వెళ్లిపోతాడు. పైగా, డిమాండ్ తక్కువగా ఉందని మీ సేల్స్ డేటా చెబుతుంది — కాబట్టి తర్వాతిసారి మీరు ఇంకా తక్కువ ఆర్డర్ చేస్తారు.",
        cost: "స్టాక్ అయిపోవడం వల్ల ప్రపంచవ్యాప్తంగా రిటైలర్లు ఏటా సుమారు $1.2 ట్రిలియన్లు నష్టపోతున్నారు.",
        fix: "స్టాక్ లేని సమయంలో కోల్పోయిన డిమాండ్‌ను SANKET తిరిగి లెక్కిస్తుంది, తదుపరి కొరతకు ముందే హెచ్చరిస్తుంది, ఎంత రీఆర్డర్ చేయాలో కచ్చితంగా చెబుతుంది.",
        value: "40% వరకు",
        label: "తక్కువ స్టాక్-అవుట్‌లు",
      },
      {
        short: "గోడౌన్ నిండా నెమ్మది సరుకు",
        title: "ఎవరికీ అక్కర్లేని సరుకుతో గోడౌన్ నిండిపోయింది.",
        feel: "డబ్బు డబ్బాల్లో బందీ అయిపోయింది. సీజన్ ముగుస్తుంది, బయటపడే ఒకే దారి — మీ మార్జిన్‌ను తినేసే భారీ డిస్కౌంట్.",
        cost: "అవసరానికి మించిన స్టాక్ వల్ల రిటైలర్లు ఏటా సుమారు $572 బిలియన్లు నష్టపోతున్నారు.",
        fix: "ప్రతి ఆర్డర్ ఒక్క ఊహపై కాకుండా, అంచనాల శ్రేణిపై నిర్ణయించబడుతుంది. నెమ్మదిగా అమ్ముడయ్యే వాటిని వారాల ముందే గుర్తిస్తుంది, డిస్కౌంట్ ఇవ్వడానికి సరైన సమయంతో సహా.",
        value: "10–25%",
        label: "తక్కువ ఇన్వెంటరీ మోయాలి",
      },
      {
        short: "అంచనా ఒక స్ప్రెడ్‌షీట్‌లోనే",
        title: "మొత్తం అంచనా ఒక్క వ్యక్తి స్ప్రెడ్‌షీట్‌లోనే ఉంది.",
        feel: "దీన్ని అప్‌డేట్ చేయడానికి రోజులు పడతాయి, ఎవరైనా ఫార్ములా మారిస్తే పాడవుతుంది, ఆ వ్యక్తి సెలవులో ఉంటే ప్లానింగ్ ఆగిపోతుంది.",
        cost: "నిర్ణయాలు ఆలస్యంగా, పాత అంకెలతో, ఊహతో తీసుకోబడతాయి.",
        fix: "ప్రతి ప్రొడక్ట్‌కు ఒకే ఉమ్మడి అంచనా, ఆటోమేటిక్‌గా అప్‌డేట్ అవుతుంది, కారణాన్ని కూడా చూపిస్తుంది — కాబట్టి టీమ్‌లో ఎవరైనా దాన్ని నమ్మి పని చేయవచ్చు.",
        value: "ప్రతి SKU",
        label: "కు అంచనా, ప్రతి వారం ఆటోమేటిక్‌గా",
      },
      {
        short: "కొత్త లాంచ్, పాత డేటా లేదు",
        title: "కొత్త ప్రొడక్ట్. అమ్మకాల చరిత్ర శూన్యం.",
        feel: "లాంచ్ కోసం ఎంత కొనాలని అడుగుతారు — నిజాయితీగా చెప్పాలంటే అది కేవలం ఊహ.",
        cost: "ఎక్కువ కొంటే సరుకు మిగిలిపోతుంది. తక్కువ కొంటే మూడో రోజుకే లాంచ్ అయిపోతుంది.",
        fix: "ఫౌండేషన్ మోడళ్లు ఒకేలాంటి ప్రొడక్ట్‌ల నుంచి నేర్చుకుని మొదటి రోజు నుంచే కొత్త ఐటమ్‌లకు అంచనా ఇస్తాయి. అమ్మకాల చరిత్ర అవసరం లేదు.",
        value: "మొదటి రోజు",
        label: "నుంచే కొత్త లాంచ్‌లకు అంచనా",
      },
      {
        short: "ప్రపంచం రాత్రికి రాత్రే మారుతుంది",
        title: "ఒక వడగాలి, ఒక వైరల్ పోస్ట్, ఒక ధరల యుద్ధం — ప్లాన్ మొత్తం కుప్పకూలుతుంది.",
        feel: "మీ ప్లాన్ గత ఏడాది ఆధారంగా తయారైంది. మీ కస్టమర్లకు ఆ సంగతి తెలియదు.",
        cost: "మార్పు అమ్మకాల్లో కనిపించే సరికి, రీఆర్డర్ చేయడానికి ఆలస్యమైపోతుంది.",
        fix: "వాతావరణం, సెర్చ్ ట్రెండ్‌లు, సోషల్ బజ్, పోటీదారుల ధరలు, సరుకు రవాణా ఖర్చులు వంటి పన్నెండు లైవ్ సంకేతాలు మారిన వెంటనే అంచనాలో చేరతాయి.",
        value: "12",
        label: "లైవ్ బయటి సంకేతాలు",
      },
      {
        short: "సరైన సరుకు, తప్పు చోట",
        title: "సరైన సరుకు. తప్పు నగరం.",
        feel: "ఒక గోడౌన్‌లో సరుకు అయిపోయింది, మరో గోడౌన్‌లో అదే సరుకు పడి ఉంది.",
        cost: "మీరు అత్యవసర రవాణాకు డబ్బు చెల్లిస్తారు, అయినా అమ్మకం కోల్పోతారు.",
        fix: "SANKET ప్రతి గోడౌన్, స్టోర్‌లో స్టాక్‌ను ప్లాన్ చేస్తుంది, అత్యవసరం కాకముందే ఏది ఎక్కడికి తరలించాలో చెబుతుంది.",
        value: "ఒకే చోట",
        label: "అన్ని లొకేషన్ల స్టాక్",
      },
    ],
  },
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
  how: {
    eyebrow: "ఇది ఎలా పనిచేస్తుంది",
    title: "మీ డేటా నుంచి మీ తదుపరి ఆర్డర్ వరకు, మూడు అడుగుల్లో.",
    desc: "డేటా సైన్స్ టీమ్ అవసరం లేదు. మీరు సేల్స్ రిపోర్ట్ చదవగలిగితే, SANKET వాడగలరు.",
    steps: [
      {
        title: "మీరు ఇప్పటికే వాడుతున్నవాటిని కనెక్ట్ చేయండి",
        desc: "Tally, Zoho, SAP, Shopify, Amazon, POS సిస్టమ్‌లు లేదా సాధారణ Excel. ఏదీ మార్చాల్సిన పని లేదు, మీ టీమ్ కొత్త సిస్టమ్ నేర్చుకోవాల్సిన అవసరం లేదు.",
        chips: ["Tally", "Shopify", "SAP", "Excel"],
      },
      {
        title: "రాబోయేది ముందే చూడండి",
        desc: "ప్రతి ప్రొడక్ట్‌కు, ప్రతి వారానికి అంచనా — ఉత్తమ, చెత్త, అత్యంత సంభావ్య పరిస్థితులతో, ప్రపంచం మారుతున్న కొద్దీ అప్‌డేట్ అవుతుంది.",
        chips: ["ప్రతి SKU", "ప్రతి వారం", "శ్రేణితో"],
      },
      {
        title: "ఏం చేయాలో కచ్చితంగా తెలుసుకోండి",
        desc: "ఆర్డర్ పరిమాణాలు, స్టాక్ బదిలీలు, డిస్కౌంట్ సమయం — మీ ఆమోదం కోసం సిద్ధంగా. నియంత్రణ మీదే; లెక్కలు SANKET చూసుకుంటుంది.",
        chips: ["రీఆర్డర్", "బదిలీ", "డిస్కౌంట్"],
      },
    ],
    benefits: [
      { title: "తక్కువ ఖాళీ షెల్ఫ్‌లు", desc: "కస్టమర్ల కంటే ముందే కొరతను పట్టుకోండి." },
      { title: "గోడౌన్‌లో తక్కువ డబ్బు", desc: "నిజమైన డిమాండ్‌కు దగ్గరగా కొనండి, వర్కింగ్ క్యాపిటల్‌ను విడుదల చేయండి." },
      { title: "ప్రతి వారం గంటల ఆదా", desc: "స్ప్రెడ్‌షీట్‌లు మళ్లీ మళ్లీ తయారు చేయడం ఆపండి. నిర్ణయాలను సమీక్షించడం మొదలుపెట్టండి." },
      { title: "వివరించగలిగే నిర్ణయాలు", desc: "ప్రతి అంకె దాని శ్రేణిని, కారణాలను చూపిస్తుంది." },
    ],
  },
  command: {
    eyebrow: "మీరే ప్రయత్నించండి",
    title: "మీ సోమవారం ఉదయం ఇలా ఉంటుంది.",
    desc: "సందర్భాలు మార్చండి, అంచనాను లాగండి, కాలవ్యవధి మార్చండి. ప్రతి అంకెతో పాటు ఒక శ్రేణి, సూచించిన చర్య వస్తాయి.",
    sandbox: "ఇంటరాక్టివ్ శాండ్‌బాక్స్",
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
    connectTitle: "మీ సిస్టమ్‌లు, ఇప్పటికే కనెక్ట్ అయి ఉన్నాయి.",
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
