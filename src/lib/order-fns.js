import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { toItems } from "@/services/paging";
import { fail, loadProfile, loadSettings } from "@/lib/samples.server";
import { isMembershipActive } from "@/lib/membership";
import {
  approvedRequest,
  defaultQuantity,
  first,
  forMember,
  loadProduct,
  loadSupplier,
  nextOrderNo,
  nextPayoutNo,
  payoutNumbers,
  QTY_STEP,
  quoteNumbers,
} from "@/lib/orders.server";

const Id = z.string().trim().min(1).max(60);
const Quantity = z.number().int().min(1).max(10_000_000);

const requireAdmin = (context) => {
  if (context.user.role !== "admin") throw fail("Only staff can do that.", 403);
};

/** What the order builder shows: the approved sample, its unit, spec and tolerances. */
export const getOrderBuilder = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ request_id: Id }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const request = await approvedRequest(db, context.user.email, data.request_id);
    const product = await loadProduct(db, request.product_id);
    if (!product) throw fail("That product is no longer listed.", 404);
    const [unit, revision] = await Promise.all([
      first(db.entities.SampleUnit.filter({ unit_id: request.unit_id }, { limit: 1 })),
      first(db.entities.SpecRevision.filter({ product_id: product.product_id, revision: product.current_spec_revision }, { limit: 1 })),
    ]);
    return {
      request_id: request.id,
      request_no: request.request_no,
      product_id: product.product_id,
      product_name: product.name,
      colour: unit?.colour ?? null,
      unit_id: request.unit_id,
      approved_on: request.updated_date,
      spec_revision: product.current_spec_revision ?? null,
      tolerances: [revision?.tolerances, revision?.colour_pantone].filter(Boolean).join(" · ") || null,
      moq: product.moq ?? QTY_STEP,
      step: QTY_STEP,
      default_quantity: defaultQuantity(product),
    };
  });

/** Member-facing quote. The commission fields never leave the server. */
export const quoteOrder = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ product_id: Id, quantity: Quantity }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const product = await loadProduct(db, data.product_id);
    if (!product || product.status === "retired") throw fail("That product is no longer listed.", 404);
    const [supplier, settings] = await Promise.all([loadSupplier(db, product.supplier_code), loadSettings(db)]);
    return forMember(quoteNumbers(product, supplier, settings, data.quantity));
  });

/** Re-checks the approval, freezes every number and opens the order at deposit due. */
export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ sample_request_id: Id, quantity: Quantity }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const email = context.user.email;
    if (!isMembershipActive(await loadProfile(db, email))) throw fail("Your membership needs to be active to order.", 403);
    const request = await approvedRequest(db, email, data.sample_request_id);
    const product = await loadProduct(db, request.product_id);
    if (!product || product.status === "retired") throw fail("That product is no longer listed.", 404);
    const [supplier, settings, unit] = await Promise.all([
      loadSupplier(db, product.supplier_code),
      loadSettings(db),
      first(db.entities.SampleUnit.filter({ unit_id: request.unit_id }, { limit: 1 })),
    ]);
    const numbers = quoteNumbers(product, supplier, settings, data.quantity);
    const orderNo = await nextOrderNo(db);

    const order = await db.entities.Order.create({
      order_no: orderNo,
      user_email: email,
      product_id: product.product_id,
      supplier_code: product.supplier_code,
      spec_revision: product.current_spec_revision,
      approved_unit_id: request.unit_id,
      sample_request_no: request.request_no,
      colour: unit?.colour,
      ...numbers,
      delivery_route: `via_${request.hub_code}`,
      status: "deposit_pending",
      inspection_attempts: 0,
      credits_granted: false,
      timeline: [
        {
          status: "deposit_pending",
          at: new Date().toISOString(),
          note: `Order placed, locked to unit ${request.unit_id} and spec ${product.current_spec_revision}.`,
        },
      ],
      is_demo: false,
    });
    return forMember(order);
  });

async function withProductNames(db, orders) {
  const ids = [...new Set(orders.map((row) => row.product_id))];
  const products = ids.length ? toItems(await db.entities.Product.filter({ product_id: { $in: ids } }, { limit: 100 })) : [];
  const names = Object.fromEntries(products.map((row) => [row.product_id, row.name]));
  return orders.map((row) => ({ ...forMember(row), product_name: names[row.product_id] ?? row.product_id }));
}

export const getMyOrders = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const db = context.getBase44().asServiceRole;
    const orders = toItems(await db.entities.Order.filter({ user_email: context.user.email }, { sort: "-created_date", limit: 50 }));
    return withProductNames(db, orders);
  });

export const getMyOrder = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ order_no: z.string().trim().min(1).max(20) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const order = await first(db.entities.Order.filter({ order_no: data.order_no, user_email: context.user.email }, { limit: 1 }));
    if (!order) return null;
    const [named] = await withProductNames(db, [order]);
    return named;
  });

/** Admin: one payout per stage per order. Deposit and balance nets sum to the supplier total. */
export const schedulePayouts = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ order_id: Id, stage: z.enum(["deposit", "balance"]) }))
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    const order = await db.entities.Order.get(data.order_id);
    const existing = toItems(await db.entities.SupplierPayout.filter({ order_no: order.order_no }, { limit: 10 }));
    const same = existing.find((row) => row.stage === data.stage);
    if (same) return same;
    const deposit = existing.find((row) => row.stage === "deposit");
    if (data.stage === "balance" && !deposit) throw fail("Schedule the deposit payout first.", 409);

    const [settings, supplier] = await Promise.all([loadSettings(db), loadSupplier(db, order.supplier_code)]);
    const numbers = payoutNumbers(order, settings, data.stage, deposit);
    const currency = supplier?.payout_currency ?? "USD";
    return db.entities.SupplierPayout.create({
      payout_no: await nextPayoutNo(db),
      supplier_code: order.supplier_code,
      order_no: order.order_no,
      stage: data.stage,
      ...numbers,
      currency,
      fx_rate: order.fx_rate,
      amount_foreign: currency === "USD" && order.fx_rate ? Math.round((numbers.net_aud / order.fx_rate) * 100) / 100 : undefined,
      status: "scheduled",
      is_demo: false,
    });
  });

/** Admin, on "Deposit received": the order's free sample credits, never twice. */
export const grantOrderCredits = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ order_id: Id }))
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    const order = await db.entities.Order.get(data.order_id);
    if (order.credits_granted) return { granted: false };
    const already = toItems(await db.entities.CreditLedger.filter({ reason: "order_placed", related_id: order.order_no }, { limit: 1 }));
    if (!already.length) {
      const settings = await loadSettings(db);
      await db.entities.CreditLedger.create({
        user_email: order.user_email,
        change: settings.order_sample_credits ?? 2,
        reason: "order_placed",
        related_id: order.order_no,
        note: `Bulk order ${order.order_no}.`,
      });
    }
    await db.entities.Order.update(order.id, { credits_granted: true });
    return { granted: true };
  });