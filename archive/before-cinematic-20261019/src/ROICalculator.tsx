import { useContext, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Plus, RefreshCw } from 'lucide-react';
import { LangContext, useT } from './i18n';

type Currency = 'INR' | 'USD';
const presets = {
  INR: [{revenue:5e7,inventory:1e7},{revenue:5e8,inventory:1e8},{revenue:5e9,inventory:1e9}],
  USD: [{revenue:5e6,inventory:1e6},{revenue:25e6,inventory:5e6},{revenue:100e6,inventory:20e6}],
};
const copy = {
  en:{profile:'Your business profile',currency:'Scenario currency',preset:'Business size',sizes:['Small business','Growing business','Enterprise'],reset:'Reset',revenue:'Annual revenue',inventory:'Inventory value',holding:'Annual holding cost',margin:'Gross margin',stockouts:'Stockout rate',reduction:'Inventory reduction',stockReduction:'Stockout reduction',impact:'ESTIMATED ANNUAL IMPACT',sub:'Potential savings, based on your inputs.',rows:['Inventory carrying savings','Lost sales recovery','Expedited freight savings','End-of-season markdowns'],note:'Illustrative estimate, not a guarantee. Currency switches load separate sample businesses; they do not convert your inputs.',formula:'See the calculation',assumptions:'Edit savings assumptions',freight:'Annual expedited freight spend',markdown:'Annual markdown losses',freightRate:'Freight savings',markdownRate:'Markdown savings',raw:'Enter full amounts in the selected currency.'},
  hi:{profile:'आपके व्यवसाय की जानकारी',currency:'उदाहरण की मुद्रा',preset:'व्यवसाय का आकार',sizes:['छोटा व्यवसाय','बढ़ता व्यवसाय','एंटरप्राइज़'],reset:'रीसेट',revenue:'वार्षिक बिक्री',inventory:'स्टॉक का मूल्य',holding:'वार्षिक रखरखाव लागत',margin:'सकल मार्जिन',stockouts:'स्टॉक खत्म होने की दर',reduction:'स्टॉक में कमी',stockReduction:'स्टॉकआउट में कमी',impact:'अनुमानित वार्षिक लाभ',sub:'आपकी जानकारी के आधार पर संभावित बचत।',rows:['स्टॉक रखने की लागत में बचत','खोई बिक्री की वापसी','तत्काल मालभाड़े में बचत','मार्कडाउन में बचत'],note:'यह उदाहरण है, गारंटी नहीं। मुद्रा बदलने पर नया नमूना व्यवसाय लोड होता है; इनपुट का रूपांतरण नहीं होता।',formula:'गणना देखें',assumptions:'बचत की मान्यताएँ बदलें',freight:'वार्षिक तत्काल मालभाड़ा खर्च',markdown:'वार्षिक मार्कडाउन नुकसान',freightRate:'मालभाड़ा बचत',markdownRate:'मार्कडाउन बचत',raw:'चुनी गई मुद्रा में पूरी राशि दर्ज करें।'},
  te:{profile:'మీ వ్యాపార వివరాలు',currency:'ఉదాహరణ కరెన్సీ',preset:'వ్యాపార పరిమాణం',sizes:['చిన్న వ్యాపారం','పెరుగుతున్న వ్యాపారం','ఎంటర్‌ప్రైజ్'],reset:'రీసెట్',revenue:'వార్షిక ఆదాయం',inventory:'స్టాక్ విలువ',holding:'వార్షిక నిల్వ ఖర్చు',margin:'స్థూల మార్జిన్',stockouts:'స్టాక్ కొరత రేటు',reduction:'స్టాక్ తగ్గింపు',stockReduction:'స్టాక్ కొరత తగ్గింపు',impact:'అంచనా వార్షిక ప్రయోజనం',sub:'మీ వివరాల ఆధారంగా సాధ్యమైన పొదుపు.',rows:['స్టాక్ నిల్వ ఖర్చు పొదుపు','కోల్పోయిన అమ్మకాల పునరుద్ధరణ','అత్యవసర రవాణా పొదుపు','మార్క్‌డౌన్ పొదుపు'],note:'ఇది ఉదాహరణ అంచనా, హామీ కాదు. కరెన్సీ మార్చినప్పుడు వేరే నమూనా వ్యాపారం లోడ్ అవుతుంది; ఇన్‌పుట్‌లు మార్పిడి కావు.',formula:'లెక్క చూడండి',assumptions:'పొదుపు అంచనాలను మార్చండి',freight:'వార్షిక అత్యవసర రవాణా ఖర్చు',markdown:'వార్షిక మార్క్‌డౌన్ నష్టాలు',freightRate:'రవాణా పొదుపు',markdownRate:'మార్క్‌డౌన్ పొదుపు',raw:'ఎంచుకున్న కరెన్సీలో పూర్తి మొత్తాలను నమోదు చేయండి.'},
};

