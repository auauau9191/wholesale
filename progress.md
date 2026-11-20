# Site rebuild: progress

Brief: award-level, fast, accessible public site that converts visitors into members. Process: audit → concepts → plan → build in stages → independent review and handover.

## Done
- **Step 1, audit and research (20 Nov 2026).**
  - Baseline is in `docs/rebuild/baseline/`.
  - Research with sources is in `docs/rebuild/research.md`.
  - The ranked findings are in the audit doc (Claude Doc "Wholesale System: site audit").

- **Gate 1 passed (20 Nov 2026).** Owner confirmed the priorities. Their answers are recorded in decisions.md: brand Lotwise (website and app), Stripe, Cloudflare Web Analytics, placeholders, draft legal pages.

- **Step 2, three concepts (20 Nov 2026).** A Carton, B Field film and C Racking, each with a website home and an app product page, on phone and desktop. They're in the Design artifact "Lotwise: three concepts", with a copy in `docs/rebuild/concepts/`. All the data shown is the demo set (product CF-CN208-0385; landed costs computed with `landedLines`), and every photo and film area is a labelled placeholder.

- **Round 1 rejected; Round 2 made (20 Nov 2026).** Seam, Docket and Container, each prototyped in HTML (`docs/rebuild/concepts-r2/`), checked at 1440 and 390, then ported to the Design artifact (page "Round 2").

- **Gate 2 passed (20 Nov 2026).** Owner chose Docket, with no pink. The motion prototype is in `docs/rebuild/docket-prototype/`. Draft PR #11 opened.
- **Step 3, plan drafted (20 Nov 2026).** It's in the Claude Doc "Lotwise: rebuild plan": sitemap, content model, editing workflow, architecture, hosting, security, analytics and payments, 190 hours over 8 phases, risks, decisions.

- **Gate 3 passed (20 Nov 2026),** with the defaults in decisions.md.
- **Phase 0, foundations (20 Nov 2026):**
  - `DESIGN.md`, referenced from CLAUDE.md and AGENTS.md;
  - tokens and components in `src/styles/docket.css` and `src/components/docket/`;
  - motion helpers and Lottie marks in `src/lib/motion/`;
  - a self-hosted font;
  - `/design` as the working reference;
  - the QA script `scripts/qa/check.mjs` and unit tests;
  - the GitHub Actions workflow `.github/workflows/quality.yml` with `lighthouserc.json`.
  - `/design` passes at 7 widths, with no axe violations, no overflow, and complete at rest.

## Next
- **Phase 1, home:**
  - rebuild `/` in Docket, with live settings and products;
  - add the 3D sample;
  - remove the Fontshare stylesheet and framer-motion from public pages;
  - add view transitions.
- Owner to run PageSpeed Insights on the live URL.

## Notes
- Baselines were measured on a production build served locally with the real data. This sandbox can't reach `*.workers.dev`, PageSpeed or the security-header checkers.
- Field data (CrUX) needs the owner to run PageSpeed Insights on the live URL.
