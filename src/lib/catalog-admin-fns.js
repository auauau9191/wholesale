import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { toItems } from "@/services/paging";
import { fail, loadSettings, today } from "@/lib/samples.server";
import { allRows } from "@/lib/console.server";

const requireAdmin = (context) => {
  if (context.user.role !== "admin") throw fail("Only an admin can do that.", 403);
};

/** Every product with its supplier, category and stock, for the catalogue table. */
export const getProductList = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    const [products, suppliers, categories, units] = await Promise.all([
      allRows(db.entities.Product, {}),
      allRows(db.entities.Supplier, {}),
      allRows(db.entities.Category, {}),
      allRows(db.entities.SampleUnit, {}),
    ]);
    const supplierBy = Object.fromEntries(suppliers.map((row) => [row.supplier_code, row.headline ?? row.supplier_code]));
    const categoryBy = Object.fromEntries(categories.map((row) => [row.code, row.name]));
    const stock = {};
    for (const unit of units) {
      if (unit.is_master) continue;
      const entry = (stock[unit.product_id] ??= { in_stock: 0, total: 0 });
      entry.total += 1;
      if (unit.status === "in_stock") entry.in_stock += 1;
    }
    return {
      rows: products
        .map((product) => ({
          product_id: product.product_id,
          name: product.name,
          supplier_code: product.supplier_code,
          supplier: supplierBy[product.supplier_code] ?? product.supplier_code,
          category: categoryBy[product.category_code] ?? product.category_code,
          status: product.status,
          moq: product.moq ?? null,
          tiers: product.price_tiers?.length ?? 0,
          revision: product.current_spec_revision ?? null,
          master_hub: product.master_hub ?? null,
          on_shelf: stock[product.product_id]?.in_stock ?? 0,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      suppliers: suppliers
        .map((row) => ({ code: row.supplier_code, label: row.headline ?? row.supplier_code }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      categories: categories
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((row) => ({ code: row.code, name: row.name })),
    };
  });

/** Everything the product editor edits, plus each revision's stock. */
export const getProductEditor = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ product_id: z.string().trim().min(1).max(60) }))
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    const product = toItems(await db.entities.Product.filter({ product_id: data.product_id }, { limit: 1 }))[0];
    if (!product) return null;
    const [revisions, units, suppliers, categories, settings] = await Promise.all([
      allRows(db.entities.SpecRevision, { product_id: data.product_id }),
      allRows(db.entities.SampleUnit, { product_id: data.product_id }),
      allRows(db.entities.Supplier, {}),
      allRows(db.entities.Category, {}),
      loadSettings(db),
    ]);
    return {
      product,
      revisions: revisions.sort((a, b) => String(b.created_date).localeCompare(String(a.created_date))),
      units: units.map((unit) => ({ unit_id: unit.unit_id, revision: unit.revision, status: unit.status, hub_code: unit.hub_code, is_master: Boolean(unit.is_master) })),
      suppliers: suppliers.map((row) => ({ code: row.supplier_code, label: row.headline ?? row.supplier_code })),
      categories: categories
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((row) => ({ code: row.code, name: row.name })),
      settings,
    };
  });

const Colour = z.object({ name: z.string().trim().min(1).max(60), hex: z.string().trim().max(10) });
const Tier = z.object({ min_qty: z.number().int().min(1), max_qty: z.number().int().min(0).nullable().optional(), fob_usd: z.number().min(0) });
const TestReport = z.object({ name: z.string().trim().min(1).max(120), expires_on: z.string().trim().max(20).optional() });

