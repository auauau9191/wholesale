// Data for the four console pages Base44 left as placeholders:
// Overview, Members, Sample inventory and Categories.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { fail } from "@/lib/samples.server";
import { allRows, hubQuery, requireStaff } from "@/lib/console.server";

const Hub = z.object({ hub: z.enum(["ALL", "BNE", "SYD"]).default("ALL") });
const requireAdmin = (user) => {
  if (user.role !== "admin") throw fail("Only an admin can do that.", 403);
};
const scopeOf = (user, hub) => (user.role === "admin" || user.hub_code === "ALL" ? hub : user.hub_code);
const thisMonth = () => new Date().toISOString().slice(0, 7);

export const getOverview = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(Hub)
  .handler(async ({ data, context }) => {
    requireStaff(context.user);
    const db = context.getBase44().asServiceRole;
    const hub = scopeOf(context.user, data.hub);
    const [members, requests, units, containers, orders, suppliers, payouts] = await Promise.all([
      allRows(db.entities.MemberProfile, {}),
      allRows(db.entities.SampleRequest, hubQuery(hub)),
      allRows(db.entities.SampleUnit, { ...hubQuery(hub), status: { $in: ["qc_hold", "in_stock", "in_transit"] } }),
      allRows(db.entities.Container, hub && hub !== "ALL" ? { destination_hub: hub } : {}),
      allRows(db.entities.Order, {}),
      allRows(db.entities.Supplier, { pipeline_stage: "live" }),
      context.user.role === "admin" ? allRows(db.entities.SupplierPayout, {}) : Promise.resolve([]),
    ]);
    const today = new Date().toISOString().slice(0, 10);
    const week = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
    const month = thisMonth();
    const commissionRows = payouts.filter((p) => String(p.created_date).slice(0, 7) === month && p.stage === "balance");
    return {
      hub,
      counts: {
        active_members: members.filter((m) => m.status === "active").length,
        pending_members: members.filter((m) => m.status === "pending_review").length,
        samples_out: requests.filter((r) => ["ready_to_dispatch", "dispatched"].includes(r.status)).length,
        to_send: requests.filter((r) => r.status === "requested").length,
        decisions_overdue: requests.filter((r) => (r.flags ?? []).includes("decision overdue")).length,
        qc_hold: units.filter((u) => u.status === "qc_hold").length,
        in_stock: units.filter((u) => u.status === "in_stock" && !u.is_master).length,
        containers_this_week: containers.filter((c) => c.status !== "unpacked" && c.eta && c.eta >= today && c.eta <= week).length,
        orders_in_production: orders.filter((o) => o.status === "in_production").length,
        live_suppliers: suppliers.length,
      },
      money:
        context.user.role === "admin"
          ? {
              commission_month: commissionRows.reduce((sum, p) => sum + (p.commission_withheld_aud ?? 0), 0),
              commission_records: commissionRows.length,
            }
          : null,
    };
  });

export const getMembersBoard = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    requireAdmin(context.user);
    const db = context.getBase44().asServiceRole;
    const [profiles, ledger] = await Promise.all([allRows(db.entities.MemberProfile, {}), allRows(db.entities.CreditLedger, {})]);
    const credits = {};
    for (const row of ledger) credits[row.user_email] = (credits[row.user_email] ?? 0) + (row.change ?? 0);
    return profiles
      .sort((a, b) => String(b.created_date).localeCompare(String(a.created_date)))
      .map((p) => ({
        id: p.id,
        user_email: p.user_email,
        business_name: p.business_name ?? "",
        abn_tail: String(p.abn ?? "").slice(-3),
        state: p.state ?? "",
        plan: p.plan ?? "",
        payment_status: p.payment_status ?? "pending",
        status: p.status ?? "pending_review",
        paid_until: p.paid_until ?? null,
        fraud_flags: p.fraud_flags ?? [],
        credits: credits[p.user_email] ?? 0,
      }));
  });

export const setMemberStatus = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ profile_id: z.string().trim().min(1).max(60), status: z.enum(["on_hold", "suspended"]) }))
  .handler(async ({ data, context }) => {
    requireAdmin(context.user);
    const db = context.getBase44().asServiceRole;
    const profile = await db.entities.MemberProfile.get(data.profile_id);
    await db.entities.MemberProfile.update(profile.id, { status: data.status });
    const [account] = await db.entities.User.filter({ email: profile.user_email }, undefined, 1);
    if (account) await db.entities.User.update(account.id, { membership_active: false });
    return { ok: true };
  });

const KIND = { in_stock: "shelf", reserved: "pack", with_member: "out", dispatched: "out", retired: "retired" };

export const getInventory = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(Hub)
  .handler(async ({ data, context }) => {
    requireStaff(context.user);
    const db = context.getBase44().asServiceRole;
    const hub = scopeOf(context.user, data.hub);
    const [products, units, settings] = await Promise.all([
      allRows(db.entities.Product, { status: { $in: ["live", "sample_unavailable"] } }),
      allRows(db.entities.SampleUnit, hubQuery(hub)),
      db.entities.AppSettings.list({ limit: 1 }).then((p) => p.items?.[0] ?? {}),
    ]);
    const level = settings.sample_reorder_level ?? 3;
    const byProduct = {};
    for (const unit of units) (byProduct[unit.product_id] ??= []).push(unit);
    const rows = products
      .map((product) => {
        const mine = (byProduct[product.product_id] ?? []).sort((a, b) => String(a.unit_id).localeCompare(String(b.unit_id)));
        const count = (status) => mine.filter((u) => u.status === status && !u.is_master).length;
        return {
          product_id: product.product_id,
          name: product.name,
          master_hub: product.master_hub ?? null,
          counts: {
            in_transit: count("in_transit"), qc_hold: count("qc_hold"), in_stock: count("in_stock"),
            reserved: count("reserved"), with_member: count("with_member") + count("dispatched"), retired: count("retired"),
          },
          low: count("in_stock") <= level,
          marks: mine
            .filter((u) => !["in_transit", "qc_hold"].includes(u.status))
            .map((u) => ({ unit_id: u.unit_id, kind: u.is_master ? "master" : KIND[u.status] ?? "shelf" })),
        };
      })
      .filter((row) => row.marks.length || row.counts.in_transit || row.counts.qc_hold)
      .sort((a, b) => Number(b.low) - Number(a.low) || a.product_id.localeCompare(b.product_id));
    return { hub, level, rows };
  });

export const getCategoryBoard = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    requireStaff(context.user);
    const db = context.getBase44().asServiceRole;
    const [categories, suppliers, products] = await Promise.all([
      allRows(db.entities.Category, {}),
      allRows(db.entities.Supplier, { pipeline_stage: "live" }),
      allRows(db.entities.Product, { status: "live" }),
    ]);
    return categories
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        risk_tier: c.risk_tier ?? "low",
        is_live: Boolean(c.is_live),
        suppliers: suppliers.filter((s) => (s.category_codes ?? []).includes(c.code)).length,
        products: products.filter((p) => p.category_code === c.code).length,
      }));
  });

export const setCategoryLive = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().trim().min(1).max(60), is_live: z.boolean() }))
  .handler(async ({ data, context }) => {
    requireAdmin(context.user);
    await context.getBase44().asServiceRole.entities.Category.update(data.id, { is_live: data.is_live });
    return { ok: true };
  });
