import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { fail, loadSettings } from "@/lib/samples.server";

const requireAdmin = (context) => {
  if (context.user.role !== "admin") throw fail("Only an admin can do that.", 403);
};

const KEYS = [
  ["starter_quarter_price_aud", 0, 100_000],
  ["monthly_price_aud", 0, 100_000],
  ["annual_price_aud", 0, 100_000],
  ["fx_usd_to_aud", 0.1, 10],
  ["buyer_service_fee_rate", 0, 1],
  ["supplier_commission_rate", 0, 1],
  ["supplier_listing_fee_usd", 0, 100_000],
  ["deposit_rate", 0, 1],
  ["inspection_fee_aud", 0, 100_000],
  ["broker_fee_aud", 0, 100_000],
  ["sample_fee_aud", 0, 100_000],
  ["default_duty_rate_no_origin_cert", 0, 1],
  ["gst_rate", 0, 1],
  ["decision_days", 1, 365],
  ["dispatch_business_days", 0, 60],
  ["sample_reorder_level", 0, 1000],
  ["order_sample_credits", 0, 50],
  ["swap_credit_days", 0, 365],
  ["sample_fee_credit_back_days", 0, 365],
  ["non_circumvention_months", 0, 120],
];

export const getAdminSettings = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    requireAdmin(context);
    return loadSettings(context.getBase44().asServiceRole);
  });

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      id: z.string().trim().min(1).max(60),
      patch: z.record(z.string(), z.number()),
    })
  )
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    const allowed = Object.fromEntries(KEYS);
    const patch = {};
    for (const [key, value] of Object.entries(data.patch)) {
      const range = allowed[key];
      if (!range) continue;
      if (!Number.isFinite(value) || value < range[0] || value > range[1]) {
        throw fail(`${key.replace(/_/g, " ")} is out of range.`);
      }
      patch[key] = value;
    }
    if (!Object.keys(patch).length) throw fail("Nothing to save.");
    return db.entities.AppSettings.update(data.id, patch);
  });