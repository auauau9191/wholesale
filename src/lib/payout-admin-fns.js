import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { fail } from "@/lib/samples.server";
import { allRows } from "@/lib/console.server";

const requireAdmin = (context) => {
  if (context.user.role !== "admin") throw fail("Only an admin can do that.", 403);
};

export const PAYOUT_STATUS = ["scheduled", "sent", "confirmed"];

/** Every payout, with the supplier and order it belongs to. */
export const getPayouts = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    const [payouts, suppliers, orders] = await Promise.all([
      allRows(db.entities.SupplierPayout, {}),
      allRows(db.entities.Supplier, {}),
      allRows(db.entities.Order, {}),
    ]);
    const supplierBy = Object.fromEntries(suppliers.map((row) => [row.supplier_code, row]));
    const orderBy = Object.fromEntries(orders.map((row) => [row.order_no, row]));
    return {
      rows: payouts
        .map((payout) => ({
          ...payout,
          supplier: supplierBy[payout.supplier_code]?.headline ?? payout.supplier_code,
          order_total_aud: orderBy[payout.order_no]?.total_aud ?? null,
        }))
        .sort((a, b) => String(a.status).localeCompare(String(b.status)) || String(b.created_date).localeCompare(String(a.created_date))),
      suppliers: suppliers
        .map((row) => ({ code: row.supplier_code, label: row.headline ?? row.supplier_code }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    };
  });

export const markPayoutSent = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      payout_id: z.string().trim().min(1).max(60),
      provider_ref: z.string().trim().min(1).max(120),
      sent_on: z.string().trim().min(4).max(20),
    })
  )
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    const payout = await db.entities.SupplierPayout.get(data.payout_id);
    if (payout.status !== "scheduled") throw fail(`${payout.payout_no} is already ${payout.status}.`, 409);
    return db.entities.SupplierPayout.update(payout.id, {
      status: "sent",
      provider_ref: data.provider_ref,
      sent_on: data.sent_on,
    });
  });

export const markPayoutConfirmed = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ payout_id: z.string().trim().min(1).max(60) }))
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    const payout = await db.entities.SupplierPayout.get(data.payout_id);
    if (payout.status !== "sent") throw fail(`${payout.payout_no} hasn't been sent yet.`, 409);
    return db.entities.SupplierPayout.update(payout.id, { status: "confirmed" });
  });

/** One supplier, one month: every order's goods, rate and commission, summed. */
export const getCommissionStatement = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ supplier_code: z.string().trim().min(1).max(20), month: z.string().trim().min(4).max(10) }))
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    const [supplier] = await allRows(db.entities.Supplier, { supplier_code: data.supplier_code });
    if (!supplier) throw fail("No such supplier.", 404);
    const orders = (await allRows(db.entities.Order, { supplier_code: data.supplier_code }))
      .filter((order) => String(order.created_date ?? "").slice(0, 7) === data.month && order.status !== "cancelled")
      .sort((a, b) => String(a.created_date).localeCompare(String(b.created_date)));

    const rows = orders.map((order) => ({
      order_no: order.order_no,
      created_date: order.created_date,
      status: order.status,
      goods_aud: order.goods_aud ?? 0,
      rate: order.commission_rate ?? 0,
      commission_aud: order.commission_aud ?? 0,
    }));
    return {
      supplier: {
        code: supplier.supplier_code,
        headline: supplier.headline ?? supplier.supplier_code,
        legal_name: supplier.legal_name ?? null,
        payout_currency: supplier.payout_currency ?? null,
      },
      month: data.month,
      rows,
      total_goods_aud: rows.reduce((sum, row) => sum + row.goods_aud, 0),
      total_commission_aud: rows.reduce((sum, row) => sum + row.commission_aud, 0),
    };
  });