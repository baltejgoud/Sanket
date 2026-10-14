from pathlib import Path
import shutil
out=Path('brag-output-2026-10-14-162835'); root=out/'composition'; assets=root/'assets'; scenes=root/'compositions'
assets.mkdir(exist_ok=True); scenes.mkdir(exist_ok=True)
for name in ['gsap.min.js','manrope.ttf','Manrope-OFL.txt','accent.ogg']:
    shutil.copyfile(Path('brag-output/composition/assets')/name,assets/name)
for name in ['forecast-baseline.png','forecast-spike.png']:
    shutil.copyfile(Path('qa/approved-design')/name,assets/name)
(out/'brag-plan.md').write_text('''# SANKET — The next order

Approved direction: one 20-second film after How it works. Preserve the website hero. Tone: polished; quiet, clear product motion. No narration or music; two sparse existing CC0 Kenney accents. Local delivery only.

## Nine-question rubric
1. Product: an illustrative demand forecasting and inventory decision sandbox.
2. Strongest line: Know exactly what to do.
3. Visual hook: Your best-seller sold out. Again. The problem picker provides this exact copy.
4. Actual UI: current baseline and viral-spike forecast panels captured from the local product, not the old film.
5. Shortest satisfying length: 20 seconds.
6. Tone: polished, warm ivory and cobalt, deliberate holds.
7. Mandatory brand/copy: SANKET; See what's coming; Know exactly what to do; 1,240 units; Try it yourself.
8. CTA: Try it yourself, adjacent native link goes to the working sandbox.
9. User flow: recognize demand risk → inspect signals → see forecast range → review order recommendation.

## Storyboard
- 0–3s: Hook. Your best-seller sold out. Again. Large left-aligned copy; thin stock indicator empties. Fully readable by 0.45s, held through 3s.
- 3–7s: Connect. Weather, Search trends, Festive calendar enter in sequence; SANKET consolidates them. From your data to your next order. Each signal label gets over 2s to read.
- 7–12s: Forecast. Current product UI fills the right side. Baseline panel transitions into the actual Viral spike state; caption See what's coming. No invented telemetry. Both states are labeled simulated.
- 12–17s: Decide. Review an illustrative baseline reorder of 1,240 units, two-week lead time, service target 95%. Know exactly what to do. Order waits for your approval; do not imply a real purchase.
- 17–20s: Outro. SANKET / Try it yourself. The actual baseline forecast remains visible as a small product context. CTA holds over 2 seconds.

All scenes carry Example scenario / Product sandbox. All copy and amounts are grounded in App.tsx and i18n.ts. Sequential entrances use natural reading cadence, not beat sync. Audio is optional UI accents at 7.4 and 12.4 seconds; no voice, no music.
''',encoding='utf-8')
(out/'composition-brief.md').write_text('''# Brag / HyperFrames composition brief
20s, 1280×720, 30fps, five independently editable scene sub-compositions. Output brag.mp4 and settled poster brag.jpg. Source App.tsx, i18n.ts, refinements.css and qa/approved-design/forecast-*.png. Local Manrope. Palette ivory #FAF9F6, ink #0F172A, cobalt #2563EB, green #047857. Show the actual current forecast UI. No new statistics, savings promises or claims of live data. No changes to hero assets. Match brag-plan.md. Deterministic GSAP timelines with readable holds, directional wipes and staggered labels. Existing source UI is more appropriate than a generic registry chart (registry searched). Silent except two sparse CC0 UI accents. No narration; retain web captions summarizing visible beats. Render authorized by user approval of the motion plan.
''',encoding='utf-8')
(out/'share-copy.txt').write_text('SANKET turns a demand forecast into an order you can review. See the signals, explore the range, and try the inventory planning sandbox.',encoding='utf-8')
style='''@font-face{font-family:Manrope;src:url('assets/manrope.ttf') format('truetype');font-weight:200 800}*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;font-family:Manrope,sans-serif;background:#faf9f6;color:#0f172a}.clip{position:absolute;inset:0;overflow:hidden}.scene{position:absolute;inset:0;background:#faf9f6;padding:74px 96px}.brand{font-size:22px;font-weight:800;letter-spacing:4px;display:flex;justify-content:space-between;align-items:center}.brand small{font-size:15px;letter-spacing:1.4px;font-weight:600;color:#475569}.tag{color:#1d4ed8;font-size:17px;font-weight:700;letter-spacing:2px;text-transform:uppercase}h1,h2,h3,p{margin:0}h1{font-size:82px;line-height:1.16;letter-spacing:-4px;font-weight:650;max-width:1050px}h2{font-size:60px;line-height:1.18;letter-spacing:-2.5px;font-weight:650}h3{font-size:26px}.blue{color:#2563eb}.foot{position:absolute;bottom:49px;left:96px;right:96px;display:flex;justify-content:space-between;color:#475569;font-size:15px}.stage{position:relative;margin-top:62px}.rule{height:3px;background:#2563eb;transform-origin:left}.stock-line{display:flex;gap:16px;margin-top:46px}.stock-line span{width:80px;height:13px;border-radius:4px;background:#2563eb}.hook-note{font-size:26px;color:#475569;margin-top:30px}.signal-layout{display:grid;grid-template-columns:1fr 1fr;gap:65px;margin-top:50px;align-items:center}.signals{display:flex;flex-direction:column;gap:18px}.signal{padding:20px 24px;border:2px solid #c3d1e6;border-radius:11px;background:white;font-size:25px;display:flex;justify-content:space-between;align-items:center}.signal span{color:#2563eb}.signal-hub{margin-top:25px;background:#2563eb;color:#fff;border-radius:11px;padding:23px 28px;font-size:27px;font-weight:700;letter-spacing:3px}.forecast-layout{display:grid;grid-template-columns:360px 1fr;gap:38px;align-items:center;margin-top:36px}.forecast-frame{position:relative;height:450px;border-radius:13px;overflow:hidden;border:2px solid #c1cee2;background:#fff;box-shadow:0 24px 48px #0f172a15}.forecast-frame img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}.lead{font-size:23px;color:#475569;line-height:1.55;margin-top:23px}.scenario-chip{display:inline-flex;background:#e6eeff;border:1px solid #bdcff8;border-radius:8px;padding:11px 17px;font-size:19px;color:#1d4ed8;margin-top:25px}.decision-layout{display:grid;grid-template-columns:1fr 1fr;gap:65px;align-items:center;margin-top:65px}.order{background:#eff4ff;border:2px solid #aac3f0;padding:36px 36px 32px;border-radius:16px}.order .order-number{font-size:94px;letter-spacing:-5px;color:#2563eb;line-height:1.2;font-weight:650;margin:12px 0}.order p{font-size:23px;color:#334155}.order-line{margin-top:26px;border-top:1px solid #bdcce4;padding-top:20px;font-size:20px;color:#475569;line-height:1.6}.approval{margin-top:25px;color:#047857;font-size:20px}.outro-grid{display:grid;grid-template-columns:1.3fr 1fr;gap:65px;align-items:center;margin-top:55px}.outro-grid img{width:100%;border:2px solid #cbd7e9;border-radius:11px}.outro-title{font-size:100px;letter-spacing:8px;font-weight:750}.outro-cta{display:inline-flex;align-items:center;gap:28px;background:#2563eb;color:white;border-radius:12px;padding:23px 30px;font-size:30px;margin-top:30px}.outro-note{font-size:22px;line-height:1.5;color:#475569;margin-top:22px}'''
(root/'film.css').write_text(style,encoding='utf-8')
brand='<div class="brand">SANKET <small>PRODUCT SANDBOX</small></div>'
foot=lambda n:f'<div class="foot"><span>EXAMPLE SCENARIO · ILLUSTRATIVE DATA</span><span>0{n} / 05</span></div>'
contents=[
('hook',3,brand+'<div class="stage"><div class="tag">SOUND FAMILIAR?</div><h1 style="margin-top:24px">Your best-seller sold out.<span class="blue" style="display:block">Again.</span></h1><div class="stock-line">'+''.join('<span></span>' for _ in range(8))+'</div><p class="hook-note">Catch stockouts before your customers do.</p></div>'+foot(1),'''tl.fromTo('#hook h1',{y:36,opacity:0},{y:0,opacity:1,duration:.45,ease:'power3.out'},0);tl.fromTo('#hook .stock-line span',{scaleX:1},{scaleX:.08,stagger:.09,duration:.55,transformOrigin:'left',ease:'power2.inOut'},.65);tl.fromTo('#hook .hook-note',{opacity:0},{opacity:1,duration:.35},.7);'''),
('signals',4,brand+'<div class="signal-layout"><div><div class="tag">CONNECT WHAT YOU ALREADY USE</div><h2 style="margin-top:24px">From your data to your <span class="blue">next order.</span></h2></div><div><div class="signals"><div class="signal">Weather<span>01</span></div><div class="signal">Search trends<span>02</span></div><div class="signal">Festive calendar<span>03</span></div></div><div class="signal-hub">SANKET</div></div></div>'+foot(2),'''tl.fromTo('#signals h2',{x:-28,opacity:0},{x:0,opacity:1,duration:.5,ease:'power3.out'},.05);tl.fromTo('#signals .signal',{x:50,opacity:0},{x:0,opacity:1,duration:.45,stagger:.25,ease:'power3.out'},.3);tl.fromTo('#signals .signal-hub',{y:20,opacity:0},{y:0,opacity:1,duration:.5,ease:'power2.out'},1.25);'''),
('forecast',5,brand+'<div class="forecast-layout"><div><div class="tag">DEMAND INTELLIGENCE</div><h2 style="margin-top:24px">See what\'s <span class="blue">coming.</span></h2><p class="lead">A forecast for every product, every week.</p><div class="scenario-chip">Baseline → Viral spike</div></div><div class="forecast-frame"><img src="assets/forecast-baseline.png" alt="Actual baseline sandbox forecast"><img class="spike" src="assets/forecast-spike.png" alt="Actual viral-spike sandbox forecast"></div></div>'+foot(3),'''tl.fromTo('#forecast .forecast-frame',{x:60,opacity:0,scale:.97},{x:0,opacity:1,scale:1,duration:.55,ease:'power3.out'},0);tl.fromTo('#forecast h2',{y:25,opacity:0},{y:0,opacity:1,duration:.45,ease:'power2.out'},.15);tl.fromTo('#forecast .spike',{opacity:0},{opacity:1,duration:.35,ease:'power2.out'},1.65);tl.fromTo('#forecast .scenario-chip',{y:12,opacity:0},{y:0,opacity:1,duration:.35},1.5);'''),
('decision',5,brand+'<div class="decision-layout"><div><div class="tag">FROM INSIGHT TO ACTION</div><h2 style="margin-top:24px">Know exactly <span class="blue">what to do.</span></h2><p class="lead">Order quantities, stock transfers and markdown timing, ready for your approval.</p></div><div class="order"><div class="tag">BASELINE / NEXT BEST ACTION</div><div class="order-number">1,240</div><p>units to reorder</p><div class="order-line">Service target 95%<span style="display:block">Lead time 14 days</span></div><div class="approval">Ready for your approval</div></div></div>'+foot(4),'''tl.fromTo('#decision .order',{y:40,scale:.95,opacity:0},{y:0,scale:1,opacity:1,duration:.6,ease:'power3.out'},.05);tl.fromTo('#decision h2',{x:-25,opacity:0},{x:0,opacity:1,duration:.45,ease:'power2.out'},.15);tl.fromTo('#decision .order-number',{y:20,opacity:0},{y:0,opacity:1,duration:.5,ease:'power3.out'},.45);tl.fromTo('#decision .approval',{opacity:0,y:10},{opacity:1,y:0,duration:.4},1.1);'''),
('outro',3,brand+'<div class="outro-grid"><div><div class="outro-title">SANKET</div><div class="outro-cta">Try it yourself <span>→</span></div><p class="outro-note">Stock what sells.<span style="display:block">Skip what doesn\'t.</span></p></div><img src="assets/forecast-baseline.png" alt="Sanket product sandbox"></div>'+foot(5),'''tl.fromTo('#outro .outro-title',{y:20,opacity:0},{y:0,opacity:1,duration:.4,ease:'power3.out'},0);tl.fromTo('#outro .outro-cta',{x:-20,opacity:0},{x:0,opacity:1,duration:.4,ease:'power2.out'},.25);tl.fromTo('#outro img',{scale:.94,opacity:0},{scale:1,opacity:1,duration:.5,ease:'power2.out'},.15);''')]
hosts=[]; time=0
for name,duration,body,animation in contents:
    scenes.joinpath(name+'.html').write_text(f'''<!doctype html><html><body><template><style>#{name}{{position:absolute;inset:0;width:1280px;height:720px}}</style><div id="{name}" class="scene" data-composition-id="order-{name}" data-width="1280" data-height="720">{body}</div><script>{{const tl=gsap.timeline({{paused:true}});{animation}window.__timelines=window.__timelines||{{}};window.__timelines['order-{name}']=tl;}}</script></template></body></html>''',encoding='utf-8')
    hosts.append(f'<div id="host-{name}" class="clip" data-composition-id="order-{name}" data-composition-src="compositions/{name}.html" data-start="{time}" data-duration="{duration}" data-width="1280" data-height="720" data-track-index="0" data-track-kind="graphics"></div>')
    time+=duration
