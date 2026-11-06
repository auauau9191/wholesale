import { base44 } from "@/api/base44Client";
import { toItems } from "@/services/paging";

/** Orders for the signed-in member. Field-level rules hide commission fields. */
export async function listMyOrders(email) {
  if (!email) return [];
  const page = await base44.entities.Order.filter(
    { user_email: email },
    { sort: "-created_date", limit: 50 }
  );
  return toItems(page);
}

export async function getOrder(orderNo) {
  const page = await base44.entities.Order.filter({ order_no: orderNo }, { limit: 1 });
  return toItems(page)[0] ?? null;
}

/** Staff: every order matching a status, optionally scoped to one hub's route. */
export async function listOrders({ status, hubCode, limit = 50 } = {}) {
  const query = {};
  if (status) query.status = status;
  if (hubCode && hubCode !== "ALL") query.delivery_route = `via_${hubCode}`;
  const page = await base44.entities.Order.filter(query, {
    sort: "-created_date",
    limit,
  });
  return toItems(page);
}