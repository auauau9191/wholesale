import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { toItems } from "@/services/paging";
import { fail, loadSettings, today } from "@/lib/samples.server";
import { allRows } from "@/lib/console.server";
import { listingFeeCurrent, liveGaps, scoreTotal, STAGE_LABEL, STAGES } from "@/lib/supplier-rules";

const requireAdmin = (context) => {
  if (context.user.role !== "admin") throw fail("Only an admin can do that.", 403);
};

const cardOf = (supplier, gaps, productCount) => ({
  id: supplier.id,
  supplier_code: supplier.supplier_code,
  headline: supplier.headline ?? supplier.supplier_code,
  place: [supplier.city, supplier.province].filter(Boolean).join(", "),
  category_codes: supplier.category_codes ?? [],
  pipeline_stage: supplier.pipeline_stage,
  verification_score: supplier.verification_score ?? 0,
  agreement_status: supplier.agreement_status ?? "none",
  visit_date: supplier.visit_date ?? null,
  product_count: productCount,
  gaps,
});

/** The board: every supplier, the stock they have, and what blocks them from live. */
export const getSupplierBoard = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    const [suppliers, categories, products, units] = await Promise.all([
      allRows(db.entities.Supplier, {}),
      allRows(db.entities.Category, {}),
      allRows(db.entities.Product, {}),
      allRows(db.entities.SampleUnit, { status: "in_stock" }),
    ]);
    const stocked = new Set(units.filter((unit) => !unit.is_master).map((unit) => unit.product_id));
    const bySupplier = {};
    for (const product of products) (bySupplier[product.supplier_code] ??= []).push(product.product_id);
    const todayIso = today();

    return {
      rows: suppliers
        .map((supplier) => {
          const ids = bySupplier[supplier.supplier_code] ?? [];
          const gaps = liveGaps(supplier, {
            feePaid: listingFeeCurrent(supplier, todayIso),
            hasStock: ids.some((id) => stocked.has(id)),
          });
          return cardOf(supplier, gaps, ids.length);
        })
        .sort((a, b) => a.headline.localeCompare(b.headline)),
      categories: categories
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((row) => ({ code: row.code, name: row.name })),
    };
  });

/** Drag a card: only Live is gated, and every move leaves a note. */
export const moveSupplierStage = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      supplier_id: z.string().trim().min(1).max(60),
      to_stage: z.enum([...STAGES, "rejected"]),
      note: z.string().trim().max(500).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    const supplier = await db.entities.Supplier.get(data.supplier_id);
    if (supplier.pipeline_stage === data.to_stage) return { ok: true, gaps: [] };

    if (data.to_stage === "live") {
      const products = toItems(await db.entities.Product.filter({ supplier_code: supplier.supplier_code }, { limit: 200 }));
      const ids = products.map((row) => row.product_id);
      const units = ids.length
        ? toItems(await db.entities.SampleUnit.filter({ product_id: { $in: ids }, status: "in_stock" }, { limit: 500 }))
        : [];
      const gaps = liveGaps(supplier, {
        feePaid: listingFeeCurrent(supplier, today()),
        hasStock: units.some((unit) => !unit.is_master),
      });
      if (gaps.length) return { ok: false, gaps };
    }

    await db.entities.Supplier.update(supplier.id, { pipeline_stage: data.to_stage });
    await db.entities.SupplierNote.create({
      supplier_code: supplier.supplier_code,
      from_stage: supplier.pipeline_stage ?? null,
      to_stage: data.to_stage,
      note: data.note || `Moved from ${STAGE_LABEL[supplier.pipeline_stage] ?? "new"} to ${STAGE_LABEL[data.to_stage]}.`,
      by_email: context.user.email,
      at: new Date().toISOString(),
    });
    return { ok: true, gaps: [] };
  });

