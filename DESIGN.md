# DESIGN.md: Docket, the Lotwise design system

Every screen on Lotwise follows this file. If a change can't be explained by a rule here, change the design, not the rule. To change a rule, record the reason in `decisions.md`.

To see it all working, open **`/design`** in the running app. The tokens and components live in `src/styles/docket.css` and `src/components/docket/`.

## The idea

A buyer's first question is what a product will really cost, landed. Lotwise answers it on a **docket**: thermal paper printed line by line, with the proof behind every figure on a tear-off stub.

The page is the **carbon** sheet underneath, the copy that keeps a record of everything printed on it. That gives three materials, each with a meaning:

- **Paper:** facts Lotwise states.
- **Pen:** a person at Lotwise checked something.
- **Red:** money that adds up, or the one action on a screen.

## Colour

Every colour has one job. A colour that isn't in this table doesn't belong on the page.

| Token | Value | Job |
|---|---|---|
| `--dk-carbon` | `oklch(0.205 0.045 268)` | The ground. Every page sits on carbon. |
| `--dk-carbon-2` | `oklch(0.25 0.05 268)` | Controls and lifted sheets on the ground. |
| `--dk-sheen` | `oklch(0.34 0.06 268)` | Rules and edges on the ground. |
| `--dk-on-carbon` | `oklch(0.87 0.02 268)` | Writing on carbon. |
| `--dk-muted` | `oklch(0.72 0.03 268)` | Quiet writing on carbon (4.5:1 or more). |
| `--dk-paper` | `oklch(0.975 0.006 95)` | Docket paper: facts we print. Also headlines on carbon. |
| `--dk-paper-2` | `oklch(0.93 0.008 95)` | A fill on paper. |
| `--dk-print` | `oklch(0.19 0.01 270)` | Thermal black, on paper. |
| `--dk-fade` | `oklch(0.47 0.012 270)` | Secondary print, on paper. |
| `--dk-red` | `oklch(0.57 0.205 27)` | Totals, and the one action on a screen. Nowhere else. |
| `--dk-pen` / `--dk-pen-light` | `oklch(0.45 0.19 266)` / `oklch(0.75 0.13 266)` | A person checked this: ticks, rings, stamps, notes, focus rings. Dark on paper, light on carbon. |
| `--dk-error` | `oklch(0.72 0.15 27)` | A problem to fix, on carbon. |

Rules:

- **Red:**
  - At most one red action per screen. The header's small Join ticket counts as the page's action only when the page has no other.
  - Red is never decoration, a heading accent or a hover colour for anything that isn't red already.
- **Pen blue:** never means "link" or "selected". It always means a person checked something.
- **Contrast:** text pairs meet WCAG 2.2 AA. They're checked by `scripts/qa/check.mjs`.

## Type

There is one family, **Martian Mono**, self-hosted as a single variable file (`/public/fonts/martian-mono-latin-var.woff2`, weight 100 to 800, width 75 to 112.5%). It's the type of a docket printer, and it is the brand. Don't add a second face.

| Role | Class | Setting |
|---|---|---|
| Page headline | `.dk-h1` | 800, 75% width, `clamp(44px, 6.4vw, 104px)`, line height 0.94, tracking −0.055em |
| Section headline | `.dk-h2` | 800, 75%, `clamp(40px, 5vw, 76px)` |
| Small headline | `.dk-h3` | 750, 87.5%, 18px |
| Reading text | `.dk-lede`, body | 400, 75%, 15 to 18px, at most 56 characters a line |
| Big figure | `.dk-figure` | 150 (hairline), 75%, tabular figures |
| Label | `.dk-label` | 600, 87.5%, 12px, `--dk-muted` |
| Docket print | inside `.dk-docket` | 12.5px lines, 10.5px proof stubs, 19px product name |

Rules:

- **Headings are questions buyers ask,** answered in the first one or two sentences under them.
- **Numbers line up:** use tabular figures wherever digits share a column.
- **Money:** A$ with 2 decimals per unit, and thousands separators on totals (A$5,270.00).
- **Labels:** no uppercase labels and no eyebrows. The only uppercase is the docket's own printed header (`LANDED COST SHEET`), because a real docket prints that way.

## Layout

- **Content:** sits in `.dk-wrap`, max 1360px wide, with a 16px gutter on phones and 40px from 700px up (both add the safe-area insets).
- **Grids:** two columns for question and answer, or for the calculator and the docket. They collapse to one column below 980px.
- **Paper:** anything printed is a `.dk-paper` sheet with torn zigzag edges (`.dk-zig-b`, `.dk-zig-t`). Paper sits on carbon and is never nested inside paper.
- **Structure means something:**
  - Numbers mark real sequences only (the four order steps).
  - Dashed rules are perforations, so something tears along them.
  - Dotted rules separate printed lines.
