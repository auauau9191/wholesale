# Migration map: Base44 → Supabase

Every place this code depends on Base44, and what it becomes on Supabase. The business logic in `src/lib/*.server.js` and the landed-cost maths in `src/services/pricing.js` are plain JavaScript with no SDK calls — they move unchanged. What changes is the data layer, the auth layer, and the transport between the browser and the rules.

**Static assets move as they are.** `public/media` (clips and posters) and `public/fonts` (Switzer woff2) are plain files served by the web server. On Supabase they can stay in the front-end build output, or be uploaded to Storage as public objects; neither the paths in `src/content/media.js` nor the `@font-face` rules change except for the prefix.

## Contents

1. [Platform surface](#1-platform-surface)
2. [Entities → Postgres tables](#2-entities--postgres-tables)
3. [Row-level security → policies](#3-row-level-security--policies)
4. [Server functions → Edge Functions](#4-server-functions--edge-functions)
5. [Auth](#5-auth)
6. [Automation and email](#6-automation-and-email)
7. [Static files that do not change](#7-static-files-that-do-not-change)
8. [Page-level SDK check](#8-page-level-sdk-check)

---

## 1. Platform surface

| Dependency | File(s) | What it does today | Supabase equivalent |
| --- | --- | --- | --- |
| SDK client creation | `src/api/base44Client.js` | `createClient` from `@base44/sdk` with app id, token, functions version and base URL | `createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)` from `@supabase/supabase-js` |
| Runtime config | `src/lib/app-params.js` | Reads `VITE_BASE44_APP_ID`, `VITE_BASE44_APP_BASE_URL`, `VITE_BASE44_FUNCTIONS_VERSION`; hands the SDK the stored access token; clears it on `?clear_access_token=true` | Read `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`; session comes from `supabase.auth.getSession()`; drop the functions-version switch |
| Entity reads/writes | `src/services/catalogService.js`, `sampleService.js`, `orderService.js`, `memberService.js`, `hubService.js`, `payoutService.js`, `adminService.js` | `base44.entities.<Name>.filter/list` returning a page (`{ items, next_cursor, has_more }`), plus `services/paging.js` to unwrap it | `supabase.from('<table>').select()` — `.eq/.in/.ilike/.order/.range/limit`; the page unwrapping goes away (PostgREST returns arrays) |
| Server function transport | `src/services/*.js` (`orderService`, `sampleService`, `adminService`) | Import the server function and call it (`getSampleQueue({ data: { hub } })`) | `supabase.functions.invoke('<function-name>', { body })` |
| Server function transport | `src/lib/*-fns.js` | `createServerFn()` handlers run in the app's SSR worker | Edge Functions in `supabase/functions/<name>/index.ts` |
| Caller identity on the server | `src/lib/auth-middleware.js` | `createClientFromRequest`, `auth.me()`, `requireUser`, `requireUserRoute` | Verify `Authorization: Bearer <jwt>` with `supabase.auth.getUser(jwt)` in each Edge Function; build a service-role client from `SUPABASE_SERVICE_ROLE_KEY` for privileged reads; RLS stays the second gate |
| Middleware wiring | `src/start.js`, `src/server.js` | `authMiddleware`, `base44RequestMiddleware`, error capture around every function and request | A shared `withAuth(handler)` wrapper per Edge Function; error capture becomes your own logger (e.g. Sentry) or `console.error` into Supabase logs |
| Service-role bypass | every `*-fns.js` handler (`context.getBase44().asServiceRole`) | Bypasses RLS for rules that must see more than the caller | `createClient(url, SERVICE_ROLE_KEY)` inside the Edge Function — never sent to the browser |
| Built-in email | `src/lib/console-fns.js` → `db.integrations.Core.SendEmail` | Sends `SampleDecisionReminder` to a member | A provider call from an Edge Function (Resend, Postmark, SES) with the same HTML template |
| AI gateway | `src/lib/ai.server.js` | TanStack AI adapter on the Base44 gateway | Not used by any screen today; if it ever is, point `openaiCompatibleText` at your own provider base URL and key |
| Error capture | `src/lib/error-capture.js`, `src/lib/error-capture.server.js`, `src/server.js` | Base44's managed error reporting | Replace with your own error middleware (Sentry, Supabase logs) |
| Hosting and build | `base44/config.jsonc`, `wrangler.jsonc` | Build/serve commands and the Worker entry | The TanStack Start app must be hosted elsewhere (Cloudflare, Vercel, Netlify); Supabase is only the backend |
| User record writes | `src/lib/member-fns.js`, `src/routes/api/sample-checks.js` | `db.entities.User.filter({ email })` then update `membership_active` | `auth.users` through the Admin API (`supabase.auth.admin.listUsers` / `updateUserById`), or a `profiles` table mirrored by trigger |
| Language preference | `src/lib/adminI18n.jsx` | `base44.auth.updateMe({ admin_locale })` | `supabase.auth.updateUser({ data: { admin_locale } })` and read `user.user_metadata.admin_locale` |

## 2. Entities → Postgres tables

Every entity maps to one table with the same field names. Arrays of objects (`colours`, `price_tiers`, `video_chapters`, `test_reports`, `timeline`) become `jsonb`; arrays of strings become `text[]` or `jsonb`; date-only fields (`paid_until`, `decision_due`, `etd`, `eta`, …) stay `date`.

| Entity file | Table | Notes |
| --- | --- | --- |
| `base44/entities/AbnRecord.jsonc` | `abn_records` | `abn` unique; rows are never deleted (one free sample per ABN for life) |
| `base44/entities/AppSettings.jsonc` | `app_settings` | One row. Consider a single-row `settings` table with `id = 1`, or a key/value table |
| `base44/entities/Category.jsonc` | `categories` | `code` unique |
| `base44/entities/Container.jsonc` | `containers` | `container_no` unique; `unit_ids`, `order_nos` are `text[]` |
| `base44/entities/CreditLedger.jsonc` | `credit_ledger` | Append-only; `change`, `reason`, `credit_entry_id`, `sample_request_no` |
| `base44/entities/Hub.jsonc` | `hubs` | `street_address` must not be readable by members — see column privileges below |
| `base44/entities/MemberProfile.jsonc` | `member_profiles` | `user_email` unique |
| `base44/entities/Order.jsonc` | `orders` | `order_no` unique; commission columns are admin-only |
| `base44/entities/Product.jsonc` | `products` | `product_id` unique; `price_tiers`, `colours`, `test_reports` are `jsonb` |
| `base44/entities/SampleRequest.jsonc` | `sample_requests` | `request_no` unique; `flags` is `text[]` |
| `base44/entities/SampleUnit.jsonc` | `sample_units` | `unit_id` unique; the master is the `-M` row with `is_master = true` |
| `base44/entities/SpecRevision.jsonc` | `spec_revisions` | `(product_id, revision)` unique |
| `base44/entities/Supplier.jsonc` | `suppliers` | `supplier_code` unique; legal name, contacts, payout and commission columns are admin-only |
| `base44/entities/SupplierNote.jsonc` | `supplier_notes` | Audit trail of pipeline moves |
| `base44/entities/SupplierPayout.jsonc` | `supplier_payouts` | `payout_no` unique; `(order_no, stage)` unique |
| `base44/entities/User.jsonc` | `profiles` (`id` = `auth.users.id`) | `role`, `hub_code`, `membership_active`; keep `email` in sync by trigger. `membership_active` must not be writable by the member |

Also carry the built-ins: `id uuid primary key default gen_random_uuid()`, `created_at`, `updated_at`, `created_by uuid`. Every record keeps `is_demo`. Rows created by server functions should stamp `created_by` from the JWT `sub` instead of relying on a platform default.

## 3. Row-level security → policies

Each `rls` block becomes `enable row level security` plus policies. The translation of the pieces used in this repo:

| Base44 rule | SQL |
| --- | --- |
| `{ "data.user_email": "{{user.email}}" }` | `user_email = auth.jwt() ->> 'email'` |
| `{ "user_condition": { "role": "admin" } }` | `exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')` — wrap it in a `security definer` helper `is_admin()` so it is not recursive |
| `{ "user_condition": { "membership_active": true } }` | `exists (select 1 from profiles p where p.id = auth.uid() and p.membership_active)` — helper `has_membership()` |
| `{ "user_condition": { "hub_code": "BNE" } }` | `exists (select 1 from profiles p where p.id = auth.uid() and p.hub_code in ('BNE','SYD','ALL'))` — helper `is_staff()` |
| `{ "data.status": "live" }` | `status = 'live'` |
| `$and` / `$or` | `and` / `or` inside one policy expression |
| create/update/delete `admin` | `with check (is_admin())` / `using (is_admin())` |

Patterns in this app:

- **Member-scoped tables** (`member_profiles`, `sample_requests`, `credit_ledger`, `orders`): one `select` policy `user_email = auth.jwt() ->> 'email' or is_admin()`; all writes admin-only (`is_admin()`), because members write through server functions.
- **Catalogue tables** (`products`, `suppliers`, `categories`, `spec_revisions`, `sample_units`, `hubs`, `app_settings`): `select` requires `has_membership() or is_admin()` (plus `status = 'live'` / `pipeline_stage = 'live'` where the entity says so, plus `is_staff()` for `sample_units` and `hubs`); writes `is_admin()`.
- **Admin-only tables** (`supplier_payouts`, `supplier_notes`, `abn_records`): `is_admin()` on every operation.
- **Field-level rules** — Base44 hides `orders.commission_rate`, `commission_aud`, `supplier_payout_total_aud`, `suppliers.legal_name`, `contact_*`, `payout_*`, `commission_rate`, `internal_notes`, `hubs.street_address`, and blocks members updating `profiles.hub_code` / `membership_active`. RLS is row-level, so in Postgres:
  - revoke those columns from `authenticated` (`revoke select (commission_aud, …) on orders from authenticated`) and expose a member-safe view (`orders_member`) that omits them, or
  - move them to a side table (`order_commercials`, `supplier_commercials`) with `is_admin()` read policies, or
  - return rows through `security definer` functions that select only the member columns.
  - For the `profiles` columns, add `with check` that pins `hub_code` and `membership_active` to their previous values unless `is_admin()` (or revoke `update` on those columns and write them only from Edge Functions with the service role).

## 4. Server functions → Edge Functions

One function per entry point is the safest mapping: the Zod schema becomes the request body validator, the `requireUser` middleware becomes the JWT check, and the handler body copies across with `db.entities.X` replaced by service-role table queries.

| Server function file | Function count | Supabase function names (suggested) |
| --- | --- | --- |
| `src/lib/member-fns.js` | 3 | `register-member`, `activate-membership`, `check-abn` |
| `src/lib/sample-fns.js` | 4 | `sample-eligibility`, `request-sample`, `record-decision`, `my-samples` |
| `src/lib/order-fns.js` | 7 | `order-builder`, `quote-order`, `create-order`, `my-orders`, `my-order`, `schedule-payout`, `grant-order-credits` |
| `src/lib/order-admin-fns.js` | 3 | `admin-orders`, `admin-order`, `admin-order-action` |
| `src/lib/console-fns.js` | 3 | `sample-queue`, `sample-request-action`, `dispatch-labels` |
| `src/lib/ops-fns.js` | 6 | `hubs`, `save-hub`, `containers`, `create-container`, `add-to-container`, `step-container` |
| `src/lib/catalog-admin-fns.js` | 4 | `product-list`, `product-editor`, `save-product`, `create-spec-revision` |
| `src/lib/supplier-fns.js` | 5 | `supplier-board`, `move-supplier-stage`, `supplier-editor`, `save-supplier`, `add-supplier-note` |
| `src/lib/payout-admin-fns.js` | 4 | `payouts`, `payout-sent`, `payout-confirmed`, `commission-statement` |
| `src/lib/settings-fns.js` | 2 | `admin-settings`, `save-settings` |
| `src/lib/landing-fns.js` | 2 | `public-plans`, `landing-data` (both stay public: no JWT check, service role inside) |

Rule modules move into `supabase/functions/_shared/` unchanged: `samples.server.js`, `orders.server.js`, `console.server.js`, `sample-queue.server.js`, `supplier-rules.js`, `membership.js`, `abn.js`, `orderStatus.js`, `orderActionLabels.js`, `requestLabels.js`, and `src/services/pricing.js` (it is pure maths). Only their imports of `services/paging.js` need replacing, because PostgREST returns plain arrays.

Two behaviours to preserve deliberately:

- **The service role is the rule engine.** Every rule that decides money, credits or status runs with the service role after the caller is authenticated — RLS protects direct reads, not these paths.
- **Pagination.** `allRows()` walks 500-row pages with a cursor; on Supabase use `.range(from, from + 499)` in a loop.

## 5. Auth

| Today | File(s) | Supabase |
| --- | --- | --- |
| Session state, `auth.me()`, `hasToken()`, logout | `src/lib/AuthContext.jsx` | `supabase.auth.getUser()`, `onAuthStateChange`, `signOut()`; keep the same `useAuth()` shape and the `authQuery` cache |
| Sign in with email + password | `src/components/auth/LoginPage.jsx` | `signInWithPassword` |
| Register → email code → verify | `src/components/auth/RegisterPage.jsx` | `signUp` → `verifyOtp({ type: 'signup' })`; `resend` |
| Forgot / reset password | `ForgotPasswordPage.jsx`, `ResetPasswordPage.jsx` | `resetPasswordForEmail`, `updateUser({ password })` |
| Google sign-in | `src/components/auth/parts.jsx`, `GoogleButton` | `signInWithOAuth({ provider: 'google' })` |
| Two-factor | `src/lib/authMfa.js`, `src/lib/authMfaFlow.js`, `MfaPage.jsx`, `MfaFlow.jsx`, `MfaManage.jsx`, `MfaMethodSetup.jsx` | `supabase.auth.mfa.enroll / challenge / verify / unenroll`; keep every step and the `session-record-block` wrapper |
| Login gate | `src/components/auth/AuthGate.jsx`, `src/routes/_authed.jsx` | Unchanged in shape: `beforeLoad` becomes an `ensureQueryData` on the Supabase session |
| Roles | `profiles.role` | A custom claim via a `custom_access_token_hook`, or the `is_admin()` helper as above |

The `/login`, `/register`, `/forgot-password`, `/reset-password`, `/mfa` routes and the `returnTo` handling stay as they are — only the calls inside the auth components change.

## 6. Automation and email

| Today | File(s) | Supabase |
| --- | --- | --- |
| Daily scheduled workflow, cron `0 6 * * *` `Australia/Sydney` | `base44/workflows/Daily sample checks.jsonc` | `pg_cron` job (`select cron.schedule('daily-sample-checks', '0 6 * * *', $$ … $$)`) calling the Edge Function through `pg_net`, or Supabase Cron invoking `daily-sample-checks` |
| The sweep itself | `src/routes/api/sample-checks.js` | Edge Function `daily-sample-checks`, authenticated with the service role key (no user JWT), returning the same `{ expired, overdue, flagged, unavailable, checked_products }` |
| Membership expiry | same file — sets `profiles.membership_active = false` | Same write through the Admin API or the service-role client |
| Decision reminder email | `src/lib/console-fns.js` → `SendEmail`, template `base44/emails/SampleDecisionReminder.html` | Provider call (Resend/Postmark/SES) from the `sample-request-action` function; the HTML template moves with it unchanged |
| Time zone | the workflow stores `Australia/Sydney` | `pg_cron` runs in UTC — schedule `0 19 * * *` for 06:00 Sydney, and handle the DST shift explicitly |

## 7. Static files that do not change

| Path | Contents | Migration |
| --- | --- | --- |
| `public/media/video`, `public/media/posters` | Illustrative clips and their posters | Plain static files. Copy as-is to the front-end host, or upload to a public Storage bucket and adjust only the prefix in `src/content/media.js` |
| `public/fonts` | `switzer-latin-400-normal.woff2`, `switzer-latin-500-normal.woff2` | Plain static files, plus the `@font-face` rules in `src/index.css`. Copy as-is |

`src/components/ui/image.jsx` rewrites `media.base44.com` URLs to a resize endpoint. Content images that move to Supabase Storage need their own transform (Storage image transformations or a CDN), otherwise the component passes the URL through untouched.

## 8. Page-level SDK check

**No page calls the SDK.** A search of `src/routes/**` for `@/api/base44Client` and `@base44/sdk` finds nothing: every route reads through `src/services/*`, which either wraps a server function or is the one place an entity is queried.

The only components that talk to the platform directly are the auth surface, which is intentional:

| File | Call | Why it stays |
| --- | --- | --- |
| `src/components/auth/RegisterPage.jsx` | `base44.auth.register`, `verifyOtp`, `resendOtp`, `setToken` | The auth forms own their session lifecycle; there is no data record involved |
| `src/components/auth/LoginPage.jsx`, `parts.jsx` | `base44.auth.loginWithMfa`, `signInWithProvider` | Same |
| `src/components/auth/ForgotPasswordPage.jsx`, `ResetPasswordPage.jsx` | `base44.auth.resetPasswordRequest`, `resetPassword` | Same |
| `src/components/auth/ConsentPage.jsx`, `MfaPage.jsx` + `src/lib/authMfa.js`, `authMfaFlow.js` | MFA and OAuth-consent calls | Same |

Two library modules also touch the SDK, both outside the page layer: `src/lib/AuthContext.jsx` (the session cache every page reads through `useAuth()`) and `src/lib/adminI18n.jsx` (persists the console language to the user record with `updateMe`). No moves were needed.