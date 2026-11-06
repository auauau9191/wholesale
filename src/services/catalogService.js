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

export async function listLiveProducts({ categoryCode, supplierCode, limit = 24 } = {}) {
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
  const page = await base44.entities.Product.filter({ product_id: productId }, { limit: 1 });
  return toItems(page)[0] ?? null;
}

export async function getLiveSupplier(supplierCode) {
  const page = await base44.entities.Supplier.filter(
    { supplier_code: supplierCode },
    { limit: 1 }
  );
  return toItems(page)[0] ?? null;
}

export async function listSpecRevisions(productId) {
  const page = await base44.entities.SpecRevision.filter(
    { product_id: productId },
    { sort: "-created_date", limit: 20 }
  );
  return toItems(page);
}