# Site rebuild: progress

Brief: award-level, fast, accessible public site that converts visitors into members. Process: audit → concepts → plan → build in stages → independent review and handover.

## Done
- **Step 1, audit and research (20 Nov 2026).**
  - Baseline is in `docs/rebuild/baseline/`.
  - Research with sources is in `docs/rebuild/research.md`.
  - The ranked findings are in the audit doc (Claude Doc "Wholesale System: site audit").

- **Gate 1 passed (20 Nov 2026).** Owner confirmed the priorities. Their answers are recorded in decisions.md: brand Lotwise (website and app), Stripe, Cloudflare Web Analytics, placeholders, draft legal pages.

- **Step 2, three concepts (20 Nov 2026).** A Carton, B Field film and C Racking, each with a website home and an app product page, on phone and desktop. They're in the Design artifact "Lotwise: three concepts", with a copy in `docs/rebuild/concepts/`. All the data shown is the demo set (product CF-CN208-0385; landed costs computed with `landedLines`), and every photo and film area is a labelled placeholder.

## Next
- **Gate 2:** owner chooses one direction or combines them. Then step 3: the plan.
- Owner to run PageSpeed Insights on the live URL.

## Notes
- Baselines were measured on a production build served locally with the real data. This sandbox can't reach `*.workers.dev`, PageSpeed or the security-header checkers.
- Field data (CrUX) needs the owner to run PageSpeed Insights on the live URL.
