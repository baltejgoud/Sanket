# Sanket design review — 14 October 2026

Scope: desktop homepage, explanation, and ROI entry. Reviewed local website at localhost:5173; no website code changed.

1. Hero (01-hero.png): Strong headline, balanced two-column layout, consistent blue accent. Improve secondary CTA discovery by linking to interactive demo. Simplify competing header language/contact controls. The hero illustration says LIVE FORECAST despite being a prerecorded conceptual animation; label it as an example.
2. How it works (02-how.png): Clear three-step explanation and consistent cards. Move explanation and interactive product experience earlier, ahead of the six long external inventory stories visible in the page structure. Reduce repeated rounded card treatments and excessive copy. Increase secondary text contrast; measured contrast and keyboard testing remain outstanding.
3. ROI (03-roi.png): Clear input/output grouping. Add INR/USD choice, smaller business presets, and editable numeric inputs alongside sliders. Current $100M default and $10M revenue floor suit larger enterprises. Present estimated output with sensible rounding and avoid count-up precision. Floating chat competes with calculator content at lower right.

Cross-page opportunities: shorten early case-story content; distinguish public industry cautionary tales from actual customer evidence; move implementation terms such as SLSQP, pinball loss, and schema details into expandable technical details. Preserve plain-language buyer copy.

Proposed order: Hero > compact problem picker > How it works > interactive demo > industries > integrations/evidence > ROI > security > contact. Keep public industry stories as an optional expandable section.

Limits: desktop visual and DOM review only. No mobile, screen-reader, measured contrast, performance, complete interaction, claim verification, or contact submission testing. Screenshots cannot establish accessibility compliance. Recommendations are design judgments, not measured conversion results.
