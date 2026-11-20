# Decisions

Each entry: the date, the decision, and why.

- **2026-11-20. Measure the baseline locally.** We measure a local production build with the real Supabase import, not the live site. The sandbox's network allowlist blocks the live URL and the third-party testers. It's the same code and data, but lab numbers miss CDN compression and field data, so we'll re-check against PageSpeed field data once the owner runs it.
- **2026-11-20. Keep the rebuild on a separate branch (`site-rebuild`) until each stage is approved.** Merging to `main` deploys to Cloudflare straight away.
- **2026-11-20. Footage stays labelled "Illustrative".** Stock or AI imagery must never be presented as our suppliers, hubs or staff. Trust is the product, so this is a rule, not a style.
