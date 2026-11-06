import { toItems } from "@/services/paging";
import { orderCost } from "@/services/pricing";
import { fail } from "@/lib/samples.server";

export const QTY_STEP = 500;
const ADMIN_FIELDS = ["commission_rate", "commission_aud", "supplier_payout_total_aud"];

export const first = async (promise) => toItems(await promise)[0] ?? null;

export const loadProduct = (db, productId) =>
  first(db.entities.Product.filter({ product_id: productId }, { limit: 1 }));

export const loadSupplier = (db, code) =>
  first(db.entities.Supplier.filter({ supplier_code: code }, { limit: 1 }));

/** Members never see what the supplier pays us. */
export function forMember(order) {
  const copy = { ...order };
  for (const field of ADMIN_FIELDS) delete copy[field];
  return copy;
}

export function defaultQuantity(product) {
  const moq = Math.ceil((Number(product.moq) || QTY_STEP) / QTY_STEP) * QTY_STEP;
  return moq <= 5000 ? 5000 : moq;
}

/** Every number of an order. Quantity at least MOQ, in steps of 500. */
export function quoteNumbers(product, supplier, settings, quantity) {
  const moq = Number(product.moq) || QTY_STEP;
  if (!Number.isInteger(quantity) || quantity < moq) throw fail(`The minimum order is ${moq.toLocaleString("en-AU")} units.`);
  if (quantity % QTY_STEP !== 0) throw fail(`Order in steps of ${QTY_STEP} units.`);
  const cost = orderCost(product, quantity, settings);
  const commissionRate = supplier?.commission_rate ?? settings.supplier_commission_rate ?? 0;
  const commission = Math.round(cost.goods * commissionRate);
  return {
    quantity,
    unit_fob_usd: cost.unitFob,
    fx_rate: cost.fx,
    goods_aud: cost.goods,
    buyer_fee_aud: cost.buyerFee,
    inspection_aud: cost.inspection,
    total_aud: cost.total,
    deposit_aud: cost.deposit,
    balance_aud: cost.balance,
    commission_rate: commissionRate,
    commission_aud: commission,
    supplier_payout_total_aud: cost.goods - commission,
  };
}

/** The member's own sample request, and only once they approved it. */
export async function approvedRequest(db, email, requestId) {
  const request = await db.entities.SampleRequest.get(requestId).catch((error) => {
    if (error.status === 404) return null;
    throw error;
  });
  if (!request || request.user_email !== email) throw fail("That sample isn't yours.", 404);
  if (request.decision !== "approve") throw fail("You can order once you've approved the sample.", 409);
  return request;
}

async function nextNo(entity, field, prefix) {
  const recent = toItems(await entity.list("-created_date", 200));
  const top = recent.reduce((max, row) => {
    const n = Number(String(row[field] ?? "").replace(/\D/g, ""));
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return `${prefix}-${String(top + 1).padStart(4, "0")}`;
}

export const nextOrderNo = (db) => nextNo(db.entities.Order, "order_no", "WS");
export const nextPayoutNo = (db) => nextNo(db.entities.SupplierPayout, "payout_no", "PO");

/**
 * deposit: gross = round(goods × deposit rate), nothing withheld.
 * balance: gross = goods − deposit gross, commission withheld.
 * So deposit net + balance net = supplier_payout_total_aud.
 */
export function payoutNumbers(order, settings, stage, depositPayout) {
  if (stage === "deposit") {
    const gross = Math.round(order.goods_aud * (Number(settings.deposit_rate) || 0));
    return { gross_aud: gross, commission_withheld_aud: 0, net_aud: gross };
  }
  const gross = order.goods_aud - depositPayout.gross_aud;
  const withheld = order.commission_aud ?? 0;
  return { gross_aud: gross, commission_withheld_aud: withheld, net_aud: gross - withheld };
}