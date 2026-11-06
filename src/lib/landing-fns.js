import { createServerFn } from "@tanstack/react-start";
import { toItems } from "@/services/paging";
import { landedLines, orderLines, SHEET_QUANTITIES } from "@/lib/landedSheet";

/** The product the landing page holds up as its example. */
const SHOWCASE_PRODUCT_ID = "PC-CN014-0087";
const SHOWCASE_ORDER_QTY = 5000;

const EMPTY = {
  settings: null,
  product: null,
  supplier: null,
  category: null,
  spec: null,
  unit: null,
  sheets: [],
  order: null,
  shelves: [],
};

/**
 * Everything the public landing page shows, in one read: the example product,
 * its supplier and spec, the shelf unit on its tag, and the figures derived
 * from AppSettings. Only public fields leave this function.
 */
export const getLandingData = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const db = context.getBase44();
  const [settingsPage, productPage] = await Promise.all([
    db.entities.AppSettings.list({ limit: 1 }),
    db.entities.Product.filter({ product_id: SHOWCASE_PRODUCT_ID }, { limit: 1 }),
  ]);
  const settings = toItems(settingsPage)[0] ?? null;
  const product = toItems(productPage)[0] ?? null;
  if (!settings || !product) return EMPTY;

  const [supplierPage, categoryPage, specPage, unitPage, categoryListPage, productListPage, supplierListPage] =
    await Promise.all([
      db.entities.Supplier.filter({ supplier_code: product.supplier_code }, { limit: 1 }),
      db.entities.Category.filter({ code: product.category_code }, { limit: 1 }),
      db.entities.SpecRevision.filter({ product_id: product.product_id }, { sort: "-created_date", limit: 5 }),
      db.entities.SampleUnit.filter({ product_id: product.product_id }, { limit: 40 }),
      db.entities.Category.filter({ is_live: true }, { sort: "sort_order", limit: 20 }),
      db.entities.Product.filter({ status: "live" }, { limit: 100 }),
      db.entities.Supplier.filter({ pipeline_stage: "live" }, { limit: 200 }),
    ]);

  const supplier = toItems(supplierPage)[0] ?? null;
  const category = toItems(categoryPage)[0] ?? null;
  const specs = toItems(specPage);
  const spec = specs.find((row) => row.status === "signed") ?? specs[0] ?? null;
  const units = toItems(unitPage).sort((a, b) => String(a.unit_id).localeCompare(String(b.unit_id)));
  const samples = units.filter((unit) => !unit.is_master);
  const unit =
    samples.find((row) => row.status === "reserved" && row.shelf_location) ??
    samples.find((row) => row.shelf_location) ??
    samples[0] ??
    null;

  const liveProducts = toItems(productListPage);
  const liveSuppliers = toItems(supplierListPage);

  const shelves = toItems(categoryListPage).map((row) => ({
    code: row.code,
    name: row.name,
    suppliers: liveSuppliers.filter((item) => (item.category_codes ?? []).includes(row.code)).length,
    products: liveProducts
      .filter((item) => item.category_code === row.code)
      .slice(0, 3)
      .map((item) => ({
        name: item.name,
        supplier: item.supplier_code,
        moq: item.moq,
        from: Math.min(...(item.price_tiers ?? [{ fob_usd: 0 }]).map((tier) => Number(tier.fob_usd) || 0)),
      })),
  }));

  return {
    settings: {
      fx: settings.fx_usd_to_aud,
      brokerFee: settings.broker_fee_aud,
      inspection: settings.inspection_fee_aud,
      depositRate: settings.deposit_rate,
      commissionRate: settings.supplier_commission_rate,
      buyerFeeRate: settings.buyer_service_fee_rate,
      gstRate: settings.gst_rate,
      dutyRate: settings.default_duty_rate_no_origin_cert,
      dispatchDays: settings.dispatch_business_days,
      decisionDays: settings.decision_days,
      sampleFee: settings.sample_fee_aud,
      starterPrice: settings.starter_quarter_price_aud,
      monthlyPrice: settings.monthly_price_aud,
      annualPrice: settings.annual_price_aud,
    },
    product: {
      id: product.product_id,
      name: product.name,
      short: product.short_description,
      port: product.incoterm_port,
      rev: product.current_spec_revision,
      moq: product.moq,
      leadDays: product.lead_time_days,
      chafta: Boolean(product.has_chafta_origin_cert),
      hsCode: product.hs_code_indicative,
      freight: product.freight_aud_per_unit_estimate,
    },
    supplier: supplier
      ? {
          code: supplier.supplier_code,
          type: supplier.supplier_type,
          city: supplier.city,
          province: supplier.province,
          lines: supplier.production_lines,
          staff: supplier.staff_count,
          score: supplier.verification_score,
          capability: supplier.score_capability,
          quality: supplier.score_quality,
          communication: supplier.score_communication,
          compliance: supplier.score_compliance,
          exportScore: supplier.score_export,
          exportingSince: supplier.exporting_since_year,
          checks: supplier.checks_passed ?? [],
          visited: supplier.visit_date,
          filmed: supplier.filmed_date,
          headline: supplier.headline,
          chapters: supplier.video_chapters ?? [],
        }
      : null,
    category: category ? { code: category.code, name: category.name } : null,
    spec: spec
      ? {
          rev: spec.revision,
          signed: spec.signed_date,
          materials: spec.materials,
          dimensions: spec.dimensions_mm,
          weight: spec.weight_g,
          finish: spec.finish,
          colour: spec.colour_pantone,
          tolerances: spec.tolerances,
          packaging: spec.packaging,
          labelling: spec.labelling,
        }
      : null,
    unit: unit
      ? {
          id: unit.unit_id,
          label: String(unit.unit_id).split("-").pop(),
          of: samples.length,
          shelf: unit.shelf_location,
          hub: unit.hub_code,
          colour: unit.colour,
          status: unit.status,
        }
      : null,
    sheets: SHEET_QUANTITIES.map((qty) => ({
      qty,
      unit: landedLines(product, settings, qty),
      order: orderLines(product, settings, qty),
    })),
    order: orderLines(product, settings, SHOWCASE_ORDER_QTY),
    shelves,
  };
});