function EditableNumber({value,commit,min,max,label,id}:{value:number;commit:(n:number)=>void;min:number;max:number;label:string;id?:string}) {
  const [draft,setDraft]=useState(String(value));
  useEffect(()=>setDraft(String(value)),[value]);
  const save=()=>{const n=Number(draft);if(draft.trim()!=='' && Number.isFinite(n)){const valid=Math.max(min,Math.min(max,n));commit(valid);setDraft(String(valid));}else setDraft(String(value));};
  return <input id={id} aria-label={label} type="number" inputMode="decimal" min={min} max={max} step="any" value={draft} onChange={e=>setDraft(e.target.value)} onBlur={save} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();}}/>;
}

// Animate only the decorative bar. Keep the financial result exact and immediate.
export default function ROICalculator() {
  const t=useT(); const lang=useContext(LangContext); const c=copy[lang]; const reduced=useReducedMotion();
  const [currency,setCurrency]=useState<Currency>('INR'); const [size,setSize]=useState(0);
  const [revenue,setRevenue]=useState(5e7); const [inventory,setInventory]=useState(1e7);
  const [holding,setHolding]=useState(25); const [margin,setMargin]=useState(30); const [stockouts,setStockouts]=useState(5);
  const [inventoryReduction,setInventoryReduction]=useState(10); const [stockReduction,setStockReduction]=useState(20);
  const [freightSpend,setFreightSpend]=useState(175000); const [markdownSpend,setMarkdownSpend]=useState(600000);
  const [freightRate,setFreightRate]=useState(40); const [markdownRate,setMarkdownRate]=useState(15);
  const [updated,setUpdated]=useState(false); const didMount=useRef(false);
  const carrying=inventory*holding/100*inventoryReduction/100;
  const recovered=revenue*stockouts/100*margin/100*stockReduction/100;
  const freight=freightSpend*freightRate/100; const markdown=markdownSpend*markdownRate/100;
  const values=[carrying,recovered,freight,markdown]; const total=values.reduce((a,b)=>a+b,0);
  const format=(n:number)=>new Intl.NumberFormat(currency==='INR'?'en-IN':'en-US',{style:'currency',currency,maximumFractionDigits:0}).format(n);
  const short=(n:number)=>currency==='INR' ? `₹${+(n/(n>=1e7?1e7:1e5)).toFixed(2)} ${n>=1e7?'cr':'lakh'}` : `$${+(n/1e6).toFixed(2)}M`;
  const load=(curr:Currency,index:number)=>{const p=presets[curr][index]; setCurrency(curr);setSize(index);setRevenue(p.revenue);setInventory(p.inventory);setHolding(25);setMargin(30);setStockouts(5);setInventoryReduction(10);setStockReduction(20);setFreightSpend(p.revenue*.0035);setMarkdownSpend(p.revenue*.012);setFreightRate(40);setMarkdownRate(15);};
  useEffect(()=>{if(!didMount.current){didMount.current=true;return;}setUpdated(true);const timer=setTimeout(()=>setUpdated(false),260);return()=>clearTimeout(timer);},[total]);
  const p=presets[currency][size];
  const sliders=[{key:'revenue',label:c.revenue,value:revenue,set:setRevenue,min:p.revenue/10,max:p.revenue*5,step:p.revenue/100,money:true},{key:'inventory',label:c.inventory,value:inventory,set:setInventory,min:p.inventory/10,max:p.inventory*5,step:p.inventory/100,money:true},{key:'holding',label:c.holding,value:holding,set:setHolding,min:5,max:40,step:1},{key:'margin',label:c.margin,value:margin,set:setMargin,min:5,max:80,step:1},{key:'stockouts',label:c.stockouts,value:stockouts,set:setStockouts,min:1,max:20,step:1}];
  return <section className="section roi" id="roi"><div className="section-heading"><span className="eyebrow">{t.roi.eyebrow}</span><h2>{t.roi.title}</h2><p>{t.roi.desc}</p></div>
    <div className="roi-controls"><div className="tabs" role="group" aria-label={c.currency}>{(['INR','USD'] as const).map(curr=><button key={curr} aria-pressed={currency===curr} className={currency===curr?'active':''} onClick={()=>load(curr,size)}>{curr==='INR'?'₹ INR':'$ USD'}</button>)}</div><div className="tabs roi-presets" role="group" aria-label={c.preset}>{c.sizes.map((label,i)=><button key={i} aria-pressed={size===i} className={size===i?'active':''} onClick={()=>load(currency,i)}>{label}</button>)}</div></div>
    <div className="roi-panel card"><div className="roi-inputs"><div className="roi-header"><h3>{c.profile}</h3><button className="text-button" onClick={()=>load(currency,size)}><RefreshCw size={14}/>{c.reset}</button></div><p className="input-hint">{c.raw}</p>
      {sliders.map(s=><div className="roi-field" key={s.key}><div className="roi-field-label"><label htmlFor={`roi-${s.key}`}>{s.label}</label><div className="number-entry"><span aria-hidden="true">{s.money?(currency==='INR'?'₹':'$'):'%'}</span><EditableNumber id={`roi-${s.key}`} label={s.label} value={s.value} min={s.money?0:s.min} max={s.money?1e12:s.max} commit={s.set}/></div></div><div className="slider"><input aria-label={`${s.label} slider`} type="range" min={Math.min(s.min,s.value)} max={Math.max(s.max,s.value)} step={s.step} value={s.value} onChange={e=>s.set(+e.target.value)} style={{'--progress':`${Math.max(0,Math.min(100,(s.value-s.min)/(s.max-s.min)*100))}%`} as React.CSSProperties}/><span className="slider-limits"><span>{s.money?short(s.min):`${s.min}%`}</span><span>{s.money?short(s.max):`${s.max}%`}</span></span></div></div>)}
      <div className="reduction-fields">{[[c.reduction,inventoryReduction,setInventoryReduction,[10,15,20,25]],[c.stockReduction,stockReduction,setStockReduction,[20,25,30,35,40]]] .map(([label,value,set,options])=><label key={label as string}>{label as string}<select value={value as number} onChange={e=>(set as (n:number)=>void)(+e.target.value)}>{(options as number[]).map(n=><option key={n} value={n}>{n}%</option>)}</select></label>)}</div>
      <details className="formula assumptions"><summary>{c.assumptions}<Plus size={14}/></summary><div className="assumption-fields">{[[c.freight,freightSpend,setFreightSpend],[c.markdown,markdownSpend,setMarkdownSpend],[c.freightRate,freightRate,setFreightRate],[c.markdownRate,markdownRate,setMarkdownRate]].map(([label,value,set],i)=><label key={label as string}>{label as string}<EditableNumber label={label as string} value={value as number} min={0} max={i<2?1e12:100} commit={set as (n:number)=>void}/></label>)}</div></details>
    </div><div className={`roi-result ${updated?'result-updated':''}`}><span className="eyebrow">{c.impact}</span><h3 data-testid="roi-total">{format(total)}</h3><span className="roi-sub">{c.sub}</span><div className="savings-rows">{values.map((n,i)=><div className="saving-row" key={c.rows[i]}><div><span>{c.rows[i]}</span><strong>+{format(n)}</strong></div><motion.div className="saving-bar" initial={false} animate={{scaleX:total?n/total:0}} transition={{duration:reduced?0:.22,ease:'easeOut'}}/></div>)}</div><p className="fine-print">{c.note}</p><details className="formula"><summary>{c.formula}<Plus size={14}/></summary><p>{c.rows[0]} = {format(inventory)} × {holding}% × {inventoryReduction}%.</p><p>{c.rows[1]} = {format(revenue)} × {stockouts}% × {margin}% × {stockReduction}%.</p><p>{c.rows[2]} = {format(freightSpend)} × {freightRate}%.</p><p>{c.rows[3]} = {format(markdownSpend)} × {markdownRate}%.</p></details></div></div>
  </section>;
}
