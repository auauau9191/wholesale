# Site rebuild: progress

Brief: award-level, fast, accessible public site that converts visitors into members. Process: audit → concepts → plan → build in stages → independent review and handover.

## Done
- **Step 1, audit and research (20 Nov 2026).**
  - Baseline is in `docs/rebuild/baseline/`.
  - Research with sources is in `docs/rebuild/research.md`.
  - The ranked findings are in the audit doc (Claude Doc "Wholesale System: site audit").

- **Gate 1 passed (20 Nov 2026).** Owner confirmed the priorities. Their answers are recorded in decisions.md: brand Lotwise (website and app), Stripe, Cloudflare Web Analytics, placeholders, draft legal pages.

## Next
- **Step 2:** three concept directions (home + one inner page, phone and desktop), made as Design artifacts. Then gate 2: owner chooses or combines.
- Owner to run PageSpeed Insights on the live URL.

## Notes
- Baselines were measured on a production build served locally with the real data. This sandbox can't reach `*.workers.dev`, PageSpeed or the security-header checkers.
- Field data (CrUX) needs the owner to run PageSpeed Insights on the live URL.
