# Wholesale System

A members-only sourcing platform for Australian businesses buying from Chinese factories that our team has visited, filmed and verified. Every product has physical samples in our two Australian hubs (Brisbane, run by Yusuf, and Sydney, run by our partner), and every bulk order is locked to the sample the buyer approved.

**Promise: "See it. Touch it. Then order it."**

## What is in the app

| Surface | Routes | What it does |
| --- | --- | --- |
| Public site | `/` | Landing page built around one showcase product, its landed-cost sheet and the route from the factory floor to the member's door |
| Public site | `/join` | Three-step membership application: plan, business details, review |
| Auth | `/login`, `/register`, `/forgot-password`, `/reset-password`, `/mfa` | Sign in, sign up with email code, password reset, two-factor |
| Member app | `/browse`, `/category`, `/supplier`, `/product`, `/compare` | Live catalogue of verified factories and products, landed cost, sample availability |
| Member app | `/samples` | Current sample, tracking, the approve / reject / change decision, history |
| Member app | `/orders`, `/orders/new`, `/orders/:orderNo` | Bulk order builder locked to an approved sample, order list and detail |
| Member app | `/account` | Plan, price date, delivery address, sample-credit ledger |
| Console | `/admin/sample-requests`, `/admin/dispatch-labels` | Hub pick queue, one next step per request, today's shelf, low stock, printable labels |
| Console | `/admin/supplier-pipeline`, `/admin/suppliers`, `/admin/suppliers/:code` | Supplier pipeline board, six checks, scorecard, film, agreement, commercial terms |
| Console | `/admin/products`, `/admin/products/:productId`, `/admin/categories` | Catalogue, colours, price tiers, spec revisions |
| Console | `/admin/hubs`, `/admin/containers`, `/admin/sample-inventory` | Hubs, container logistics, shelf units |
| Console | `/admin/orders`, `/admin/orders/:orderNo` | Order status, inspections, shipping |
| Console | `/admin/supplier-payouts`, `/admin/commission-statement` | Supplier payouts and a monthly commission statement |
| Console | `/admin/members`, `/admin/settings` | Members and every configurable number |

The app is English, with a Turkish translation of the staff console (`src/i18n/admin.en.json`, `admin.tr.json`).

## Stack

- **TanStack Start** (React 19, plain JavaScript) on **Vite**, server-rendered, deployed to Cloudflare Workers through `@cloudflare/vite-plugin`.
- **Tailwind CSS** with a token layer in `src/index.css` and `tailwind.config.js`; one typeface, Switzer, self-hosted from `public/fonts`.
- **Base44** for the backend: entities (data), auth, the Core integrations (email), workflows and hosting.
- Data access goes through `src/services/*`; business rules live in server functions in `src/lib/*-fns.js` and shared rule modules (`*.server.js`).
- Illustrative footage lives in `public/media` and is served as plain static files.

## Run it locally

```bash
npm ci
npm run dev          # Vite dev server with the Base44 dev backend
```

Other scripts:

```bash
npm run build        # -> dist/ (client assets + the Worker)
npm run preview      # serve the built Worker locally
npm run lint         # eslint
npm run lint:fix
```

If you are working from a clone outside the Base44 builder, the platform CLI sets up the link first:

```bash
base44 login         # one-time per machine
base44 link          # one-time per clone
base44 dev           # local backend + app together
base44 deploy        # or publish from the Base44 builder
```

There is no `index.html`: the document is rendered on the server from `src/routes/__root.jsx`.

## Environment variables

The Base44 client is built from three Vite variables read in `src/lib/app-params.js`. The platform injects them; a build outside Base44 must supply them itself.

| Variable | Used for |
| --- | --- |
| `VITE_BASE44_APP_ID` | The app the SDK talks to |
| `VITE_BASE44_APP_BASE_URL` | The API base URL for that app |
| `VITE_BASE44_FUNCTIONS_VERSION` | Optional; pins the deployed backend function version |

A `?functions_version=` query parameter overrides the version for one session, and `?clear_access_token=true` clears a stale stored token.

## Secrets

**None are required today.** Every integration the code uses is platform-owned: entity access is authenticated by the visitor's token, and the one outbound email is sent through the Core `SendEmail` integration.

Two things to know before adding one:

- The Australian Business Register lookup (`checkAbnWithAbr` in `src/lib/member-fns.js`) is a stub. Wiring it up needs an `ABR_GUID` secret, read in the handler with `secrets.get("ABR_GUID")` from `base44:runtime`.
- There is no payment or payout provider. Member payments and supplier payouts are marked received or sent by an admin, in the console.

## Where things live

```
src/routes/            Pages (file-based routes), layouts and the two server routes
src/services/          Every SDK call the screens make
src/lib/*-fns.js       Server functions (auth, validation, business rules)
src/lib/*.server.js    Server-only rule modules (orders, samples, console)
base44/entities/       Entity schemas and row-level security
base44/workflows/      Scheduled automations
base44/emails/         Email templates
public/media, fonts    Static footage and the Switzer woff2 files
```

- **`docs/ARCHITECTURE.md`** — entities and their permission rules, every backend function and the rules it enforces, the automations, and the motion components.
- **`docs/MIGRATION.md`** — every place the code depends on Base44, and what it maps to on Supabase.
- **`AGENTS.md`** — the design and engineering rules this repository follows.

## Rules worth knowing before you change code

- Pages never call the Base44 SDK. Screens go through `src/services/`, which calls a server function or an entity.
- Credits, prices, hub routing, commission, payouts and status changes are decided on the server, never in the browser.
- Every number a contract depends on comes from the `AppSettings` entity.
- Every seeded or demo record carries `is_demo: true`.
- Australian English. Dates as "Fri 31 Oct". Money in A$ (factory prices in US$).