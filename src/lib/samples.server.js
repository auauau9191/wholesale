import { toItems } from "@/services/paging";

const OPEN_STATUSES = ["requested", "on_hold", "ready_to_dispatch", "dispatched"];
const DAY_MS = 24 * 60 * 60 * 1000;

export const today = () => new Date().toISOString().slice(0, 10);
export const fail = (message, status = 400) => Object.assign(new Error(message), { status });

export const isOpenRequest = (request) =>
  OPEN_STATUSES.includes(request.status) || (request.status === "delivered" && !request.decision);

export async function loadSettings(db) {
  return toItems(await db.entities.AppSettings.list("-created_date", 1))[0] ?? {};
}

export async function loadProfile(db, email) {
  return toItems(await db.entities.MemberProfile.filter({ user_email: email }, { limit: 1 }))[0] ?? null;
}

/** Hub codes in the order to try: the hub serving the state, then the rest by fallback_rank. */
export async function hubOrderFor(db, state) {
  const hubs = toItems(await db.entities.Hub.filter({ is_active: true }, { limit: 20 }));
  const first = hubs.find((hub) => (hub.serves_states ?? []).includes(state));
  const rest = hubs
    .filter((hub) => hub !== first)
    .sort((a, b) => (a.fallback_rank ?? 99) - (b.fallback_rank ?? 99));
  return [first, ...rest].filter(Boolean).map((hub) => hub.hub_code);
}

/**
 * Credit lots, oldest first, with what is still unused. A debit uses the lot
 * it names; an older debit without one used the oldest remaining lot.
 */
export function creditLots(entries) {
  const sorted = [...entries].sort((a, b) => String(a.created_date).localeCompare(String(b.created_date)));
  const lots = sorted.filter((entry) => entry.change > 0).map((entry) => ({ ...entry, left: entry.change }));
  for (const entry of sorted.filter((row) => row.change < 0)) {
    let owed = -entry.change;
    const named = lots.find((lot) => lot.id === entry.credit_entry_id);
    if (named && named.left > 0) {
      const used = Math.min(named.left, owed);
      named.left -= used;
      owed -= used;
    }
    for (const lot of lots) {
      if (owed <= 0) break;
      if (lot.left <= 0 || lot.created_date > entry.created_date) continue;
      const used = Math.min(lot.left, owed);
      lot.left -= used;
      owed -= used;
    }
  }
  const balance = entries.reduce((sum, entry) => sum + (entry.change ?? 0), 0);
  return { balance, open: lots.filter((lot) => lot.left > 0) };
}

/** A swap only buys a sample in its own category, and only for swap_credit_days. */
export function lotIsValid(lot, categoryCode, settings) {
  if (lot.reason !== "swap") return true;
  const days = settings.swap_credit_days ?? 30;
  const expires = new Date(lot.created_date).getTime() + days * DAY_MS;
  return Date.now() <= expires && (!categoryCode || lot.related_id === categoryCode);
}

export const PAID_WITH = { join: "join_credit", swap: "swap" };

async function inStockUnits(db, productId, hubOrder) {
  const units = toItems(
    await db.entities.SampleUnit.filter({ product_id: productId, status: "in_stock" }, { limit: 200 })
  );
  return units.filter((unit) => !unit.is_master && hubOrder.includes(unit.hub_code));
}

/** Prefer the colour across hubs in order; else any colour at the first hub that has one. */
export function pickUnit(units, hubOrder, colour) {
  for (const hub of hubOrder) {
    const match = units.find((unit) => unit.hub_code === hub && colour && unit.colour === colour);
    if (match) return match;
  }
  for (const hub of hubOrder) {
    const any = units.find((unit) => unit.hub_code === hub);
    if (any) return any;
  }
  return null;
}

/** Every eligibility rule, run with the service role. */
export async function checkEligibility(db, email, productId, colour) {
  const no = (reason) => ({ eligible: false, method: null, price_aud: null, hub_code: null, reason_if_not: reason });
  const [settings, profile] = await Promise.all([loadSettings(db), loadProfile(db, email)]);

  const active =
    profile &&
    profile.status === "active" &&
    profile.payment_status === "settled" &&
    profile.paid_until &&
    String(profile.paid_until).slice(0, 10) >= today();
  if (!active) return { result: no("Your membership isn't active yet.") };

  const mine = toItems(await db.entities.SampleRequest.filter({ user_email: email }, { limit: 100 }));
  if (mine.some(isOpenRequest)) return { result: no("Decide on your current sample first.") };

  const product = toItems(await db.entities.Product.filter({ product_id: productId }, { limit: 1 }))[0];
  if (!product) throw fail("That product doesn't exist.", 404);

  const hubOrder = await hubOrderFor(db, profile.state);
  const units = await inStockUnits(db, productId, hubOrder);
  const unit = pickUnit(units, hubOrder, colour);
  if (!unit) return { result: no("No samples in stock — we've asked the supplier for more.") };

  const entries = toItems(await db.entities.CreditLedger.filter({ user_email: email }, { limit: 500 }));
  const { balance, open } = creditLots(entries);
  const lot = balance > 0 ? open.find((item) => lotIsValid(item, product.category_code, settings)) : null;

  const result = lot
    ? { eligible: true, method: "credit", price_aud: 0, hub_code: unit.hub_code, reason_if_not: null }
    : { eligible: true, method: "paid_fee", price_aud: settings.sample_fee_aud ?? 0, hub_code: unit.hub_code, reason_if_not: null };

  return { result, profile, product, unit, lot, settings };
}

export async function nextRequestNo(db) {
  const recent = toItems(await db.entities.SampleRequest.list("-created_date", 200));
  const top = recent.reduce((max, row) => {
    const n = Number(String(row.request_no ?? "").replace(/\D/g, ""));
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return `SR-${String(top + 1).padStart(4, "0")}`;
}

export function decisionDue(request, settings) {
  if (request.decision_due) return request.decision_due;
  if (!request.delivered_on) return null;
  const due = new Date(new Date(request.delivered_on).getTime() + (settings.decision_days ?? 14) * DAY_MS);
  return due.toISOString().slice(0, 10);
}