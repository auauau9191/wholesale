import { decisionDue, loadSettings, today } from "@/lib/samples.server";
import { addBusinessDays, allRows, byKey, daysBetween, hubQuery, maskAbn } from "@/lib/console.server";

const QUEUE_STATUSES = ["requested", "on_hold", "ready_to_dispatch", "dispatched", "delivered"];

function bucketOf(request, now, due) {
  if (request.status === "on_hold") return "on_hold";
  if (request.status === "dispatched") return "in_transit";
  if (request.status === "delivered") return due && due < now ? "overdue" : "deciding";
  return "awaiting";
}

/** The one next step for a row; null when the member is the one to act. */
export function actionFor(request, bucket) {
  const flags = request.flags ?? [];
  if (request.status === "on_hold") {
    if (request.paid_with === "paid_fee" && flags.includes("awaiting payment")) return "confirm_payment";
    if (flags.includes("fraud check")) return "review";
    return null;
  }
  if (request.status === "requested") return "mark_ready";
  if (request.status === "ready_to_dispatch") return "mark_dispatched";
  if (request.status === "dispatched") return "mark_delivered";
  if (bucket === "overdue" && !flags.includes(`reminded ${today()}`)) return "send_reminder";
  return null;
}

function shelfKind(unit, packing) {
  if (unit.is_master) return "master";
  if (packing.has(unit.unit_id)) return "pack";
  if (unit.status === "in_stock") return "shelf";
  if (unit.status === "retired") return "retired";
  if (["reserved", "dispatched", "with_member"].includes(unit.status)) return "out";
  return null;
}

/** Everything the Sample requests page shows, for one hub or both. */
export async function buildSampleQueue(db, hub) {
  const settings = await loadSettings(db);
  const now = today();
  const scope = hubQuery(hub);
  const promise = settings.dispatch_business_days ?? 2;
  const level = settings.sample_reorder_level ?? 3;

  const requests = (await allRows(db.entities.SampleRequest, { ...scope, status: { $in: QUEUE_STATUSES } })).filter(
    (row) => row.status !== "delivered" || !row.decision
  );
  const emails = [...new Set(requests.map((row) => row.user_email))];
  const [profiles, products, stock] = await Promise.all([
    emails.length ? allRows(db.entities.MemberProfile, { user_email: { $in: emails } }) : [],
    allRows(db.entities.Product, { status: { $in: ["live", "sample_unavailable"] } }),
    allRows(db.entities.SampleUnit, { ...scope, status: "in_stock" }),
  ]);
  const profileByEmail = byKey(profiles, "user_email");
  const productById = byKey(products, "product_id");

  const rows = requests
    .map((request) => {
      const profile = profileByEmail[request.user_email] ?? {};
      const due = decisionDue(request, settings);
      const bucket = bucketOf(request, now, due);
      const dueOut = addBusinessDays(request.created_date, promise);
      const waiting = bucket === "awaiting" || bucket === "on_hold";
      return {
        id: request.id,
        request_no: request.request_no,
        hub_code: request.hub_code,
        member: profile.business_name ?? request.user_email,
        abn_masked: maskAbn(profile.abn),
        fraud_flags: profile.fraud_flags ?? [],
        product_id: request.product_id,
        product_name: productById[request.product_id]?.name ?? request.product_id,
        unit_id: request.unit_id,
        paid_with: request.paid_with,
        fee_aud: request.fee_aud ?? 0,
        status: request.status,
        flags: request.flags ?? [],
        requested_at: request.created_date,
        due_out: dueOut,
        days_late: waiting && dueOut < now ? daysBetween(dueOut, now) : 0,
        decision_due: due,
        days_overdue: bucket === "overdue" ? daysBetween(due, now) : 0,
        bucket,
        action: actionFor(request, bucket),
      };
    })
    .sort((a, b) => String(a.requested_at).localeCompare(String(b.requested_at)));

  const left = {};
  for (const unit of stock) if (!unit.is_master) left[unit.product_id] = (left[unit.product_id] ?? 0) + 1;
  const low = products
    .map((product) => ({ product_id: product.product_id, name: product.name, supplier_code: product.supplier_code, left: left[product.product_id] ?? 0 }))
    .filter((row) => row.left <= level)
    .sort((a, b) => a.left - b.left);

  const awaiting = rows.filter((row) => row.bucket === "awaiting");
  const packing = new Set(awaiting.map((row) => row.unit_id));
  const shelfIds = [...new Set(awaiting.map((row) => row.product_id))].slice(0, 8);
  const shelfUnits = shelfIds.length ? await allRows(db.entities.SampleUnit, { ...scope, product_id: { $in: shelfIds } }) : [];
  const shelf = shelfIds.map((productId) => ({
    product_id: productId,
    name: productById[productId]?.name ?? productId,
    marks: shelfUnits
      .filter((unit) => unit.product_id === productId)
      .sort((a, b) => Number(b.is_master) - Number(a.is_master) || String(a.unit_id).localeCompare(String(b.unit_id)))
      .map((unit) => ({ unit_id: unit.unit_id, kind: shelfKind(unit, packing) }))
      .filter((mark) => mark.kind),
  }));

  const count = (bucket) => rows.filter((row) => row.bucket === bucket).length;
  return {
    hub,
    promise_days: promise,
    reorder_level: level,
    counts: {
      awaiting: awaiting.length,
      late: rows.filter((row) => row.days_late > 0).length,
      on_hold: count("on_hold"),
      in_transit: count("in_transit"),
      deciding: count("deciding"),
      overdue: count("overdue"),
      low: low.length,
    },
    rows,
    low,
    shelf,
  };
}