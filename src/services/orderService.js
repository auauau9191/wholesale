import { base44 } from "@/api/base44Client";
import { toItems } from "@/services/paging";
import {
  createOrder,
  getMyOrder,
  getMyOrders,
  getOrderBuilder,
  grantOrderCredits,
  quoteOrder,
  schedulePayouts,
} from "@/lib/order-fns";

/** Every price, total and status runs on the server; these only call it. */
export const fetchOrderBuilder = (requestId) => getOrderBuilder({ data: { request_id: requestId } });
export const fetchQuote = (productId, quantity) => quoteOrder({ data: { product_id: productId, quantity } });
export const placeOrder = (requestId, quantity) =>
  createOrder({ data: { sample_request_id: requestId, quantity } });
export const fetchMyOrders = () => getMyOrders();
export const fetchMyOrder = (orderNo) => getMyOrder({ data: { order_no: orderNo } });

/** Staff console actions. */
export const scheduleSupplierPayout = (orderId, stage) => schedulePayouts({ data: { order_id: orderId, stage } });
export const grantCreditsForOrder = (orderId) => grantOrderCredits({ data: { order_id: orderId } });

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