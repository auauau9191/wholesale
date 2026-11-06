import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { toItems } from "@/services/paging";
import { fail } from "@/lib/samples.server";
import { allRows, requireStaff } from "@/lib/console.server";
import { createPayout, grantOrderCreditsOnce } from "@/lib/orders.server";

import { ORDER_NEXT } from "@/lib/orderActionLabels";

const MONEY = ["commission_rate", "commission_aud", "supplier_payout_total_aud"];
const forStaff = (order) => {
  const copy = { ...order };
  for (const field of MONEY) delete copy[field];
  return copy;
};

async function names(db, rows) {
  const supplierCodes = [...new Set(rows.map((row) => row.supplier_code).filter(Boolean))];
  const productIds = [...new Set(rows.map((row) => row.product_id).filter(Boolean))];
  const emails = [...new Set(rows.map((row) => row.user_email).filter(Boolean))];
  const [suppliers, products, profiles] = await Promise.all([
    supplierCodes.length ? allRows(db.entities.Supplier, { supplier_code: { $in: supplierCodes } }) : [],
    productIds.length ? allRows(db.entities.Product, { product_id: { $in: productIds } }) : [],
    emails.length ? allRows(db.entities.MemberProfile, { user_email: { $in: emails } }) : [],
  ]);
  return {
    supplier: Object.fromEntries(suppliers.map((row) => [row.supplier_code, row])),
    product: Object.fromEntries(products.map((row) => [row.product_id, row])),
    member: Object.fromEntries(profiles.map((row) => [row.user_email, row])),
  };
}

export const getAdminOrders = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    requireStaff(context.user);
    const db = context.getBase44().asServiceRole;
    const orders = await allRows(db.entities.Order, {});
    const lookup = await names(db, orders);
    return orders
      .sort((a, b) => String(b.created_date).localeCompare(String(a.created_date)))
      .map((order) => ({
        id: order.id,
        order_no: order.order_no,
        status: order.status,
        quantity: order.quantity,
        total_aud: order.total_aud,
        created_date: order.created_date,
        supplier_code: order.supplier_code,
        supplier: lookup.supplier[order.supplier_code]?.headline ?? order.supplier_code,
        product_name: lookup.product[order.product_id]?.name ?? order.product_id,
        member: lookup.member[order.user_email]?.business_name ?? order.user_email,
        next: ORDER_NEXT[order.status]?.[0] ?? null,
      }));
  });

export const getAdminOrder = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ order_no: z.string().trim().min(1).max(20) }))
  .handler(async ({ data, context }) => {
    requireStaff(context.user);
    const db = context.getBase44().asServiceRole;
    const order = toItems(await db.entities.Order.filter({ order_no: data.order_no }, { limit: 1 }))[0];
    if (!order) return null;
    const [lookup, payouts] = await Promise.all([
      names(db, [order]),
      allRows(db.entities.SupplierPayout, { order_no: order.order_no }),
    ]);
    const admin = context.user.role === "admin";
    const supplier = lookup.supplier[order.supplier_code] ?? {};
    const member = lookup.member[order.user_email] ?? {};
    return {
      order: admin ? order : forStaff(order),
      admin,
      product: lookup.product[order.product_id] ?? null,
      supplier: {
        code: order.supplier_code,
        headline: supplier.headline ?? order.supplier_code,
        legal_name: admin ? supplier.legal_name ?? null : null,
        contact_email: admin ? supplier.contact_email ?? null : null,
        payout_currency: admin ? supplier.payout_currency ?? null : null,
      },
      member: { business_name: member.business_name ?? order.user_email, email: order.user_email, abn: member.abn ?? null },
      payouts,
      actions: ORDER_NEXT[order.status] ?? [],
    };
  });

/** Each action only runs from the status before it, and appends to the timeline. */
export const actOnOrder = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      order_id: z.string().trim().min(1).max(60),
      action: z.enum(["deposit_received", "book_inspection", "inspection_passed", "inspection_failed", "balance_received", "shipped", "delivered"]),
      report_url: z.string().trim().max(500).optional(),
      container_no: z.string().trim().max(60).optional(),
      delivery_route: z.enum(["via_BNE", "via_SYD", "direct"]).optional(),
      note: z.string().trim().max(300).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    requireStaff(context.user);
    const db = context.getBase44().asServiceRole;
    const order = await db.entities.Order.get(data.order_id);
    if (!(ORDER_NEXT[order.status] ?? []).includes(data.action)) {
      throw fail(`${order.order_no} has moved on. Refresh to see where it is.`, 409);
    }

    const at = new Date().toISOString();
    const timeline = [...(order.timeline ?? [])];
    const add = (status, note) => timeline.push({ status, at, note });
    let patch = {};
    let extra = "";

    if (data.action === "deposit_received") {
      patch = { status: "in_production" };
      add("deposit_received", "Deposit received.");
    } else if (data.action === "book_inspection") {
      patch = { status: "inspection_booked" };
      add("inspection_booked", data.note || "Pre-shipment inspection booked.");
    } else if (data.action === "inspection_passed") {
      patch = { status: "inspection_passed" };
      add("inspection_passed", data.note || "Inspection passed.");
    } else if (data.action === "inspection_failed") {
      if (!data.report_url) throw fail("Add the inspection report link first.");
      const attempts = (order.inspection_attempts ?? 0) + 1;
      const second = attempts >= 2;
      patch = {
        status: second ? "cancelled" : "inspection_failed",
        inspection_attempts: attempts,
        inspection_report_url: data.report_url,
      };
      add("inspection_failed", `Inspection ${attempts} failed. ${data.note || ""}`.trim());
      if (second) {
        add("cancelled", "refund deposit");
        extra = "refund deposit";
      }
    } else if (data.action === "balance_received") {
      patch = { status: "balance_received" };
      add("balance_received", "Balance received.");
    } else if (data.action === "shipped") {
      if (!data.container_no || !data.delivery_route) throw fail("Add the container number and the delivery route.");
      patch = { status: "shipped", container_no: data.container_no, delivery_route: data.delivery_route };
      add("shipped", `Shipped in ${data.container_no}.`);
    } else {
      patch = { status: "delivered" };
      add("delivered", "Delivered.");
    }

    const updated = await db.entities.Order.update(order.id, { ...patch, timeline });

    if (data.action === "deposit_received") {
      await grantOrderCreditsOnce(db, updated);
      await createPayout(db, updated, "deposit");
    }
    if (data.action === "inspection_passed") await createPayout(db, updated, "balance");

    return { order: updated, refund_deposit: Boolean(extra) };
  });