/** One supplier with its films, checks, scores, money terms and notes. */
export const getSupplierEditor = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ code: z.string().trim().min(1).max(20) }))
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    const supplier = toItems(await db.entities.Supplier.filter({ supplier_code: data.code }, { limit: 1 }))[0];
    if (!supplier) return null;
    const [notes, categories, products, settings] = await Promise.all([
      allRows(db.entities.SupplierNote, { supplier_code: data.code }),
      allRows(db.entities.Category, {}),
      allRows(db.entities.Product, { supplier_code: data.code }),
      loadSettings(db),
    ]);
    const ids = products.map((row) => row.product_id);
    const units = ids.length
      ? toItems(await db.entities.SampleUnit.filter({ product_id: { $in: ids }, status: "in_stock" }, { limit: 500 }))
      : [];
    const gaps = liveGaps(supplier, {
      feePaid: listingFeeCurrent(supplier, today()),
      hasStock: units.some((unit) => !unit.is_master),
    });
    return {
      supplier,
      notes: notes.sort((a, b) => String(b.at ?? b.created_date).localeCompare(String(a.at ?? a.created_date))),
      categories: categories
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((row) => ({ code: row.code, name: row.name })),
      products: products.map((row) => ({ product_id: row.product_id, name: row.name, status: row.status })),
      gaps,
      default_commission: settings.supplier_commission_rate ?? 0.05,
    };
  });

const SupplierPatch = z.object({
  headline: z.string().trim().max(160).optional(),
  supplier_type: z.enum(["factory", "trading_company"]).optional(),
  province: z.string().trim().max(60).optional(),
  city: z.string().trim().max(60).optional(),
  exporting_since_year: z.number().int().min(1900).max(2100).nullable().optional(),
  staff_count: z.number().int().min(0).max(1_000_000).nullable().optional(),
  production_lines: z.string().trim().max(200).optional(),
  category_codes: z.array(z.string().trim().max(10)).max(20).optional(),
  legal_name: z.string().trim().max(160).optional(),
  contact_name: z.string().trim().max(120).optional(),
  contact_email: z.string().trim().max(160).optional(),
  contact_wechat: z.string().trim().max(80).optional(),
  internal_notes: z.string().trim().max(2000).optional(),
  visit_date: z.string().trim().max(20).optional(),
  filmed_date: z.string().trim().max(20).optional(),
  checks_passed: z.array(z.string().trim().max(120)).max(12).optional(),
  score_capability: z.number().min(0).max(20).optional(),
  score_quality: z.number().min(0).max(20).optional(),
  score_communication: z.number().min(0).max(20).optional(),
  score_compliance: z.number().min(0).max(20).optional(),
  score_export: z.number().min(0).max(20).optional(),
  video_url: z.string().trim().max(300).optional(),
  video_chapters: z
    .array(z.object({ title: z.string().trim().max(80), start_seconds: z.number().min(0) }))
    .max(30)
    .optional(),
  agreement_status: z.enum(["none", "sent", "signed"]).optional(),
  non_circumvention_signed: z.boolean().optional(),
  commission_rate: z.number().min(0).max(1).nullable().optional(),
  listing_fee_paid_until: z.string().trim().max(20).optional(),
  listing_fee_waived: z.boolean().optional(),
  payout_currency: z.enum(["CNY", "USD"]).optional(),
  payout_method: z.enum(["airwallex", "bank_wire"]).optional(),
  payout_account_ref: z.string().trim().max(120).optional(),
});

/** Admin saves one block at a time; the scorecard total is always recomputed. */
export const saveSupplier = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ supplier_id: z.string().trim().min(1).max(60), patch: SupplierPatch }))
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    const supplier = await db.entities.Supplier.get(data.supplier_id);
    const patch = Object.fromEntries(Object.entries(data.patch).filter(([, value]) => value !== undefined));
    const merged = { ...supplier, ...patch };
    if ("score_capability" in patch || "score_quality" in patch || "score_communication" in patch || "score_compliance" in patch || "score_export" in patch) {
      patch.verification_score = scoreTotal(merged);
    }
    return db.entities.Supplier.update(supplier.id, patch);
  });

export const addSupplierNote = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ supplier_code: z.string().trim().min(1).max(20), note: z.string().trim().min(1).max(500) }))
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    return db.entities.SupplierNote.create({
      supplier_code: data.supplier_code,
      note: data.note,
      by_email: context.user.email,
      at: new Date().toISOString(),
    });
  });