# Wholesale System — rules for coding agents

This repository is the Wholesale System app (China → Australia verified wholesale and sample platform).
Read this file before changing any screen. It applies to Claude Code, Codex, Cursor and any other agent. The app was first built on Base44 and now runs on Supabase + Cloudflare Workers (see README.md).

## Design skill

The design follows **tasteskill v2** (github.com/Leonxlnx/taste-skill). Install it in your agent before UI work:

```
npx skills add Leonxlnx/taste-skill --all -g -y
```

- Public pages (landing, pricing, any marketing page) follow the skill's **page run** and house rules.
- Screens people work in (member app, team console) follow its **app-screen rules** (`references/app-screens.md`), style **framed-sheet**, kept palette and type.
- Gate every UI change with the skill's checks and fix every FAIL:
  `node <skill>/scripts/lint.mjs <files>` (add `--app` for app screens) and
  `node <skill>/scripts/inspect.mjs [--app] <url>` at 1440, 768 and 390 px.

## Tokens

One typeface for everything: **Switzer** 400 and 500 (self-hosted woff2 in `/public/fonts`). No second face, no monospace.

Public site (bone and olive, one ink):

| Token | Value | Use |
| --- | --- | --- |
| --bg | #ecebe7 | page ground |
| --surface | #e1dfd9 | stage, bars, filled rows |
| --paper | #f5f5f3 | sample tags, document sheets |
| --ink / --accent | #38450f | every word, the action, the footer field |
| --muted | #545f30 | secondary notes only |

App (framed sheet):

| Token | Value | Use |
| --- | --- | --- |
| --ground | #eef0ea | the L-frame: sidebar + 48px top bar, no rule between them |
| --surface | #ffffff | the sheet (inset 8px right/bottom, radius 16, 1px #e6e8e0) and cards |
| --border / --rule / --control | #e3e6dd / #edefe9 / #c9cdc0 | card edges / row rules / control borders |
| --text / --primary | #23290f | text, the one filled button |
| --muted / --faint | #555b43 / #62674f | secondary text / meta (both ≥ 4.5:1) |
| --accent | #55721a | the main data element and the selected state only (under 3% of pixels) |
| --negative | #b42318 | only on what is late or failing |
| pills | #e8efd8/#2c3a0b · #fbefdc/#6b3a06 · #edefe9/#3d4128 | positive · warning · neutral |

Radii: app cards 8, controls 6, sheet 16; public site square. Spacing on a 4px base, one gutter per grid.

## Never

- Eyebrow labels, uppercase tracked labels, 01/02/03 numbering, monospace text.
- Gradients, glows, glass, shadows on resting elements (app: a border or a shadow, never both).
- A dark sidebar on a light screen; icons in tinted squares; sparklines on KPIs; zebra tables; uppercase table headers.
- Emoji, lorem ipsum, Acme/John Doe, vanity numbers, totals typed instead of summed from rows.
- A black square with a letter as the logo: the mark is the sample tag (rounded rectangle, punched hole, two lines).

## Always

- One h1 per screen. Public headlines two lines or fewer at 1440, 768 and 390 px.
- App screens answer one question first; the finding sits under the title beside its action.
- Numbers right-aligned in tabular figures; money A$ with 2 decimals per unit, 0 for totals; a sign on every change.
- Every list has empty, loading (flat grey bars at real size) and error states inside its block.
- Phone: the sidebar folds to a 48px top bar; tables become two-line rows; touch targets 44px.
- Business rules (credits, eligibility, prices, statuses) run in backend functions, never in the browser.
- All data access goes through `src/services/`; pages never call the data layer directly. Access rules live in `base44/entities/*.jsonc` (`rls`) and are enforced by `src/lib/backend/`; regenerate `supabase/schema.sql` with `node scripts/gen-backend-schema.mjs` after changing an entity.

## Business model (1 Nov 2026)