const ProductPatch = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  short_description: z.string().trim().max(600).optional(),
  photo_urls: z.array(z.string().trim().max(500)).max(12).optional(),
  colours: z.array(Colour).max(30).optional(),
  moq: z.number().int().min(1).max(1_000_000).optional(),
  lead_time_days: z.number().int().min(0).max(365).optional(),
  price_tiers: z.array(Tier).max(12).optional(),
  incoterm_port: z.string().trim().max(60).optional(),
  freight_aud_per_unit_estimate: z.number().min(0).max(100_000).optional(),
  hs_code_indicative: z.string().trim().max(30).optional(),
  has_chafta_origin_cert: z.boolean().optional(),
  safety_flags: z.array(z.string().trim().max(80)).max(12).optional(),
  biosecurity_flags: z.array(z.string().trim().max(80)).max(12).optional(),
  test_reports: z.array(TestReport).max(20).optional(),
  master_hub: z.enum(["BNE", "SYD"]).optional(),
  category_code: z.string().trim().max(10).optional(),
  supplier_code: z.string().trim().max(10).optional(),
  status: z.enum(["draft", "live", "sample_unavailable", "retired"]).optional(),
});

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ product_id: z.string().trim().min(1).max(60), patch: ProductPatch }))
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    const product = toItems(await db.entities.Product.filter({ product_id: data.product_id }, { limit: 1 }))[0];
    if (!product) throw fail("That product no longer exists.", 404);
    const patch = Object.fromEntries(Object.entries(data.patch).filter(([, value]) => value !== undefined));
    if (patch.price_tiers) {
      const sorted = [...patch.price_tiers].sort((a, b) => a.min_qty - b.min_qty);
      if (sorted.some((tier, index) => index > 0 && tier.min_qty <= sorted[index - 1].min_qty)) {
        throw fail("Each price tier has to start above the one before it.");
      }
      patch.price_tiers = sorted;
    }
    return db.entities.Product.update(product.id, patch);
  });

/**
 * A new revision supersedes every earlier one and becomes current. Sample units
 * still on an older revision are reported back so they can be retired.
 */
export const createSpecRevision = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      product_id: z.string().trim().min(1).max(60),
      revision: z.string().trim().min(1).max(10),
      materials: z.string().trim().max(400).optional(),
      dimensions_mm: z.string().trim().max(120).optional(),
      weight_g: z.number().min(0).max(1_000_000).nullable().optional(),
      colour_pantone: z.string().trim().max(120).optional(),
      finish: z.string().trim().max(160).optional(),
      tolerances: z.string().trim().max(300).optional(),
      packaging: z.string().trim().max(300).optional(),
      labelling: z.string().trim().max(300).optional(),
      signed_date: z.string().trim().max(20).optional(),
      document_url: z.string().trim().max(500).optional(),
      status: z.enum(["draft", "signed"]).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    const product = toItems(await db.entities.Product.filter({ product_id: data.product_id }, { limit: 1 }))[0];
    if (!product) throw fail("That product no longer exists.", 404);
    const existing = await allRows(db.entities.SpecRevision, { product_id: data.product_id });
    if (existing.some((row) => row.revision === data.revision)) throw fail(`Revision ${data.revision} already exists.`, 409);
    if (data.status !== "draft" && !data.signed_date) throw fail("A signed revision needs its signed date.");

    await db.entities.SpecRevision.updateMany(
      { product_id: data.product_id, status: { $in: ["draft", "signed"] } },
      { $set: { status: "superseded" } }
    );
    const created = await db.entities.SpecRevision.create({
      product_id: data.product_id,
      revision: data.revision,
      materials: data.materials,
      dimensions_mm: data.dimensions_mm,
      weight_g: data.weight_g ?? undefined,
      colour_pantone: data.colour_pantone,
      finish: data.finish,
      tolerances: data.tolerances,
      packaging: data.packaging,
      labelling: data.labelling,
      signed_date: data.signed_date,
      document_url: data.document_url,
      status: data.status === "draft" ? "draft" : "signed",
      is_demo: false,
    });
    await db.entities.Product.update(product.id, { current_spec_revision: data.revision });

    const units = toItems(await db.entities.SampleUnit.filter({ product_id: data.product_id }, { limit: 500 }));
    const stale = units.filter(
      (unit) => !unit.is_master && unit.revision !== data.revision && ["in_stock", "reserved", "qc_hold", "in_transit"].includes(unit.status)
    );
    return {
      revision: created,
      previous: product.current_spec_revision ?? null,
      stale_units: stale.map((unit) => ({ unit_id: unit.unit_id, revision: unit.revision, hub_code: unit.hub_code })),
      checked_on: today(),
    };
  });