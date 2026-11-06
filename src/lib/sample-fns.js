import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { toItems } from "@/services/paging";
import {
  checkEligibility,
  creditLots,
  decisionDue,
  fail,
  isOpenRequest,
  loadSettings,
  lotIsValid,
  nextRequestNo,
  PAID_WITH,
  today,
} from "@/lib/samples.server";

const ProductInput = z.object({
  product_id: z.string().trim().min(1).max(40),
  colour: z.string().trim().max(60).optional(),
});

/** { eligible, method, price_aud, hub_code, reason_if_not } for the signed-in member. */
export const getSampleEligibility = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(ProductInput)
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const { result } = await checkEligibility(db, context.user.email, data.product_id, data.colour);
    return result;
  });

/** Re-runs every rule, reserves a unit, writes the request and the credit used. */
export const requestSample = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(ProductInput)
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const email = context.user.email;
    const check = await checkEligibility(db, email, data.product_id, data.colour);
    if (!check.result.eligible) throw fail(check.result.reason_if_not, 409);

    const { profile, unit, lot, settings } = check;
    const usesCredit = check.result.method === "credit";
    const fraud = (profile.fraud_flags ?? []).length > 0;
    const flags = [];
    if (fraud) flags.push("fraud check");
    if (!usesCredit) flags.push("awaiting payment");

    await db.entities.SampleUnit.update(unit.id, { status: "reserved" });
    const requestNo = await nextRequestNo(db);

    const request = await db.entities.SampleRequest.create({
      request_no: requestNo,
      user_email: email,
      product_id: data.product_id,
      unit_id: unit.unit_id,
      hub_code: unit.hub_code,
      paid_with: usesCredit ? PAID_WITH[lot.reason] ?? "order_credit" : "paid_fee",
      fee_aud: usesCredit ? 0 : settings.sample_fee_aud ?? 0,
      status: fraud || !usesCredit ? "on_hold" : "requested",
      flags,
      is_demo: false,
    });

    if (usesCredit) {
      await db.entities.CreditLedger.create({
        user_email: email,
        change: -1,
        reason: "sample_used",
        related_id: requestNo,
        credit_entry_id: lot.id,
        sample_request_no: requestNo,
        note: `Sample ${unit.unit_id}.`,
      });
      if (lot.reason === "join") {
        const record = toItems(await db.entities.AbnRecord.filter({ abn: profile.abn }, { limit: 1 }))[0];
        if (record) await db.entities.AbnRecord.update(record.id, { join_free_sample_used: true, used_on: today() });
      }
    }

    return request;
  });

/** Owner only, once, after delivery. A reject with a reason earns one swap in that category. */
export const recordDecision = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      request_id: z.string().trim().min(1).max(60),
      decision: z.enum(["approve", "reject", "change"]),
      reason: z.enum(["quality", "size", "colour", "price", "packaging", "other"]).optional(),
      notes: z.string().trim().max(1000).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const email = context.user.email;
    const request = await db.entities.SampleRequest.get(data.request_id).catch(() => null);
    if (!request || request.user_email !== email) throw fail("That sample isn't yours.", 404);
    if (request.decision) throw fail("You've already decided on this sample.", 409);
    if (request.status !== "delivered") throw fail("You can decide once the sample has arrived.", 409);
    if (data.decision === "reject" && !data.reason) throw fail("Tell us what was wrong.");
    if (data.decision === "change" && !data.notes) throw fail("Tell us what should change.");

    const product = toItems(await db.entities.Product.filter({ product_id: request.product_id }, { limit: 1 }))[0];
    const flags = [...(request.flags ?? [])];
    if (data.decision === "change") flags.push("change requested");

    const updated = await db.entities.SampleRequest.update(request.id, {
      decision: data.decision,
      decision_reason: data.decision === "reject" ? data.reason : undefined,
      decision_notes: data.notes || undefined,
      status: "decided",
      flags,
    });

    if (data.decision === "reject" && product?.category_code) {
      const swaps = toItems(
        await db.entities.CreditLedger.filter({ reason: "swap", sample_request_no: request.request_no }, { limit: 1 })
      );
      if (!swaps.length) {
        await db.entities.CreditLedger.create({
          user_email: email,
          change: 1,
          reason: "swap",
          related_id: product.category_code,
          sample_request_no: request.request_no,
          note: `Swap for ${request.request_no}.`,
        });
      }
    }

    return { request: updated, category_code: product?.category_code ?? null };
  });

/** The member's samples page: current sample, history, credits and the explainer numbers. */
export const getMySamples = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const db = context.getBase44().asServiceRole;
    const email = context.user.email;
    const [settings, requestsPage, ledgerPage] = await Promise.all([
      loadSettings(db),
      db.entities.SampleRequest.filter({ user_email: email }, { sort: "-created_date", limit: 50 }),
      db.entities.CreditLedger.filter({ user_email: email }, { limit: 500 }),
    ]);
    const requests = toItems(requestsPage);
    const productIds = [...new Set(requests.map((row) => row.product_id))];
    const unitIds = requests.map((row) => row.unit_id).filter(Boolean);

    const [products, units, categories] = await Promise.all([
      productIds.length ? db.entities.Product.filter({ product_id: { $in: productIds } }, { limit: 100 }) : [],
      unitIds.length ? db.entities.SampleUnit.filter({ unit_id: { $in: unitIds } }, { limit: 100 }) : [],
      db.entities.Category.list("sort_order", 50),
    ]);
    const productById = Object.fromEntries(toItems(products).map((row) => [row.product_id, row]));
    const unitById = Object.fromEntries(toItems(units).map((row) => [row.unit_id, row]));
    const categoryByCode = Object.fromEntries(toItems(categories).map((row) => [row.code, row.name]));

    const rows = requests.map((row) => {
      const product = productById[row.product_id] ?? {};
      const unit = unitById[row.unit_id] ?? {};
      const colour = unit.colour ?? null;
      return {
        id: row.id,
        request_no: row.request_no,
        status: row.status,
        paid_with: row.paid_with,
        fee_aud: row.fee_aud,
        hub_code: row.hub_code,
        product_id: row.product_id,
        product_name: product.name ?? row.product_id,
        photo_url: product.photo_urls?.[0] ?? null,
        category_code: product.category_code ?? null,
        category_name: categoryByCode[product.category_code] ?? null,
        unit_id: row.unit_id,
        revision: unit.revision ?? product.current_spec_revision ?? null,
        colour,
        colour_hex: product.colours?.find((item) => item.name === colour)?.hex ?? null,
        carrier: row.carrier,
        tracking_number: row.tracking_number,
        requested_on: row.created_date,
        dispatched_on: row.dispatched_on,
        delivered_on: row.delivered_on,
        decision: row.decision ?? null,
        decision_reason: row.decision_reason ?? null,
        decision_due: decisionDue(row, settings),
        open: isOpenRequest(row),
      };
    });

    const current = rows.find((row) => row.open) ?? (rows[0]?.status === "decided" ? rows[0] : null);
    const { open } = creditLots(toItems(ledgerPage));

    return {
      current,
      history: rows.filter((row) => row !== current),
      credits_left: open.filter((lot) => lotIsValid(lot, null, settings)).length,
      explainer: {
        sample_fee_aud: settings.sample_fee_aud ?? null,
        order_sample_credits: settings.order_sample_credits ?? 2,
        credit_back_days: settings.sample_fee_credit_back_days ?? 90,
        decision_days: settings.decision_days ?? 14,
      },
    };
  });