- **Completeness:** each page is complete at rest. Nothing meant to be read starts hidden, and the QA script fails a page that does.

## Motion: the machine prints, our team marks, you tear

Every animation belongs to one of three actors, and each actor always moves the same way. If a movement doesn't belong to one of them, it doesn't go in.

| Actor | Used for | How it moves | Tokens |
|---|---|---|---|
| **Print** (the machine) | A docket feeding out of the printer slot. A changed figure reprinting. Headings printing in as you scroll (`.dk-prints-in`). A new page feeding in. | Stepped and linear. One step a line. | `--dk-line` 64ms; `steps()` |
| **Mark** (our team) | Ticks beside proof, a ring around the figure that matters, stamps ("Matched to master", "Requested"). Lottie, generated by `scripts/gen-marks.py`. | Smooth, like a hand. Always pen blue. | `--dk-ease-pen` |
| **Tear** (you) | The ticket tab tearing when pressed. An old docket tearing off when you pick another product. A sample tag swinging when chosen. A page tearing away when you leave it. | A little spring. | `--dk-ease-tear`, 320 to 500ms |

Supporting movement must serve one of the three:

- **Till keys:** press down 3px; that's you.
- **Carbon copies under a docket:** sit deeper and move slower on scroll (parallax), because they are the record underneath.
- **3D sample:** turns when you drag it. When it's first seen it's set down on the shelf (our team, eased, no bounce).

Rules:

- **Reduced motion:** turns all of it off. Marks rest on their final frame, and every page is complete.
- **Loading:** Lottie (`lottie_light`) and three.js load only when needed, from our own bundle, and pause off-screen.
- **Never:**
  - scroll-jacking;
  - animation that delays reading;
  - looping decoration;
  - "fade and slide up" on every section;
  - bounce for anything the machine or our team does.

## Components

All components are in `src/components/docket/`.

| Component | Use it for | Don't |
|---|---|---|
| `Printer` | A docket that prints, tears and reprints. `printKey` names what's printed. | Put two printers on one screen. |
| `LandedDocket` | The landed-cost sheet for one product and quantity. It's built on `landedLines()`, the app's own formula. | Type figures by hand. |
| `DocketLine`, `DocketTotal`, `DocketRow`, `Printed` | Printed lines. `Printed` reprints only when its value changes. | Print a figure without the proof behind it, where proof exists. |
| `Sheet` | Paper that isn't printed live (membership, receipts). | Nest sheets. |
| `Ticket` | The one action, red with a tear-off tab. `onTorn` runs after the tear. | Use more than one per screen. |
| `SampleTags` | Choosing one product among a few. | Use for more than about 8 items (use a list). |
| `TillKeys` | Choosing a quantity or a plan (2 to 4 options). | Use for navigation. |
| `Mark`, `Stamp` | A person's check: tick, ring, stamp. | Use as decoration or for system states. |
| `Field`, `AbnField` | Inputs on carbon, with help text and errors that say how to fix the problem. | Hide labels inside placeholders. |
| `Logo` | The wordmark: thermal white over a red tear edge. | Recolour it or put it on paper. |

## Content

- **Answer-first:** each section heading is a buyer's question. The answer comes in the first sentence, and the proof sits next to every claim.
- **No invented proof:** never invent statistics, clients, reviews, quotes or claims. A gap stays a visible placeholder, listed in `checks.json`.
- **Stock media:** stock footage and photos always carry an "Illustrative" label. A review can be published only with a source and a recorded permission.
- **Guides:** carry a visible "last updated" date.
- **Voice:** plain, specific, active. Buttons say exactly what happens ("Request S03", not "Submit").

## Accessibility

- **Interaction:** everything works by keyboard, with a visible pen-blue focus ring. Touch targets are 44px for our own controls.
- **Reading:** dockets are real text. The 3D sample has a text alternative and turns with the arrow keys. Marks are `aria-hidden`, and the words beside them carry the meaning.

## Checks before a change ships

- `node scripts/qa/check.mjs --base <preview url> --paths <paths>`: screenshots at 7 widths, plus overflow, axe, broken-link, console-error and complete-at-rest checks. It must pass.
- `npm run test:unit`: plain unit tests.
- Lighthouse on mobile (`lighthouserc.json`, run in CI): 95 or more in all four categories.
- Look at the screenshots yourself. A green check is not the same as a good page.