(root/'index.html').write_text('''<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=1280,height=720"><title>SANKET / The next order</title><link rel="stylesheet" href="film.css"><script src="assets/gsap.min.js"></script></head><body><div id="order-film" data-composition-id="order-film" data-width="1280" data-height="720" data-duration="20">'''+''.join(hosts)+'''<audio id="forecast-accent" src="assets/accent.ogg" data-start="7.4" data-duration="0.18" data-track-index="1" data-volume="0.15"></audio><audio id="order-accent" src="assets/accent.ogg" data-start="12.4" data-duration="0.18" data-track-index="1" data-volume="0.15"></audio></div><script>window.__timelines=window.__timelines||{};window.__timelines['order-film']=gsap.timeline({paused:true});</script></body></html>''',encoding='utf-8')
Path('public/assets/order-film.vtt').write_text('''WEBVTT

00:00.000 --> 00:03.000
Your best-seller sold out. Again.

00:03.000 --> 00:07.000
Weather, search trends and festive signals inform demand planning.

00:07.000 --> 00:12.000
Explore the baseline and viral-spike forecasts in the product sandbox.

00:12.000 --> 00:17.000
Example baseline recommendation: reorder 1,240 units, ready for your approval.

00:17.000 --> 00:20.000
SANKET. Try it yourself.
''',encoding='utf-8')
print(root)
