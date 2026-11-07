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
- **Supabase** for the backend: Postgres for the data and Supabase Auth for sign-in. The app's own server talks to the database (`src/lib/backend/`); the browser never does.
- Data access goes through `src/services/*`; business rules live in server functions in `src/lib/*-fns.js` and shared rule modules (`*.server.js`).
- Illustrative footage lives in `public/media` and is served as plain static files.
- First built on Base44, then moved off it. The client is still named `base44` in the code (`src/api/base44Client.js`) and the entity definitions still live in `base44/entities/`, so nothing else had to change.

## Put it online (free)

**`docs/DEPLOY.md`** walks through it click by click: Supabase (database and sign-in), then Cloudflare (hosting), then your data.

## Run it locally

```bash
npm ci
cp .dev.vars.example .dev.vars        # DATABASE_URL, ADMIN_EMAILS
cp .env.example .env.local            # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm run dev
```

Other scripts:

```bash
npm run build                          # -> dist/ (client assets + the Worker)
npm run preview                        # serve the built Worker locally
npm run lint
node scripts/gen-backend-schema.mjs    # after changing base44/entities: refresh supabase/schema.sql
node scripts/csv-to-sql.mjs <folder>   # Base44 CSV exports -> SQL to paste into Supabase
node scripts/demo-seed.mjs             # refresh supabase/demo-seed.sql
```

There is no `index.html`: the document is rendered on the server from `src/routes/__root.jsx`.

## Settings

Build-time (Vite reads them while building; on Cloudflare they are **build variables**):

| Variable | Used for |
| --- | --- |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Its public key (anon or publishable). Safe in the browser: the tables are closed to it |
| `VITE_ENABLE_GOOGLE_LOGIN` | Optional, `true` after switching Google on in Supabase |

Runtime (on Cloudflare they are **variables and secrets** of the Worker):

| Variable | Used for |
| --- | --- |
| `DATABASE_URL` | Secret. The Supabase **Transaction pooler** connection string, with your database password |
| `ADMIN_EMAILS` | Comma-separated emails that become admins when they sign in |
| `RESEND_API_KEY`, `EMAIL_FROM` | Optional. Sends the sample-decision reminder through Resend |
| `APP_URL` | Optional. The address used in emails; defaults to the address the request came in on |

Not wired yet: the Australian Business Register lookup (`checkAbnWithAbr` in `src/lib/member-fns.js`) is a stub, and there is no payment or payout provider. Member payments and supplier payouts are marked received or sent by an admin, in the console.

## Where things live

```
src/routes/            Pages (file-based routes), layouts and the two server routes
src/services/          Every data call the screens make
src/lib/backend/       Supabase: data layer, access rules, sign-in, email
src/lib/*-fns.js       Server functions (auth, validation, business rules)
src/lib/*.server.js    Server-only rule modules (orders, samples, console)
base44/entities/       Entity schemas and access rules (source for supabase/schema.sql)
base44/emails/         Email templates
supabase/              schema.sql, demo-seed.sql (paste into the Supabase SQL editor)
public/media, fonts    Static footage and the Switzer woff2 files
```

- **`docs/ARCHITECTURE.md`** — entities and their permission rules, every backend function and the rules it enforces, the automations, and the motion components.
- **`docs/MIGRATION.md`** — how the app moved from Base44 to Supabase.
- **`docs/DEPLOY.md`** — putting it online for free.
- **`AGENTS.md`** — the design and engineering rules this repository follows.

## Rules worth knowing before you change code

- Pages never call the data layer directly. Screens go through `src/services/`, which calls a server function or an entity.
- Credits, prices, hub routing, commission, payouts and status changes are decided on the server, never in the browser.
- Every number a contract depends on comes from the `AppSettings` entity.
- Every seeded or demo record carries `is_demo: true`.
- Australian English. Dates as "Fri 31 Oct". Money in A$ (factory prices in US$).