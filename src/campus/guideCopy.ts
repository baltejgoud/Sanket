import type { Lang } from '../i18n';

export type StoryChapter = 'warehouse' | 'problems' | 'forecast' | 'decide';

/** Each cue describes the actual geometry in this beat, without treating boxes as units. */
export const guideCopy = {
  en: {
    model: 'IN THE MODEL', scene: 'Scene', previous: 'Previous scene', nextChapter: 'Next chapter',
    skip: 'See the decisions', controls: 'Scroll to explore. Use the scene controls to move at your own pace.',
    loading: 'Preparing the warehouse…', fallback: 'The 3D preview is unavailable. Read the complete walkthrough below.',
    cues: {
      warehouse: ['One warehouse, from storage racks to the dispatch bays.', 'A2: fast seller · A3: transfer stock · A4: slow seller. Boxes are symbolic.'],
      problems: ['Orange outline: watch product A2 as demand rises.', 'The empty A2 rack shows a stockout: demand remains, stock does not.', 'A4 stays full. Slow sales tie up cash even while A2 is empty.'],
      forecast: ['The light trail represents information arriving, not a shipment.', 'Mint wireframes show a stock target. They are not inventory on hand.', 'Solid mint boxes show a proposed order, not stock that has arrived.', 'The mint path highlights stock in A3 that could move to dispatch.', 'The amber outline marks A4 for a markdown review, not an approved price change.'],
      decide: ['The highlighted pallet in A3 is the stock selected for this transfer.', 'Follow the forklift along the aisle to the loading bay.', 'The pallet enters the parked truck. Loading happens before departure.', 'The route shows the shipment’s direction; the destination is outside this model.', 'The truck leaves the warehouse. Delivery is not shown in this example.'],
    },
    explore: 'Explore the planning tools',
    toolNotes: ['Change demand and see how an example recommendation responds.', 'Adjust your costs and assumptions to estimate potential benefit.', 'Explore industries and the systems you could connect.'],
    prepare: 'Start with one product, its locations, and the stock decision you want to improve.',
    context: 'Included in your message', remove: 'Remove',
    form: { title: 'Or tell us in three lines', name: 'Your name', company: 'Company', need: 'What you sell, and what is hardest to predict', email: 'Write the email', whatsapp: 'Send on WhatsApp', note: 'Opens your own email or WhatsApp with this filled in. Nothing is sent from this page.' },
    saver: 'Data saver is on, so the 3D warehouse was not downloaded (about 600 kB).', saverLoad: 'Load the 3D warehouse',
    faqTitle: 'Before we talk',
    questions: [
      ['What data would we start with?', 'Sales history, current stock, incoming orders and supplier lead times, by product and location. Tell us which systems or files hold them so we can discuss the starting point.'],
      ['Who approves the recommendations?', 'Your team. Ordering, transfers and markdowns are recommendations to review against operational limits, availability and margin before execution.'],
      ['Are the numbers and warehouse live?', 'This is an illustrative walkthrough. The 3D warehouse, forecast scenarios and benefit estimates explain the approach; they are not live inventory or customer results.'],
    ],
  },
  hi: {
    model: 'मॉडल में', scene: 'दृश्य', previous: 'पिछला दृश्य', nextChapter: 'अगला अध्याय',
    skip: 'निर्णय देखें', controls: 'स्क्रॉल करें या दृश्य के बटन से अपनी गति से आगे बढ़ें।',
    loading: 'गोदाम तैयार हो रहा है…', fallback: '3D दृश्य उपलब्ध नहीं है। पूरी कहानी नीचे पढ़ें।',
    cues: {
      warehouse: ['एक गोदाम: स्टॉक के रैक से डिस्पैच तक।', 'A2: तेज़ बिक्री · A3: ट्रांसफर · A4: धीमी बिक्री। डिब्बे प्रतीक हैं।'],
      problems: ['नारंगी घेरा: मांग बढ़ने पर A2 को देखें।', 'खाली A2 रैक: मांग अभी है, स्टॉक खत्म है।', 'A4 भरा रहता है। A2 खाली होने पर भी यहाँ पैसा फँसा है।'],
      forecast: ['रोशनी की रेखा डेटा के आने को दिखाती है, माल को नहीं।', 'हरे ढाँचे स्टॉक का लक्ष्य हैं, उपलब्ध माल नहीं।', 'हरे डिब्बे प्रस्तावित ऑर्डर हैं, पहुँचा हुआ स्टॉक नहीं।', 'हरा रास्ता A3 से डिस्पैच तक संभावित ट्रांसफर दिखाता है।', 'पीला घेरा A4 की कीमत की समीक्षा दिखाता है, मंज़ूर बदलाव नहीं।'],
      decide: ['A3 का चुना पैलेट इस ट्रांसफर का स्टॉक है।', 'फोर्कलिफ्ट को रास्ते से लोडिंग बे तक देखें।', 'पहले पैलेट खड़े ट्रक में लोड होता है, फिर ट्रक निकलता है।', 'रास्ता शिपमेंट की दिशा दिखाता है। गंतव्य मॉडल के बाहर है।', 'ट्रक गोदाम से निकलता है। इस उदाहरण में डिलीवरी नहीं दिखाई गई।'],
    },
    explore: 'योजना के टूल देखें',
    toolNotes: ['मांग बदलें और उदाहरण के सुझाव पर असर देखें।', 'खर्च और मान्यताएँ बदलकर संभावित लाभ देखें।', 'उद्योग और जोड़े जा सकने वाले सिस्टम देखें।'],
    prepare: 'एक उत्पाद, उसके स्थान और जिस स्टॉक निर्णय को सुधारना है, उससे शुरू करें।',
    context: 'आपके संदेश में शामिल', remove: 'हटाएँ',
    form: { title: 'या तीन पंक्तियों में बताएँ', name: 'आपका नाम', company: 'कंपनी', need: 'आप क्या बेचते हैं, और किसकी मांग का अनुमान सबसे कठिन है', email: 'ईमेल लिखें', whatsapp: 'WhatsApp पर भेजें', note: 'यह आपका अपना ईमेल या WhatsApp भरकर खोलता है। इस पेज से कुछ नहीं भेजा जाता।' },
    saver: 'डेटा सेवर चालू है, इसलिए 3D गोदाम (लगभग 600 kB) डाउनलोड नहीं हुआ।', saverLoad: '3D गोदाम लोड करें',
    faqTitle: 'बात करने से पहले',
    questions: [
      ['किस डेटा से शुरुआत करें?', 'उत्पाद और स्थान के अनुसार बिक्री का इतिहास, मौजूदा स्टॉक, आने वाले ऑर्डर और सप्लायर का समय। बताएँ यह जानकारी किन सिस्टम या फ़ाइलों में है।'],
      ['सुझावों को कौन मंज़ूर करता है?', 'आपकी टीम। ऑर्डर, ट्रांसफर और कीमत बदलने से पहले संचालन की सीमाओं, उपलब्धता और मार्जिन के अनुसार सुझावों की समीक्षा करें।'],
      ['क्या ये आँकड़े और गोदाम लाइव हैं?', 'यह समझाने के लिए एक उदाहरण है। 3D गोदाम, मांग के परिदृश्य और लाभ के अनुमान लाइव स्टॉक या ग्राहक के परिणाम नहीं हैं।'],
    ],
  },
  te: {
    model: 'మోడల్‌లో', scene: 'దృశ్యం', previous: 'మునుపటి దృశ్యం', nextChapter: 'తదుపరి అధ్యాయం',
    skip: 'నిర్ణయాలను చూడండి', controls: 'స్క్రోల్ చేయండి లేదా దృశ్యాల బటన్లతో మీ వేగంతో ముందుకు వెళ్లండి.',
    loading: 'గిడ్డంగిని సిద్ధం చేస్తున్నాం…', fallback: '3D దృశ్యం అందుబాటులో లేదు. పూర్తి కథను కింద చదవండి.',
    cues: {
      warehouse: ['ఒక గిడ్డంగి: నిల్వ ర్యాక్‌ల నుంచి డిస్పాచ్ బేల వరకు.', 'A2: వేగమైన అమ్మకాలు · A3: బదిలీ · A4: నెమ్మది అమ్మకాలు. పెట్టెలు ప్రతీకలు.'],
      problems: ['నారింజ రంగు అంచు: డిమాండ్ పెరుగుతున్న A2ను చూడండి.', 'ఖాళీ A2 ర్యాక్: డిమాండ్ ఉంది, స్టాక్ లేదు.', 'A4 నిండుగానే ఉంది. A2 ఖాళీ అయినా ఇక్కడ డబ్బు నిలిచిపోయింది.'],
      forecast: ['కాంతి మార్గం సమాచారం రావడాన్ని చూపిస్తుంది, సరుకును కాదు.', 'ఆకుపచ్చ చట్రాలు స్టాక్ లక్ష్యం; అందుబాటులోని సరుకు కాదు.', 'ఆకుపచ్చ పెట్టెలు ప్రతిపాదిత ఆర్డర్; చేరుకున్న స్టాక్ కాదు.', 'ఆకుపచ్చ మార్గం A3 నుంచి డిస్పాచ్‌కు సాధ్యమైన బదిలీని చూపిస్తుంది.', 'పసుపు అంచు A4 ధర సమీక్షను చూపిస్తుంది; ఆమోదించిన మార్పు కాదు.'],
      decide: ['A3లో ఎంచుకున్న ప్యాలెట్ ఈ బదిలీ కోసం.', 'ఫోర్క్‌లిఫ్ట్‌ను దారి వెంట లోడింగ్ బే వరకు చూడండి.', 'ప్యాలెట్ ఆగి ఉన్న ట్రక్‌లోకి వెళ్తుంది. లోడింగ్ తర్వాతే బయలుదేరుతుంది.', 'మార్గం షిప్‌మెంట్ దిశను చూపిస్తుంది. గమ్యం మోడల్ బయట ఉంది.', 'ట్రక్ గిడ్డంగి నుంచి బయలుదేరుతుంది. డెలివరీ ఈ ఉదాహరణలో చూపలేదు.'],
    },
    explore: 'ప్రణాళిక సాధనాలను చూడండి',
    toolNotes: ['డిమాండ్ మార్చి ఉదాహరణ సూచనపై ప్రభావం చూడండి.', 'ఖర్చులు, అంచనాలను మార్చి సాధ్యమైన ప్రయోజనం చూడండి.', 'పరిశ్రమలు, అనుసంధానించగల వ్యవస్థలను చూడండి.'],
    prepare: 'ఒక ఉత్పత్తి, దాని ప్రదేశాలు, మెరుగుపరచాలనుకున్న స్టాక్ నిర్ణయంతో మొదలుపెట్టండి.',
    context: 'మీ సందేశంలో చేర్చినవి', remove: 'తొలగించండి',
    form: { title: 'లేదా మూడు వాక్యాల్లో చెప్పండి', name: 'మీ పేరు', company: 'కంపెనీ', need: 'మీరు ఏమి అమ్ముతారు, ఏ డిమాండ్ అంచనా వేయడం కష్టం', email: 'ఈమెయిల్ రాయండి', whatsapp: 'WhatsAppలో పంపండి', note: 'ఇది మీ స్వంత ఈమెయిల్ లేదా WhatsAppను ఈ వివరాలతో తెరుస్తుంది. ఈ పేజీ నుంచి ఏదీ పంపబడదు.' },
    saver: 'డేటా సేవర్ ఆన్‌లో ఉంది, కాబట్టి 3D గిడ్డంగి (సుమారు 600 kB) డౌన్‌లోడ్ కాలేదు.', saverLoad: '3D గిడ్డంగిని లోడ్ చేయండి',
    faqTitle: 'మాట్లాడే ముందు',
    questions: [
      ['ఏ డేటాతో మొదలుపెట్టాలి?', 'ఉత్పత్తి, ప్రదేశం ప్రకారం అమ్మకాల చరిత్ర, ప్రస్తుత స్టాక్, రానున్న ఆర్డర్లు, సరఫరా సమయాలు. ఇవి ఏ వ్యవస్థలు లేదా ఫైళ్లలో ఉన్నాయో చెప్పండి.'],
      ['సూచనలను ఎవరు ఆమోదిస్తారు?', 'మీ బృందం. ఆర్డర్లు, బదిలీలు, ధర మార్పులను అమలు చేసే ముందు నిర్వహణ పరిమితులు, లభ్యత, మార్జిన్ ఆధారంగా సమీక్షించండి.'],
      ['ఈ సంఖ్యలు, గిడ్డంగి ప్రత్యక్షమైనవా?', 'ఇది వివరించే ఉదాహరణ. 3D గిడ్డంగి, డిమాండ్ దృశ్యాలు, ప్రయోజన అంచనాలు ప్రత్యక్ష స్టాక్ లేదా కస్టమర్ ఫలితాలు కావు.'],
    ],
  },
} satisfies Record<Lang, unknown>;
