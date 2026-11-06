import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { isValidAbn, normaliseAbn } from "@/lib/abn";
import { toItems } from "@/services/paging";

const PLAN_MONTHS = { starter_quarter: 3, monthly: 1, annual: 12 };

function addMonths(from, months) {
  const date = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + months, from.getUTCDate()));
  return date.toISOString().slice(0, 10);
}

const JoinInput = z.object({
  plan: z.enum(["starter_quarter", "monthly", "annual"]),
  business_name: z.string().trim().min(1).max(120),
  abn: z.string().trim().min(11).max(14),
  mobile: z.string().trim().min(8).max(20),
  street: z.string().trim().min(3).max(160),
  suburb: z.string().trim().min(2).max(80),
  state: z.enum(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"]),
  postcode: z.string().trim().regex(/^\d{4}$/),
  terms_accepted: z.literal(true),
});

/**
 * Creates the member profile for the signed-in account and runs the duplicate
 * checks. A second account on the same ABN waits on hold; a shared mobile or
 * address is flagged but still goes through review.
 */
export const registerMember = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(JoinInput)
  .handler(async ({ data, context }) => {
    const email = context.user.email;
    const abn = normaliseAbn(data.abn);
    if (!isValidAbn(abn)) {
      throw Object.assign(new Error("That ABN does not pass the ABN checksum."), { status: 400 });
    }

    const db = context.getBase44().asServiceRole;
    const mine = toItems(await db.entities.MemberProfile.filter({ user_email: email }, { limit: 1 }));
    if (mine.length) {
      throw Object.assign(new Error("This account already has a membership."), { status: 409 });
    }

    const others = async (query) =>
      toItems(await db.entities.MemberProfile.filter(query, { limit: 20 })).filter(
        (profile) => profile.user_email !== email
      );

    const sameAbn = await others({ abn });
    const sameMobile = await others({ phone: data.mobile });
    const sameAddress = await others({ street: data.street, postcode: data.postcode });

    const flags = [];
    if (sameAbn.length) flags.push("ABN already registered");
    if (sameMobile.length) flags.push("Mobile already registered");
    if (sameAddress.length) flags.push("Address already registered");

    return db.entities.MemberProfile.create({
      user_email: email,
      business_name: data.business_name,
      abn,
      abn_valid: true,
      phone: data.mobile,
      street: data.street,
      suburb: data.suburb,
      state: data.state,
      postcode: data.postcode,
      plan: data.plan,
      payment_status: "pending",
      status: sameAbn.length ? "on_hold" : "pending_review",
      fraud_flags: flags,
      is_demo: false,
    });
  });

/**
 * Admin only: records the payment, opens the account and writes the joining
 * sample credit — once per ABN, ever.
 */
export const activateMembership = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ user_email: z.string().trim().min(5).max(160) }))
  .handler(async ({ data, context }) => {
    if (context.user.role !== "admin") {
      throw Object.assign(new Error("Only an admin can activate a membership."), { status: 403 });
    }

    const db = context.getBase44().asServiceRole;
    const profile = toItems(
      await db.entities.MemberProfile.filter({ user_email: data.user_email }, { limit: 1 })
    )[0];
    if (!profile) {
      throw Object.assign(new Error("No membership for that email."), { status: 404 });
    }

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const paidUntil = addMonths(now, PLAN_MONTHS[profile.plan] ?? 1);

    const updated = await db.entities.MemberProfile.update(profile.id, {
      payment_status: "settled",
      status: "active",
      plan_started_on: today,
      paid_until: paidUntil,
    });

    // The catalogue rules read this flag on the user, so it is set here and
    // only here: a member who has not paid cannot reach the catalogue at all.
    const users = await db.entities.User.filter({ email: data.user_email }, { limit: 1 });
    const account = toItems(users)[0];
    if (account) await db.entities.User.update(account.id, { membership_active: true });

    let record = toItems(await db.entities.AbnRecord.filter({ abn: profile.abn }, { limit: 1 }))[0];
    if (!record) {
      record = await db.entities.AbnRecord.create({
        abn: profile.abn,
        first_user_email: data.user_email,
        join_free_sample_used: false,
      });
    }

    // One join credit per ABN: the ledger row carries the ABN, so a cancelled
    // and rejoined business can never take a second free sample.
    const joinCredits = toItems(
      await db.entities.CreditLedger.filter({ reason: "join", related_id: profile.abn }, { limit: 1 })
    );

    if (!record.join_free_sample_used && !joinCredits.length) {
      await db.entities.CreditLedger.create({
        user_email: data.user_email,
        change: 1,
        reason: "join",
        related_id: profile.abn,
        note: "Joining sample.",
      });
      await db.entities.AbnRecord.update(record.id, {
        join_free_sample_used: true,
        used_on: today,
        first_user_email: record.first_user_email || data.user_email,
      });
    }

    return updated;
  });

/**
 * Stub, not wired to any screen yet: this will call the Australian Business
 * Register web service with the ABR_GUID secret when that lookup is switched on.
 */
export const checkAbnWithAbr = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ abn: z.string().trim().min(11).max(14) }))
  .handler(async ({ data }) => ({
    abn: normaliseAbn(data.abn),
    checked: false,
    reason: "The ABR lookup is not connected yet.",
  }));