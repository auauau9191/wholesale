# Research notes for the site rebuild (20 Nov 2026)

Research was done in three parallel streams with WebSearch/WebFetch. Some sites blocked automated reads (Alibaba, Faire, Global Sources, Pietra, Sourcify, most Awwwards pages), so anything not confirmed from a primary source is marked *unverified*.

## 1. Sector and award sites

### What the sector does to earn trust

| Site | What works | Source |
|---|---|---|
| Alibaba Verified Supplier and Trade Assurance | Named third-party checkers (SGS, Intertek, TÜV) and a *named* guarantee with refunds up front. Trust is sold as a product feature. | [GeekSeller](https://www.geekseller.com/?p=1626), [Guided Imports](https://guidedimports.com/blog/alibaba-trade-assurance-overview/) |
| Global Sources | Third-party virtual factory tours, each one time-stamped and location-tagged, with the floor split into zones (production, QC, storage). This is the closest analogue to our filmed visits. | [Global Sources](https://www.globalsources.com/knowledge/virtual-factory-tours-on-globalsources-com/) |
| Made-in-China | An "Audited Supplier" filter. Audits come from named firms and the reports are free to read. | [MIC](https://insights.made-in-china.com/Audited-Suppliers-on-Made-in-China-com_uaRGErPcWxHD.html) |
| Faire | Checks the business *after* the first order. Payment terms and free returns lead the offer. | [Faire FAQ](https://www.faire.com/faq/retailers) |
| Ankorstore | An independent teardown scored the homepage 51/100: it buries its strongest offer, has numbers with no context, and asks for documents before browsing. | [Landing Doctor](https://landingdoctors.com/de/teardowns/ankorstore-com) |
| Maker's Row | Public prices with a monthly/annual toggle, a 4-step process, a hero video, and separate calls to action for buyers and factories. | [makersrow.com](https://makersrow.com/) |
| Epic Sourcing (Sydney) | Public prices, Google reviews, a local address, and a warning about scammers using its name. | [epicsourcing.com.au](https://www.epicsourcing.com.au/china-sourcing-agent-australia) |
| ChinaDirect Sourcing (Brisbane) | Dated, location-tagged factory-vetting videos, and a stated "documents → samples → inspection" sequence. Its headline numbers have no source. | [chinadirectsourcing.com.au](https://www.chinadirectsourcing.com.au/) |
| Spotyard | Shows its ABN and ASIC registration. It is also a warning: its own numbers contradict each other. | [spotyard.com.au](https://spotyard.com.au/) |

### Relevant award winners, 2025–26

| Site | Award (as reported) | What to borrow |
|---|---|---|
| Terminal Industries | Awwwards Site of the Month, Sep 2025 | Aerial imagery carries the logistics story; modular sections; restrained type. ([Awwwards/Rejouice](https://www.awwwards.com/rejouice/)) |
| Madar (logistics marketplace) | SOTD, CSSDA WOTD, FWA | One continuous "road" carries an order through every scene. Heavy; effects scale down on weak devices. ([Vide Infra](https://videinfra.com/work/madar)) |
| Seasats | SOTD, 8 Sep 2026 | The same spec block for every product, in the same order. |
| Breakthrough Energy | SOTD, 15 Jan 2026 | A large number paired with a comparison. |
| Cerebrium | SOTD, 10 Sep 2026 | A comparison against named alternatives, with units shown. |
| Fauna Robotics | SOTD, 16 Jun 2026 | Raw, unposed photos, which read as honest. |

The Seasats, Breakthrough Energy, Cerebrium and Fauna Robotics dates come from [Junca Studio's roundup](https://juncastudio.com/news/the-12-best-deeptech-websites-in-2026) and were not checked against Awwwards.

### Conversion evidence

- **Scanning.** Pages must earn the next 30 seconds within the first 10. People read in an F-pattern, so put the answer first ([NN/g](https://nngroup.com/articles/how-long-do-users-stay-on-web-pages/), [NN/g](https://www.nngroup.com/articles/F-shaped-pattern-reading-web-content/)).
- **Price.** Business buyers want to see the price. Hiding it reads as evasive ([NN/g](https://www.nngroup.com/articles/show-price/)).
- **Trust.** Design quality, upfront disclosure, showing the process, and links to outside proof all build trust ([NN/g](https://nngroup.com/articles/trustworthy-design/)).
- **Forced sign-up.** 24% of shoppers abandon when forced to create an account, and 48% leave over unexpected extra costs ([Baymard](https://baymard.com/learn/ux-statistics)).
- **Touch.** Touching a product raises the feeling of owning it, and imagined touch online works too ([Peck & Shu, 2009](https://www.eurekalert.org/news-releases/505886)). This directly supports "See it. Touch it."

## 2. Web platform, as of Nov 2026

Status comes from the Baseline data in the [Web Features Explorer](https://web-platform-dx.github.io/web-features-explorer/features).

**Safe to use now, in all major browsers**
- Same-document view transitions (Newly available, Oct 2025). TanStack Router supports them through `defaultViewTransition`, and `types` sets the transition style per navigation ([docs](https://tanstack.com/router/v1/docs/api/router/RouterOptionsType.md)).
- Scroll-driven animations (Newly available, 27 Oct 2026, with Firefox 159). Wrap them in `@supports` and `prefers-reduced-motion`, and keep content visible by default ([Chrome guide](https://developer.chrome.com/docs/modern-web-guidance/guides/ui-behaviors/scroll-entry-exit-effects)).
- Container queries (size and style), `:has()`, `@scope`, CSS nesting.
- OKLCH and P3 colour, `color-mix()`, relative colour syntax.
- Popover, invoker commands, `@starting-style`, `field-sizing`, `text-wrap: balance`, `sibling-index()`.

**Progressive enhancement only**
- Cross-document view transitions (not in Firefox).
- Anchor positioning (the Baseline data conflicts on Firefox).
- Customizable `<select>` (not in Firefox).
- `text-wrap: pretty` (not in Firefox).
- `popover="hint"` and `dialog closedby` (not in Safari).
- Speculation rules (Chromium only).

**Speculation rules.** Chrome says not to use them for client-side navigation inside a single-page app. Use them only for real document loads, and use the router's intent preloading inside the app ([Chrome](https://developer.chrome.com/docs/modern-web-guidance/guides/performance/improve-next-page-load-performance)).

## 3. Core Web Vitals, WCAG and AI search

**Core Web Vitals**
- Targets for a good score, measured at the 75th percentile: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 ([web.dev](https://web.dev/articles/vitals)).
- Soft-navigation metrics launched in Chrome 151 and appear in CrUX as experimental. Google aims to make them official around May 2027 ([web.dev](https://web.dev/blog/crux-experimental-soft-navs/)).
- Lighthouse 13 kept its scoring weights: TBT 30%, LCP 25%, CLS 25% ([Chrome](https://developer.chrome.com/blog/lighthouse-13-0)).

**Video and fonts**
- A video only counts as the LCP element if it has a poster. Preload the poster with `fetchpriority="high"` ([DebugBear](https://www.debugbear.com/blog/optimize-video-lcp)).
- Self-host WOFF2 fonts, preload one or two, and use `size-adjust` on the fallback font ([web.dev](https://web.dev/articles/font-best-practices)).

**Cloudflare**
- Cloudflare Speed Brain skips routes served by a Worker and conflicts with a nonce-based CSP, so it doesn't help this site ([CF](https://developers.cloudflare.com/speed/optimization/content/speed-brain/index.md)).
- Early Hints come from `Link` headers on responses ([CF](https://developers.cloudflare.com/workers/examples/103-early-hints)).

**Accessibility (WCAG 2.2 AA)**
- The criteria new in 2.2 ([TetraLogical](https://tetralogical.com/blog/2023/10/05/whats-new-wcag-2.2)):
  - focus not hidden by sticky elements;
  - targets at least 24 × 24 px;
  - single-pointer alternatives to dragging;
  - help in a consistent place;
  - no re-entering the same data;
  - login with no memory test (pasting and password managers must work).
- In Australia, the AHRC's April 2025 guidelines point to "the latest" WCAG ([AHRC](https://humanrights.gov.au/our-work/disability-rights/publications/guidelines-equal-access-digital-goods-and-services)).

**AI search**
- Google needs nothing special beyond being indexable and eligible for snippets, and llms.txt isn't needed ([Google](https://developers.google.com/search/docs/appearance/ai-features)).
- OpenAI documents its crawlers: OAI-SearchBot decides inclusion in ChatGPT search; GPTBot is for training ([OpenAI](https://developers.openai.com/api/docs/bots)).
- Anthropic: Claude-SearchBot indexes for search; ClaudeBot is for training ([Anthropic](https://support.claude.com/en/articles/8896518)).
- Perplexity: PerplexityBot ([Perplexity](https://docs.perplexity.ai/docs/resources/perplexity-crawlers.md)).
- Bing's AI Performance report counts how often Copilot cites a site. Bing recommends IndexNow, clear headings, tables and sourced evidence ([Bing](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)).

*Correlational studies, not causal*
- 76% of AI Overview citations come from pages in the top 10 organic results ([Ahrefs](https://ahrefs.com/blog/search-rankings-ai-citations)).
- Adding schema alone didn't change citations ([CMSWire on an Ahrefs test](https://www.cmswire.com/digital-marketing/does-structured-data-actually-improve-answer-engine-citations/)).
- Brand mentions correlate more strongly than backlinks (same source).

**Structured data and security**
- Structured data: Organization, WebSite and BreadcrumbList. Google no longer shows FAQ rich results, but visible Q&A still helps Bing and AI answers.
- Security: an A grade needs a CSP (nonce + `strict-dynamic`), HSTS of at least 6 months, `nosniff`, `frame-ancestors`, a Referrer-Policy and a Permissions-Policy ([Mozilla scoring](https://github.com/mozilla/http-observatory/blob/main/httpobs/docs/scoring.md)).