- **Two sides pay.**
  - **Members** pay the plan: A$60 for the first 3 months, then A$45/month, or A$450/year.
  - **Suppliers** pay a commission of `AppSettings.supplier_commission_rate`, 5% of goods value. It is withheld from the balance payout and never added to the member's bill.
  - **Suppliers** also pay an annual listing fee (`supplier_listing_fee_usd`). It can be waived per supplier.
- **Members pay no fee on orders.** `buyer_service_fee_rate` stays at 0, and they pay inspection, freight, duty and GST at cost.
- **Show the commission to members** on pricing and in the FAQ. Supplier price tiers are one signed list for all members.
- **Payout split for each order:**
  - deposit payout = 30% of goods;
  - balance payout = 70% of goods − commission.
  - Both are recorded in `SupplierPayout`. The money moves outside the app through the payout provider, and staff mark it sent.

## Hubs

- **Two QC and sample hubs:**
  - `BNE` Brisbane, run by Yusuf;
  - `SYD` Sydney, run by the partner.
- **Every SampleUnit has a `hub_code`.** Units arrive by `Container` with status `in_transit`, wait in `qc_hold` while checked against the master, then become `in_stock`.
- **Sample routing** runs in a backend function and never in the browser:
  - QLD and NT go to BNE;
  - NSW and ACT go to SYD;
  - VIC, TAS, SA and WA go to SYD first, then BNE;
  - if the first hub is out of stock, use the other hub.
- **Staff scope:** `User.hub_code` is BNE, SYD or ALL. Hub staff see their own hub by default. The console has a hub switcher: All, Brisbane, Sydney.

## Motion and footage

- **Library:** framer-motion. The whole layer is the following, and nothing else moves:
  - page change: fade plus 8px rise, 200 ms;
  - section reveal: rise 16–24px, stagger 80 ms, once;
  - the stage crossfade: 1.6 s;
  - the route clip crossfade: 0.9 s;
  - numbers that count to their new value: 400 ms, tabular figures;
  - shelf-strip unit state changes and list filtering: layout animation, 150–200 ms;
  - button press: scale 0.97.
- **Not allowed:** parallax on text, scroll-jacking, smooth-scroll libraries, shimmer loaders, bouncing, autoplay with sound.
- **Reduced motion:** `useReducedMotion()` turns every movement into an instant change and every video into its poster.
- **Footage files:** in `public/media/video` (muted H.264 loops, each under 3.5 MB) with posters in `public/media/posters`. See `public/media/MEDIA.md` for placements and alt text.
- **Playback rules:**
  - `autoplay muted loop playsInline`, with a poster;
  - mount near the viewport;
  - pause off-screen and when the tab is hidden;
  - at most 2 playing at once;
  - posters only on Save-Data.
- **Honesty:** the footage is illustrative stock. Never caption it as a named supplier or as our hubs, and show "Illustrative footage" beside it. Supplier film cards use the supplier's own verification film (YouTube/Vimeo/Bunny URL).
- **AI-generated media:** do not use AI-generated video or images of factories, hubs, people or products. Abstract brand motion is built in code (SVG plus framer-motion).

## Signature elements

- **The sample tag**: `PC-CN014-0087-S07` = category · supplier · product · unit. Printed "Sample – not for resale".
- **The shelf strip**: every unit of a product as a mark: master (ink), free to send (olive outline), being packed (olive), with a member (grey), retired (dashed).
- **The landed-cost sheet**: per-unit Australian cost summed from parts as shown (product, freight, duty, broker, GST).
- **The route**: Factory floor, China → Verified on our own film → Containers to Australia → Two hubs: Brisbane and Sydney → Your door. On desktop it is a sticky footage frame beside the stops. On a phone, each stop carries its own clip.

Reference build: `reference/site/index.html` (landing page) and `reference/app/console.html`, `reference/app/product.html` (app screens), all passing the skill's inspector with 0 FAIL.
