import { base44 } from "@/api/base44Client";
import { toItems } from "@/services/paging";

/** Admin: supplier payouts, newest first, optionally for one supplier. */
export async function listPayouts({ supplierCode, limit = 50 } = {}) {
  const query = {};
  if (supplierCode) query.supplier_code = supplierCode;
  const page = await base44.entities.SupplierPayout.filter(query, {
    sort: "-created_date",
    limit,
  });
  return toItems(page);
}