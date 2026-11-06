import { base44 } from "@/api/base44Client";
import { toItems } from "@/services/paging";

/** The live catalogue: categories a member can browse. */
export async function listLiveCategories() {
  const page = await base44.entities.Category.filter(
    { is_live: true },
    { sort: "sort_order", limit: 100 }
  );
  return toItems(page);
}

export async function listLiveProducts({ categoryCode, supplierCode, limit = 60 } = {}) {
  const query = { status: "live" };
  if (categoryCode) query.category_code = categoryCode;
  if (supplierCode) query.supplier_code = supplierCode;
  const page = await base44.entities.Product.filter(query, {
    sort: "-created_date",
    limit,
  });
  return toItems(page);
}

export async function getProduct(productId) {
  if (!productId) return null;
  const page = await base44.entities.Product.filter({ product_id: productId }, { limit: 1 });
  return toItems(page)[0] ?? null;
}

export async function getLiveSupplier(supplierCode) {
  if (!supplierCode) return null;
  const page = await base44.entities.Supplier.filter(
    { supplier_code: supplierCode },
    { limit: 1 }
  );
  return toItems(page)[0] ?? null;
}

export async function listSpecRevisions(productId) {
  if (!productId) return [];
  const page = await base44.entities.SpecRevision.filter(
    { product_id: productId },
    { sort: "-created_date", limit: 20 }
  );
  return toItems(page);
}

/** Live suppliers, best verification score first. */
export async function listLiveSuppliers({ categoryCode, limit = 100 } = {}) {
  const page = await base44.entities.Supplier.filter(
    { pipeline_stage: "live" },
    { sort: "-verification_score", limit }
  );
  const items = toItems(page).sort(
    (a, b) => (b.verification_score ?? 0) - (a.verification_score ?? 0)
  );
  return categoryCode
    ? items.filter((supplier) => (supplier.category_codes ?? []).includes(categoryCode))
    : items;
}

export async function getCategory(code) {
  if (!code) return null;
  const page = await base44.entities.Category.filter({ code }, { limit: 1 });
  return toItems(page)[0] ?? null;
}

/** By product name, product ID or supplier code. */
export async function searchProducts(term, limit = 8) {
  const value = term.trim();
  if (value.length < 2) return [];
  const page = await base44.entities.Product.filter(
    {
      status: "live",
      $or: [
        { name: { $regex: value, $options: "i" } },
        { product_id: { $regex: value, $options: "i" } },
        { supplier_code: { $regex: value, $options: "i" } },
      ],
    },
    { limit }
  );
  return toItems(page);
}