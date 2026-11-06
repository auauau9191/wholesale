# Architecture

How the Wholesale System is put together: the data model with its access rules, every server-side function and the rule it enforces, the automations, and the motion layer.

## Contents

1. [Layers](#1-layers)
2. [Entities and permission rules](#2-entities-and-permission-rules)
3. [Server functions](#3-server-functions)
4. [Server routes](#4-server-routes)
5. [Automations and email](#5-automations-and-email)
6. [Motion components](#6-motion-components)
7. [Shared rule modules](#7-shared-rule-modules)

---

## 1. Layers

```
src/routes/*.jsx            pages: render only, no SDK calls
src/services/*.js           the only place screens reach data (entity calls + server-function wrappers)
src/lib/*-fns.js            server functions: auth, zod validation, business rules
src/lib/*.server.js         server-only rule modules shared by functions
base44/entities/*.jsonc     schemas + row-level security
base44/workflows/           scheduled automation
```

Three properties hold across the app:

- **The browser is never trusted.** Credits, eligibility, prices, commission, payouts, hub routing and every status change are computed in a server function, which runs with the service role and re-checks the caller.
- **Every configurable number comes from `AppSettings`.** Fees, rates, prices, promise days, reorder level and credit counts are read from the entity, never typed into code.
- **Members never see supplier commercials.** Commission fields on `Order`, the legal/contact/payout fields on `Supplier`, `street_address` on `Hub`, and `hub_code` / `membership_active` on `User` are field-level admin-only, and the server strips them again before returning a member payload.

### Authentication and authorisation

- `src/lib/auth-middleware.js` wires `context.getBase44()` into every server function and request. `requireUser` rejects anonymous callers with 401 and sets `context.user`; `requireUserRoute` does the same for server routes. Only a 401/403 means "not signed in" — outages propagate.
- `src/lib/console.server.js` decides staff access: `requireStaff` (admin, or `hub_code` of `BNE`, `SYD` or `ALL`), `assertHub` (hub staff act only on their own hub) and `hubQuery` (the hub filter). Admins pass everywhere.
- A second layer sits in the entity rules: the catalogue is unreadable unless the caller's `membership_active` is true, and only admins may create, update or delete any business record.

---

## 2. Entities and permission rules

Every entity has the built-in `id`, `created_date`, `updated_date`, `created_by_id`. All records carry `is_demo`.

The rules are written as "read / create / update / delete". `member` means `user_condition.membership_active: true`; `admin` means `user_condition.role: "admin"`; `hub staff` means `user_condition.hub_code` is `BNE`, `SYD` or `ALL`.

### User (built-in)

The account. Three custom fields, all admin-writable only.

| Field | Type | Notes |
| --- | --- | --- |
| `role` | string `admin` \| `user` | required |
| `hub_code` | string `BNE` \| `SYD` \| `ALL` | field-level update: admin only |
| `membership_active` | boolean | field-level update: admin only; written only by the server when a membership is activated or expires |

Permissions: platform defaults (a user reads their own record; admins list and update others). The two custom fields cannot be changed by the member.

### MemberProfile

One per account. Holds the application, the plan and the paid period.

| Field | Type |
| --- | --- |
| `user_email` | string (one profile per account) |
| `business_name` | string |
| `abn` | string, 11 digits after normalisation |
| `abn_valid` | boolean |
| `phone`, `street`, `suburb`, `postcode` | string |
| `state` | `NSW` \| `VIC` \| `QLD` \| `WA` \| `SA` \| `TAS` \| `ACT` \| `NT` |
| `plan` | `starter_quarter` \| `monthly` \| `annual` |
| `plan_started_on`, `paid_until` | date |
| `payment_status` | `pending` \| `settled` \| `failed` |
| `status` | `pending_review` \| `active` \| `on_hold` \| `suspended` |
| `fraud_flags` | string[] |

Permissions: read — own row (`data.user_email = {{user.email}}`) or admin; create/update/delete — admin only.

### AbnRecord

The permanent memory of an ABN, so the free joining sample happens once per business for life.

| Field | Type |
| --- | --- |
| `abn` | string (unique, never deleted) |
| `first_user_email` | string |
| `join_free_sample_used` | boolean |
| `used_on` | date |

Permissions: read/create/update/delete — admin only.

### Category

| Field | Type |
| --- | --- |
| `code` | string, short code e.g. `PC` |
| `name` | string |
| `risk_tier` | `low` \| `medium` \| `high` |
| `sort_order` | number |
| `is_live` | boolean |
| `compliance_notes` | string |

Permissions: read — member or admin; create/update/delete — admin only.

### Hub

| Field | Type |
| --- | --- |
| `hub_code` | `BNE` \| `SYD` |
| `name`, `manager_name`, `city`, `state` | string |
| `street_address` | string — **field-level read: admin only** |
| `serves_states` | string[] |
| `fallback_rank` | number (lower is tried first) |
| `is_active` | boolean |

Permissions: read — member, admin, or hub staff; create/update/delete — admin only.

### Product

| Field | Type |
| --- | --- |
| `product_id` | string, e.g. `PC-CN014-0087` |
| `supplier_code`, `category_code`, `name`, `short_description` | string |
| `photo_urls` | string[] |
| `colours` | { name, hex }[] |
| `moq`, `lead_time_days`, `freight_aud_per_unit_estimate` | number |
| `price_tiers` | { min_qty, max_qty, fob_usd }[] |
| `incoterm_port`, `hs_code_indicative` | string |
| `current_spec_revision` | string, e.g. `R2` |
| `has_chafta_origin_cert` | boolean |
| `safety_flags`, `biosecurity_flags`, `stock_flags` | string[] |
| `test_reports` | { name, expires_on }[] |
| `master_hub` | `BNE` \| `SYD` |
| `status` | `draft` \| `live` \| `sample_unavailable` \| `retired` |

Permissions: read — (`status = live` or admin) **and** (member or admin); create/update/delete — admin only. A member only ever sees live products while their membership is active.

### Supplier

| Field | Type |
| --- | --- |
| `supplier_code` | string, e.g. `CN014` |
| `headline`, `province`, `city`, `production_lines` | string |
| `supplier_type` | `factory` \| `trading_company` |
| `exporting_since_year`, `staff_count` | number |
| `category_codes` | string[] |
| `verification_score` | number, out of 100 |
| `score_capability`, `score_quality`, `score_communication`, `score_compliance`, `score_export` | number, each out of 20 |
| `checks_passed` | string[] |
| `visit_date`, `filmed_date` | date |
| `video_url`, `video_chapters` | string, { title, start_seconds }[] |
| `agreement_status` | `none` \| `sent` \| `signed` |
| `non_circumvention_signed` | boolean |
| `pipeline_stage` | `screened` \| `visited` \| `filmed` \| `signed` \| `samples_in` \| `live` \| `rejected` |
| `listing_fee_paid_until`, `listing_fee_waived` | date, boolean |
| **admin only** | `commission_rate`, `legal_name`, `contact_name`, `contact_email`, `contact_wechat`, `payout_currency` (`CNY`\|`USD`), `payout_method` (`airwallex`\|`bank_wire`), `payout_account_ref`, `internal_notes` |

Permissions: read — (`pipeline_stage = live` or admin) **and** (member or admin); create/update/delete — admin only. The admin-only fields carry field-level read rules as well.

### SpecRevision

| Field | Type |
| --- | --- |
| `product_id`, `revision` | string |
| `materials`, `dimensions_mm`, `colour_pantone`, `finish`, `tolerances`, `packaging`, `labelling` | string |
| `weight_g` | number |
| `signed_date` | date |
| `document_url` | string |
| `status` | `draft` \| `signed` \| `superseded` |

Permissions: read — member or admin; create/update/delete — admin only.

### SampleUnit

One physical unit. The master never leaves the shelf.

| Field | Type |
| --- | --- |
| `unit_id` | string, e.g. `PC-CN014-0087-S07`; the master ends in `-M` |
| `product_id`, `revision`, `colour`, `shelf_location`, `container_no` | string |
| `is_master` | boolean |
| `hub_code` | `BNE` \| `SYD` |
| `status` | `in_transit` \| `qc_hold` \| `in_stock` \| `reserved` \| `dispatched` \| `with_member` \| `returned` \| `retired` |
| `qc_result` | `match` \| `mismatch` \| `empty` |
| `qc_checked_by`, `qc_checked_on`, `condition_notes` | string, date, string |

Permissions: read — member, admin, or hub staff; create/update/delete — admin only.

### SampleRequest

| Field | Type |
| --- | --- |
| `request_no` | string, e.g. `SR-0318` |
| `user_email`, `product_id`, `unit_id` | string |
| `hub_code` | `BNE` \| `SYD` |
| `paid_with` | `join_credit` \| `order_credit` \| `swap` \| `paid_fee` |
| `fee_aud` | number |
| `status` | `requested` \| `on_hold` \| `ready_to_dispatch` \| `dispatched` \| `delivered` \| `decided` \| `cancelled` |
| `carrier`, `tracking_number` | string |
| `dispatched_on`, `delivered_on`, `decision_due` | date |
| `decision` | `approve` \| `reject` \| `change` |
| `decision_reason` | `quality` \| `size` \| `colour` \| `price` \| `packaging` \| `other` |
| `decision_notes` | string |
| `flags` | string[] (`fraud check`, `awaiting payment`, `change requested`, `decision overdue`, `reminded <date>`) |

Permissions: read — own row or admin; create/update/delete — admin only (members write through `requestSample` and `recordDecision`).

### CreditLedger

Append-only sample credits. A debit names the lot it used.

| Field | Type |
| --- | --- |
| `user_email` | string |
| `change` | number (+1 / −1) |
| `reason` | `join` \| `order_placed` \| `swap` \| `admin_adjustment` \| `sample_used` \| `fee_refund` |
| `related_id` | string (ABN for a join credit, category for a swap, order number for an order credit) |
| `credit_entry_id` | string, on a debit: the id of the credit it consumed |
| `sample_request_no` | string |
| `note` | string |

Permissions: read — own rows or admin; create/update/delete — admin only.

### Order

| Field | Type |
| --- | --- |
| `order_no` | string, e.g. `WS-0142` |
| `user_email`, `product_id`, `supplier_code`, `spec_revision`, `approved_unit_id`, `sample_request_no`, `colour` | string |
| `quantity` | number |
| `unit_fob_usd`, `fx_rate`, `goods_aud`, `buyer_fee_aud`, `inspection_aud`, `total_aud`, `deposit_aud`, `balance_aud` | number (frozen at creation) |
| **admin only** | `commission_rate`, `commission_aud`, `supplier_payout_total_aud` |
| `delivery_route` | `via_BNE` \| `via_SYD` \| `direct` |
| `container_no` | string |
| `status` | `quote_requested` \| `deposit_pending` \| `in_production` \| `inspection_booked` \| `inspection_passed` \| `inspection_failed` \| `balance_pending` \| `balance_received` \| `shipped` \| `delivered` \| `cancelled` |
| `inspection_attempts` | number |
| `inspection_report_url` | string |
| `credits_granted` | boolean |
| `timeline` | { status, at, note }[] |

Permissions: read — own rows or admin; create/update/delete — admin only. The three commission fields carry field-level admin-only read rules, and `forMember()` / `forStaff()` strip them again server-side.

### SupplierPayout

One row per stage per order.

| Field | Type |
| --- | --- |
| `payout_no` | string, e.g. `PO-0001` |
| `supplier_code`, `order_no` | string |
| `stage` | `deposit` \| `balance` |
| `gross_aud`, `commission_withheld_aud`, `net_aud` | number |
| `currency` | `CNY` \| `USD` |
| `fx_rate`, `amount_foreign` | number |
| `status` | `scheduled` \| `sent` \| `confirmed` |
| `sent_on`, `provider_ref` | date, string |

Permissions: read/create/update/delete — admin only.

### SupplierNote

The audit trail of every pipeline move.

| Field | Type |
| --- | --- |
| `supplier_code`, `from_stage`, `to_stage`, `note`, `by_email`, `at` | string |

Permissions: read/create/update/delete — admin only.

### Container

| Field | Type |
| --- | --- |
| `container_no` | string, e.g. `CNT-2611-01` |
| `kind` | `sample_consolidation` \| `order_lcl` \| `order_fcl` |
| `origin_port` | string |
| `destination_hub` | `BNE` \| `SYD` |
| `etd`, `eta` | date |
| `status` | `booked` \| `at_sea` \| `arrived` \| `cleared` \| `unpacked` |
| `unit_ids`, `order_nos` | string[] |
| `broker_ref`, `notes` | string |

Permissions: read — admin or hub staff; create/update/delete — admin only.

### AppSettings

One record. Every configurable number in the product.

`fx_usd_to_aud`, `buyer_service_fee_rate`, `supplier_commission_rate`, `supplier_listing_fee_usd`, `deposit_rate`, `non_circumvention_months`, `inspection_fee_aud`, `broker_fee_aud`, `sample_fee_aud`, `decision_days`, `dispatch_business_days`, `sample_reorder_level`, `starter_quarter_price_aud`, `monthly_price_aud`, `annual_price_aud`, `default_duty_rate_no_origin_cert`, `gst_rate`, `order_sample_credits`, `swap_credit_days`, `sample_fee_credit_back_days` — all numbers, plus `is_demo`.

Permissions: read — member or admin; create/update/delete — admin only. The two public server functions (`getPublicPlans`, `getLandingData`) read it with the service role and return only the few numbers a visitor needs, so the record itself stays shut.

---

## 3. Server functions

Every function is a TanStack Start server function in `src/lib/`, called from a screen only through `src/services/`. All of them run `requireUser` unless marked public. "Service role" means the handler uses `context.getBase44().asServiceRole`; the caller has already been authenticated and authorised.

### `src/lib/member-fns.js` — joining and activation

**`registerMember`** · POST · signed in
- In: `{ plan, business_name, abn, mobile, street, suburb, state, postcode, terms_accepted: true }`
- Out: the created `MemberProfile`
- Rules: the ABN must pass the official checksum (`src/lib/abn.js`), normalised to 11 digits. One profile per account (409). Other profiles on the same ABN, mobile, or street + postcode add `fraud_flags` (`ABN already registered`, `Mobile already registered`, `Address already registered`); a shared ABN puts the profile `on_hold`, anything else still goes to `pending_review`. `payment_status` starts `pending`.

**`activateMembership`** · POST · admin
- In: `{ user_email }`
- Out: the updated `MemberProfile`
- Rules: sets `payment_status: settled`, `status: active`, `plan_started_on: today`, and `paid_until = today + plan months` (starter quarter 3, monthly 1, annual 12). Sets `User.membership_active = true` — the only code path that opens the catalogue. Upserts the `AbnRecord` and grants **one** join credit per ABN for life: it checks both `AbnRecord.join_free_sample_used` and any existing ledger row with `reason: "join"` and `related_id` equal to the ABN.

**`checkAbnWithAbr`** · POST · signed in
- In: `{ abn }` · Out: `{ abn, checked: false, reason }`
- A stub. The ABR web service is not connected; wiring it needs the `ABR_GUID` secret.

### `src/lib/sample-fns.js` — sample eligibility, requests and decisions

**`getSampleEligibility`** · GET · signed in
- In: `{ product_id, colour? }`
- Out: `{ eligible, method: "credit" | "paid_fee" | null, price_aud, hub_code, reason_if_not }`
- Runs every rule in `checkEligibility` (below) and returns the verdict only.

**`requestSample`** · POST · signed in
- In: `{ product_id, colour? }` · Out: the created `SampleRequest`
- Rules: re-runs the checks, then reserves the chosen unit (`in_stock → reserved`), allocates the next `SR-####` number, and sets `paid_with` from the credit lot's reason (`join → join_credit`, `swap → swap`, otherwise `order_credit`) or `paid_fee` with `AppSettings.sample_fee_aud`. Status is `on_hold` when the profile has fraud flags (flag `fraud check`) or when no credit covers it (flag `awaiting payment`); otherwise `requested`. A credit is debited (`reason: sample_used`, `change: -1`, `credit_entry_id` naming the lot, `sample_request_no`), and a join credit also marks the `AbnRecord` used.

**`recordDecision`** · POST · signed in
- In: `{ request_id, decision: approve | reject | change, reason?, notes? }`
- Out: `{ request, category_code }`
- Rules: only the owner, only once, only after `delivered`. A reject needs a reason, a change needs notes. Sets `status: decided` and appends the `change requested` flag when relevant. A reject on a categorised product grants **one** swap credit per request (`reason: "swap"`, `related_id` = category code, `sample_request_no` = request), which is valid for `swap_credit_days` and only in that category.

**`getMySamples`** · GET · signed in
- Out: `{ current, history, credits_left, explainer }` — the newest open request (or the last decided one), every other row, the count of usable credit lots, and the `sample_fee_aud`, `order_sample_credits`, `sample_fee_credit_back_days` and `decision_days` values.

### `src/lib/order-fns.js` — the order builder and member orders

**`getOrderBuilder`** · GET · signed in
- In: `{ request_id }` · Out: the lock — request number, product, colour, unit id, approved date, current spec revision, tolerances, MOQ, step, default quantity.
- Rules: the request must belong to the caller and be `decision: approve`.

**`quoteOrder`** · GET · signed in
- In: `{ product_id, quantity }` · Out: every order number, with the three commission fields removed.
- Rules: product must exist and not be retired; the quantity must be at least the MOQ and a multiple of 500.

**`createOrder`** · POST · signed in
- In: `{ sample_request_id, quantity }` · Out: the created order, commission fields removed
- Rules: membership active and paid up; the sample must be the caller's and approved; product not retired; the quantity rules above apply. All money is frozen into the row, `delivery_route` becomes `via_<hub>`, the status starts at `deposit_pending`, and the timeline is seeded with the unit and revision it is locked to.

**`getMyOrders`** · GET · signed in — the caller's 50 newest orders with `product_name`.

**`getMyOrder`** · GET · signed in
- In: `{ order_no }` · Out: that order with `product_name`, or `null`. Scoped to the caller's email.

**`schedulePayouts`** · POST · admin — `{ order_id, stage }` → the payout (see `createPayout`).

**`grantOrderCredits`** · POST · admin — `{ order_id }` → `{ granted }` (see `grantOrderCreditsOnce`).

### `src/lib/order-admin-fns.js` — staff order console

**`getAdminOrders`** · GET · staff — every order with product, supplier, member and its one next action.

**`getAdminOrder`** · GET · staff
- In: `{ order_no }` → `{ order, admin, product, supplier, member, payouts, actions }`.
- A non-admin staff read has the commission fields stripped, gets `null` for the supplier's legal name, contact email and payout currency, and an empty `payouts` list.

**`actOnOrder`** · POST · **admin**
- In: `{ order_id, action, report_url?, container_no?, delivery_route?, note? }`
- Out: `{ order, refund_deposit }`
- Rules: each action only runs from the status that precedes it, and appends a timeline entry:

| From | Action | To | Side effects |
| --- | --- | --- | --- |
| `deposit_pending` | `deposit_received` | `in_production` | grants the order's sample credits once, creates the deposit payout |
| `in_production` | `book_inspection` | `inspection_booked` | |
| `inspection_booked` | `inspection_passed` | `inspection_passed` | creates the balance payout |
| `inspection_booked` | `inspection_failed` | `inspection_failed`, or `cancelled` on the second failure | needs a report link; increments `inspection_attempts`; the second failure cancels the order and returns `refund_deposit: true` |
| `inspection_failed` | `book_inspection` | `inspection_booked` | |
| `inspection_passed` | `balance_received` | `balance_received` | |
| `balance_received` | `shipped` | `shipped` | needs a container number and a delivery route |
| `shipped` | `delivered` | `delivered` | |

### `src/lib/console-fns.js` — the sample desk

**`getSampleQueue`** · GET · staff
- In: `{ hub: "ALL" | "BNE" | "SYD" }`
- Out: `{ hub, promise_days, reorder_level, counts: { awaiting, late, on_hold, in_transit, deciding, overdue, low }, rows, low, shelf }`
- Rules: hub staff are pinned to their own hub (`hubFor`); admins may read either or both. `rows` carries the bucket, the due-out date (created date + `dispatch_business_days`, weekends skipped), days late, the decision due date, days overdue, and the one next action:

| Bucket | Condition | Action |
| --- | --- | --- |
| `on_hold` | `paid_fee` and flag `awaiting payment` | `confirm_payment` |
| `on_hold` | flag `fraud check` | `review` |
| `awaiting` | `requested` | `mark_ready` |
| `awaiting` | `ready_to_dispatch` | `mark_dispatched` |
| `in_transit` | `dispatched` | `mark_delivered` |
| `overdue` | delivered, decision due passed, not yet reminded today | `send_reminder` |

- `shelf` is the shelf strip: for the first eight products awaiting packing, every unit as a mark — `master`, `pack` (its own unit is being packed), `shelf`, `out` (reserved / dispatched / with member), `retired`.
- `low` lists products whose non-master stock at or under `sample_reorder_level` is on the shelf, emptiest first; `counts.low` is its length.

**`actOnSampleRequest`** · POST · staff, hub-scoped by `assertHub`
- In: `{ request_id, action, carrier?, tracking_number? }` · Out: the updated request
- Rules: each step only from its own status, otherwise 409 "has moved on". `confirm_payment` clears `awaiting payment` (back to `on_hold` if a fraud flag remains, else `requested`); `review` clears `fraud check` (same fallback); `mark_ready` → `ready_to_dispatch`; `mark_dispatched` needs a carrier and tracking number, sets `dispatched_on` and moves the unit to `dispatched`; `mark_delivered` sets `delivered_on` and `decision_due = today + decision_days`, and moves the unit to `with_member`; `send_reminder` only for an overdue, undecided request, emails the member and stamps `reminded <date>`.

**`getDispatchLabels`** · GET · staff
- In: `{ hub }` · Out: printable label rows (request number, unit id, business name, address, hub name and city) for every request in `requested` / `ready_to_dispatch`.

### `src/lib/ops-fns.js` — hubs and containers

**`getHubs`** · GET · staff — `{ rows, can_edit }`. Each row carries the count of non-master units in stock at that hub; `street_address` is returned only to admins.

**`saveHub`** · POST · admin — `{ hub_id, patch }` → the hub. Only the eight hub fields are accepted.

**`getContainers`** · GET · staff — `{ rows, can_edit }`. Each container carries its units and its `next_step` in the sequence `booked → at_sea → arrived → cleared → unpacked`.

**`createContainer`** · POST · admin — `{ kind, origin_port, destination_hub, etd, eta }` → the container. The ETA cannot precede the ETD; the number is `CNT-YYMM-NN` by month.

**`addToContainer`** · POST · admin — `{ container_id, unit_ids, order_nos }` (one per line or comma) → the container. Unknown unit or order ids are refused by name. Units move to the container's hub and `in_transit` (a retired unit stays retired).

**`stepContainer`** · POST · admin — `{ container_id }` → the container. When it reaches `unpacked`, every unit in it becomes `qc_hold` at the destination hub.

### `src/lib/catalog-admin-fns.js` — catalogue console

**`getProductList`** · GET · admin — `{ rows, suppliers, categories }` with per-product shelf stock (non-master units, in stock and total).

**`getProductEditor`** · GET · admin — `{ product_id }` → `{ product, revisions, units, suppliers, categories, settings }`, or `null`.

**`saveProduct`** · POST · admin — `{ product_id, patch }` → the product. Price tiers are sorted and must each start above the one before it.

**`createSpecRevision`** · POST · admin
- In: `{ product_id, revision, materials?, dimensions_mm?, weight_g?, colour_pantone?, finish?, tolerances?, packaging?, labelling?, signed_date?, document_url?, status? }`
- Out: `{ revision, previous, stale_units, checked_on }`
- Rules: a revision number is unique per product; a signed revision needs its signed date. Every earlier `draft` / `signed` revision becomes `superseded`, the new one becomes the product's `current_spec_revision`, and units still on an older revision (in stock, reserved, in QC or in transit) come back in `stale_units` so they can be retired.

### `src/lib/supplier-fns.js` — the supplier pipeline

**`getSupplierBoard`** · GET · admin — `{ rows, categories }`. Each card carries the supplier's stage, score, agreement state, visit date, product count and its `gaps` (what blocks it from going live).

**`moveSupplierStage`** · POST · admin
- In: `{ supplier_id, to_stage, note? }` · Out: `{ ok, gaps }`
- Rules: moving to `live` is gated — the agreement must be `signed`, non-circumvention signed, the verification score at least 70, the listing fee current or waived, and at least one of the supplier's products must have a non-master unit in stock at a hub. A blocked move returns `ok: false` with the gaps and changes nothing. Every successful move writes a `SupplierNote`.

**`getSupplierEditor`** · GET · admin — `{ code }` → the supplier, its notes (newest first), categories, and the live gaps, or `null`.

**`saveSupplier`** · POST · admin — `{ supplier_id, patch }` → the supplier. When any of the five 0–20 scores changes, `verification_score` is recomputed as their sum (each clamped to 0–20).

**`addSupplierNote`** · POST · admin — `{ supplier_code, note }` → the note, stamped with the caller's email and the time.

### `src/lib/payout-admin-fns.js` — supplier money

**`getPayouts`** · GET · admin — `{ rows, suppliers }`, grouped by status then newest first.

**`markPayoutSent`** · POST · admin — `{ payout_id, provider_ref, sent_on }` → the payout. Only from `scheduled`.

**`markPayoutConfirmed`** · POST · admin — `{ payout_id }` → the payout. Only from `sent`.

**`getCommissionStatement`** · GET · admin
- In: `{ supplier_code, month }` (month as `YYYY-MM`) → `{ supplier, month, rows, total_goods_aud, total_commission_aud }`
- Rules: every non-cancelled order placed in that month, oldest first, summed from the frozen order numbers.

### `src/lib/settings-fns.js`

**`getAdminSettings`** · GET · admin — the `AppSettings` record.
**`saveSettings`** · POST · admin — `{ id, patch }`. Only the twenty known numeric keys are accepted, each inside its allowed range (rates 0–1, `fx_usd_to_aud` 0.1–10, days 1–365 where a day count is required).

### `src/lib/landing-fns.js` — the public pages

**`getPublicPlans`** · GET · **public** — `{ starter_quarter_price_aud, monthly_price_aud, annual_price_aud, sample_fee_aud }` read with the service role, so `AppSettings` itself stays behind membership.

**`getLandingData`** · GET · **public** — the landing page's single read: the showcase product `PC-CN014-0087` at 5,000 units, its supplier, category, signed spec, the shelf unit and the figures derived from `AppSettings`. Only public fields are mapped out; an empty shape is returned if the seed data is missing.

---

## 4. Server routes

Raw HTTP endpoints in `src/routes/api/`, for URLs something other than the app's own screens requests.

| Route | Method | Auth | What it does |
| --- | --- | --- | --- |
| `/api/sample-checks` | POST | `requireUserRoute`, then admin (403 otherwise) | The daily sweep. Returns `{ expired, overdue, flagged, unavailable, checked_products }`. |
| `/api/time` | GET | public | `{ now }`, uncached. A health check. |

`/api/sample-checks` does four things with the service role:

1. **Overdue decisions** — every `delivered` request whose `decision_due` has passed without a decision gets the `decision overdue` flag.
2. **Stock flags** — for every live or sample-unavailable product: `low stock` when its non-master in-stock units at active hubs are at or under `sample_reorder_level`, and `empty at BNE` / `empty at SYD` when a live product has none at that hub.
3. **Sample availability** — a live product with no units left becomes `sample_unavailable`.
4. **Lapsed memberships** — an `active` profile whose `paid_until` has passed becomes `on_hold`, and its user's `membership_active` is set to false, which closes the catalogue to them at the entity-rule level.

---

## 5. Automations and email

### Workflow: "Daily sample checks"

`base44/workflows/Daily sample checks.jsonc`

- **Trigger:** scheduled, recurring, cron `0 6 * * *`, timezone `Australia/Sydney` (06:00 every day).
- **Step:** `invoke_server_route` → POST `/api/sample-checks`, then end.
- **Effect:** everything in section 4.

### Email template: `SampleDecisionReminder`

`base44/emails/SampleDecisionReminder.html`, sent from `sendReminder` in `src/lib/console-fns.js` through the Core `SendEmail` integration with `category: "transactional"`. It is triggered by the sample-desk action `send_reminder` — not on a schedule — and fills `business_name`, `request_no`, `product_name`, `due_date` and `samples_url`. A refused send (unsubscribed, bounced, spam) becomes a visible 409 in the console instead of a silent failure.

There is no other automation in the app. Memberships expire only through the daily sweep, and no payment provider is connected: member payments and supplier payouts change status when an admin records them.

---

## 6. Motion components

All motion lives in `src/components/motion/` and every one of them honours `useReducedMotion()`: under reduced motion the change is instant and videos show their poster. Content is never hidden waiting for an animation.

| Component | Motion | Where it is used |
| --- | --- | --- |
| `PageTransition` | Fade plus an 8px rise over 200ms around the router outlet; the first paint is skipped | `src/routes/__root.jsx` — every page |
| `Reveal` | Rises 20px into view once; siblings stagger 80ms via `index` | `src/routes/_site/index.jsx` — the landing sections |
| `Crossfade` | Crossfades one layer to the next with `AnimatePresence`; 1.6s on the landing stage, shorter elsewhere | `src/components/public/landing/HeroSplit.jsx` (sticky olive stage), `src/components/public/landing/RouteSection.jsx` |
| `CountUp` | Counts to a new value in 400ms in tabular figures | `src/components/member/LandedCalculator.jsx`, `src/components/public/landing/LandedSheet.jsx`, `src/components/orders/HowYouPay.jsx`, `src/components/orders/OrderLines.jsx`, `src/components/console/QueueCounts.jsx` |
| `LoopVideo` | Poster first; mounts near the viewport, plays only while a quarter is visible and the tab is active, at most two clips at once, poster only under reduced motion or Save-Data | `src/components/public/landing/Clip.jsx`, `src/routes/_site/join.jsx`, `src/routes/_authed/_app/category.jsx` |

Two more places animate, both with Framer Motion directly:

- **Shelf strip** — `src/components/console/ShelfStrip.jsx` uses `layout` on each unit mark (180ms) so marks slide when a unit changes state. Used in `ShelfPanel.jsx` on the sample desk.
- **Filtered lists and button press** — buttons use `transition-transform` with `active:scale-[0.97]`, and filtered rows re-layout through the same 150–200ms easing.

Nothing else moves: no parallax on text, no scroll-jacking, no shimmer, no spinners (loading is flat grey bars at real size in `src/components/shell/DataBlock.jsx`).

---

## 7. Shared rule modules

| Module | What it owns |
| --- | --- |
| `src/lib/samples.server.js` | Settings and profile loading; hub order for a state (`hubOrderFor`); credit lots (oldest first, named consumes); swap validity (category + `swap_credit_days`); unit picking (colour across hubs, then any); the full eligibility check; `SR-####` numbering; decision due dates |
| `src/lib/orders.server.js` | `QTY_STEP = 500`; quote maths; commission and supplier payout total; deposit / balance payout split; one payout per stage; order credits once per order; approved-sample check; `WS-####` / `PO-####` numbering; stripping commission fields |
| `src/lib/console.server.js` | Staff and hub authorisation; paginated reads; business-day and calendar-day arithmetic; ABN masking |
| `src/lib/sample-queue.server.js` | Queue buckets, the one next action per row, shelf marks, low-stock list, counts |
| `src/lib/supplier-rules.js` | Pipeline stages, the six checks, the five scores, `listingFeeCurrent`, `liveGaps`, `scoreTotal` |
| `src/services/pricing.js` | The landed-cost formula and the frozen order cost; nothing in it touches the database |
| `src/lib/membership.js` | `isMembershipActive` — profile active **and** paid up |
| `src/lib/abn.js` | ABN normalisation and the official checksum |
| `src/lib/orderStatus.js`, `orderActionLabels.js`, `requestLabels.js` | Status labels, tones, the `ORDER_NEXT` transition map, console translation keys |