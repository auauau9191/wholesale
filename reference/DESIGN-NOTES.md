# Wholesale System — taste-skill working notes

## Step 1 · Brief
Subject: members-only platform for Australian businesses buying from Chinese factories our team has visited and filmed; every product has a physical sample in our Australian warehouse; bulk orders are locked to the approved sample.
Audience: Australian small businesses with an ABN (e-commerce sellers, retailers, cafés, trades, first-time importers).
One thing the page must get someone to do: join (A$60 starter quarter, includes the first sample free).
Stack: static HTML/CSS/JS now (reference for Base44, which builds React + Tailwind).
Brand: working name only; no logo, no fixed palette. App prototype so far: green #1E6B4F on warm off-white, Instrument Sans.
Imagery that truly exists: none of the project's own (no factory visits yet). Open collections may hold real pictures of the world: Chinese factory floors, Shenzhen/Yantian port, container ships, Port Botany Sydney, Yiwu market, cartons.

## Inventory (things only this client has)
1. The sample tag: PC-CN014-0087-S07 — category, supplier, product, unit. Printed with a QR and "SAMPLE – NOT FOR RESALE".
2. The dated board our filmer holds on camera at each factory: "CN014 · 14 Mar 2026".
3. The sealed reference sample — signed and sealed by both sides; one stays at the factory, one sits on our Master shelf in Australia.
4. The route: factory floor in Shenzhen → Yantian port → ~7,400 km by sea → Port Botany → our shelf → the buyer's door.
5. Numbers: 100 categories × 20 suppliers = 2,000; 10 categories live at launch; 5 sample units per product; out within 2 business days; 14 days to decide; A$60 for the first 3 months then A$45/month; 30% deposit / 70% after inspection; AQL 2.5.
6. Constraints: one sample at a time; one free sample per ABN for life; the supplier is paid in full only after the goods pass inspection.
7. The verification score out of 100, five parts of 20.
8. Printed things of its world: packing list, proforma invoice, ChAFTA Certificate of Origin, inspection report, carton shipping marks.
9. The ritual: See it → Touch it → Then order it.
10. Materials: TPU and silicone, kraft boxes, cartons, moulds.

## Step 2 · Argument (claim → proof)
- Hero: You can hold the product before you buy 5,000 of it → a real sample tag; first sample free; join.
- See it: we film every factory ourselves → the dated board, the score, the checks, what we hide (contacts) and why.
- Touch it: samples are already in Australia → shelf, 2 business days, 14 days to decide, one at a time.
- Order it: the bulk order is locked to the sample you held → spec revision, sealed sample, 70% paid only after inspection.
- Landed cost: you see the real Australian cost per unit before you order → live calculator.
- What's on the shelves: 10 categories at launch → the list.
- Price: A$60 for 3 months, then A$45 → what it includes, the sample rules.
- Questions: the real objections → answers.
- Close.

## Step 3 · Direction
Dealt three (split-stage, colour-chapters, dense-tiles), seed 444286321. Chose split-stage: its fixed half can hold the one object this client has and no competitor has — a sample unit on an Australian shelf with its tag — while the reading column explains it. colour-chapters would make See/Touch/Order three posters any 3-step service could own; dense-tiles scatters the inventory.

## Step 4 · Idea
On this page, the sample tag on unit PC-CN014-0087-S07 becomes the fixed half of the screen: the one object that stays in view while the page walks through its factory, its shelf and the order locked to it.
Competitor test: Alibaba / Global Sources / a sourcing agent have no tagged unit sitting on an Australian shelf — the sentence breaks. Holds.
Live thing: the landed-cost sheet — choose 500 / 2,000 / 5,000 units of PC-CN014-0087 and read the real Australian cost per unit, the order total and the 30% deposit. Static fallback shows 5,000.

## Imagery
No network to open collections (proxy denies api.openverse.org, commons.wikimedia.org, artic, met, picsum) and no project photography yet. Pictures are the product's own interface fragments (data-ui), built at true size. Expect WARN no-real-pictures; defended: no photographs of this subject exist yet and the collections were unreachable; slots for the team's own factory footage noted in the report.
Font: Switzer self-hosted from npm (@carrot-kpi/switzer-font, Fontshare FFL) because api.fontshare.com is blocked here.
