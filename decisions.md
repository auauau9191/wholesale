# Decisions

Each entry: the date, the decision, and why.

- **2026-11-20. Measure the baseline locally.** We measure a local production build with the real Supabase import, not the live site. The sandbox's network allowlist blocks the live URL and the third-party testers. It's the same code and data, but lab numbers miss CDN compression and field data, so we'll re-check against PageSpeed field data once the owner runs it.
- **2026-11-20. Keep the rebuild on a separate branch (`site-rebuild`) until each stage is approved.** Merging to `main` deploys to Cloudflare straight away.
- **2026-11-20. Footage stays labelled "Illustrative".** Stock or AI imagery must never be presented as our suppliers, hubs or staff. Trust is the product, so this is a rule, not a style.
- **2026-11-20. Priorities confirmed by owner.** Order: (1) hidden content and small errors, (2) trust and proof, (3) joining flow and analytics, (4) search and AI visibility, (5) security headers, (6) speed. The new visual system runs alongside all of them.
- **2026-11-20. Brand name "Lotwise", chosen by the owner.** The owner turned down Shelfproof because it doesn't say wholesale, and wanted something short. "Lot" is the wholesale unit you buy; "wise" is buying it after you've seen and held the sample. Target domain: `lotwise.com.au` (needs an ABN, still a placeholder), with `lotwise.com` as the fallback. Registry availability couldn't be checked from the sandbox. Risk: a Shopify app called Lotwise (lot and expiry tracking, by Blue Crate) exists. It's a different service, but the owner should run an IP Australia trademark search before buying the domain. "Wholesale System" stays as the working legal name until then.
- **2026-11-20. Scope: one system for the website and the member app.** Concepts and DESIGN.md cover the public site and the signed-in app (catalogue, product, samples, orders, console).
- **2026-11-20. Payments: Stripe.** Build for Stripe Checkout and Billing (A$60 for the first 3 months, then A$45 a month or A$450 a year), behind a switch that stays off until the owner connects a Stripe account. Manual activation stays as the fallback.
- **2026-11-20. Analytics: Cloudflare Web Analytics.** It's free and cookieless, so no consent banner is needed. Conversion events will go through a tiny first-party endpoint, because Cloudflare Web Analytics doesn't record custom events.
- **2026-11-20. Real-world proof stays as labelled placeholders.** This covers the ABN, address, contact details, photos, factory footage, inspection partner and reviews, until the owner supplies them.
- **2026-11-20. Privacy policy and terms: Claude drafts a starting point.** Each page is clearly marked as a draft for review by a qualified person before launch.
