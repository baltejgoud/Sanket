export const industries = [
  {
    name: "Apparel & fashion",
    short: "Apparel",
    icon: "Shirt",
    tag: "From first drop to final markdown.",
    desc: "Turn fast-moving trends into precisely timed inventory. Connect visual buzz, size curves, and 6–12 week product lifecycles in one focused workspace.",
    metric: "18.4%",
    label: "forecast error · WAPE",
    product: "Essential cotton tee",
    unit: "units",
    features: [
      "TikTok, Instagram & Pinterest trend fusion",
      "Censored demand & size-curve reconstruction",
      "Dynamic end-of-season markdown timing",
    ],
    color: "#2563eb",
  },
  {
    name: "Consumer electronics",
    short: "Electronics",
    icon: "Cpu",
    tag: "Stay ahead of the next release.",
    desc: "Anticipate component shortages, launch new products with zero history, and protect margins as technology moves forward.",
    metric: "21.1%",
    label: "cold-start error · WAPE",
    product: "Wireless headphones",
    unit: "units",
    features: [
      "Zero-shot NPI launch forecasts",
      "Multi-tier BOM & supplier lead times",
      "Competitor price elasticity alerts",
    ],
    color: "#4f46e5",
  },
  {
    name: "Pharma & life sciences",
    short: "Pharma",
    icon: "Pill",
    tag: "Every decision. Fully traceable.",
    desc: "Bring demand intelligence to regulated supply chains with FEFO dispatch, electronic QA release, and cold-chain excursion controls.",
    metric: "2–8°C",
    label: "cold-chain operating range",
    product: "Cold-chain therapeutic",
    unit: "packs",
    features: [
      "GxP / Part 11 audit architecture",
      "Append-only logs & dual-credential sign-offs",
      "OpenFDA recalls & FEFO dispatch",
    ],
    color: "#059669",
  },
  {
    name: "Agrocenter & agriculture",
    short: "Agriculture",
    icon: "Sprout",
    tag: "Plan with the rhythm of the land.",
    desc: "Align regional inventory with crop calendars, soil demand, and local weather signals refreshed every six hours.",
    metric: "6 hrs",
    label: "weather signal refresh",
    product: "Seasonal crop nutrients",
    unit: "bags",
    features: [
      "Hyper-local OpenWeatherMap forecasts",
      "Crop calendar & regional soil alignment",
      "Multi-warehouse transfer optimization",
    ],
    color: "#059669",
  },
  {
    name: "Hardware & industrial MRO",
    short: "Industrial",
    icon: "Wrench",
    tag: "Make intermittent demand predictable.",
    desc: "Coordinate more than 100,000 parts with specialist models for lumpy demand, multi-echelon safety stock, and supplier SLAs.",
    metric: "100k+",
    label: "managed SKU architecture",
    product: "Precision bearing assembly",
    unit: "parts",
    features: [
      "Croston, SBA & ADIDA estimators",
      "Multi-echelon safety-stock optimization",
      "Supplier SLA & maintenance demand alerts",
    ],
    color: "#d97706",
  },
];
export const connectors = {
  "Global commerce": [
    "SAP S/4HANA",
    "Oracle ERP Cloud",
    "Dynamics 365",
    "NetSuite",
    "Odoo",
    "Shopify",
    "WooCommerce",
    "Amazon SP-API",
    "Flipkart",
    "Magento",
    "BigCommerce",
  ],
  "India ERP": [
    "Tally Prime / ERP 9",
    "Busy Accounting",
    "Marg ERP",
    "Zoho Books",
    "Vyapar",
  ],
  "POS & data": [
    "Square",
    "Clover",
    "Lightspeed",
    "Toast",
    "Petpooja",
    "PostgreSQL",
    "MySQL",
    "SQL Server",
    "Snowflake",
    "BigQuery",
    "ClickHouse",
    "Parquet / CSV / Excel",
  ],
};
export const optimizers = [
  {
    name: "Order the right amount",
    label: "Newsvendor + EOQ",
    desc: "Balance carrying cost against lost sales at the optimal order quantity.",
    file: "optimization/eoq.py",
    result: "Order 1,240 units",
    detail: "Service target 95% · Lead time 14 days",
    icon: "PackageCheck",
  },
  {
    name: "Balance stock across locations",
    label: "Network intelligence",
    desc: "Put safety stock in the right place, across every node in your network.",
    file: "optimization/multi_echelon.py",
    result: "Transfer 360 units",
    detail: "Central hub → West distribution center",
    icon: "Network",
  },
  {
    name: "Adapt as demand changes",
    label: "Ray RLlib PPO + OR-Tools",
    desc: "Continuously adapt replenishment policies to changing real-world conditions.",
    file: "optimization/rl_replenishment.py",
    result: "Reorder point 820",
    detail: "PPO policy · simulation reward +12.8%",
    icon: "Bot",
  },
  {
    name: "Time your markdowns",
    label: "Margin-aware pricing",
    desc: "Find the right price and moment before inventory becomes dead stock.",
    file: "optimization/markdown.py",
    result: "Markdown 12% in W8",
    detail: "Projected sell-through 92% · margin protected",
    icon: "Tags",
  },
];
// Problem and story text lives in i18n.ts; these carry the language-neutral parts.
export const problemIcons = [
  "PackageX",
  "Warehouse",
  "FileSpreadsheet",
  "Sparkles",
  "CloudSun",
  "MapPin",
];

export const storyMeta: {
  region: "india" | "global";
  year: string;
  sources: { label: string; url: string }[];
}[] = [
  {
    region: "india",
    year: "2024",
    sources: [
      {
        label: "Moneylife / FADA",
        url: "https://moneylife.in/article/auto-dealers-inventory-jumps-to-78-lakh-vehicles-valued-at-rs77800-crore-in-august-fada/75082.html",
      },
    ],
  },
  {
    region: "india",
    year: "2021",
    sources: [
      {
        label: "Udayavani / PTI",
        url: "https://udayavani.com/?p=1096484",
      },
      {
        label: "Scrip",
        url: "https://scrip.citeline.com/SC142444/Hetero-Ciplas-Remdesivirs-Hit-India-Market-Surplus-Envisaged-By-August",
      },
    ],
  },
  {
    region: "india",
    year: "2020",
    sources: [
      {
        label: "Autocar Professional",
        url: "https://autocarpro.in/news-national/now-only-supreme-court-oems-hold-answer-to-dealers-bs-iv-stock-woes-55990",
      },
      {
        label: "BW Businessworld",
        url: "https://businessworld.in/index.php/article/supreme-court-allows-only-10-of-bs-iv-inventory-to-be-sold-post-lockdown-187476",
      },
    ],
  },
  {
    region: "global",
    year: "2001",
    sources: [
      {
        label: "CIO",
        url: "https://www.cio.com/article/272460/supply-chain-management-nike-rebounds-how-and-why-nike-recovered-from-its-supply-chain-disaster.html",
      },
    ],
  },
  {
    region: "global",
    year: "2018",
    sources: [
      {
        label: "NPR",
        url: "https://www.npr.org/2018/03/28/597750721/h-m-leaves-4-3-billion-in-unsold-inventory-on-the-racks",
      },
    ],
  },
  {
    region: "global",
    year: "2015",
    sources: [
      {
        label: "PBS NewsHour",
        url: "https://www.pbs.org/newshour/economy/target-shutting-canada-two-years",
      },
    ],
  },
];
