import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { toItems } from "@/services/paging";
import { decisionDue, fail, loadSettings, today } from "@/lib/samples.server";
import { addDays, allRows, assertHub, byKey, hubQuery, requireStaff } from "@/lib/console.server";
import { buildSampleQueue } from "@/lib/sample-queue.server";

const Hub = z.enum(["ALL", "BNE", "SYD"]);
const APP_URL = "https://vehement-nova-launch-pad.base44.app";

/** Counts, rows, shelf and low stock for the Sample requests page. */
export const getSampleQueue = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ hub: Hub }))
  .handler(async ({ data, context }) => {
    requireStaff(context.user);
    return buildSampleQueue(context.getBase44().asServiceRole, data.hub);
  });

const without = (flags, flag) => flags.filter((item) => item !== flag);

async function setUnitStatus(db, unitId, status) {
  const unit = toItems(await db.entities.SampleUnit.filter({ unit_id: unitId }, { limit: 1 }))[0];
  if (unit) await db.entities.SampleUnit.update(unit.id, { status });
}

async function sendReminder(db, request, settings) {
  const [profile, product] = await Promise.all([
    db.entities.MemberProfile.filter({ user_email: request.user_email }, { limit: 1 }).then((page) => toItems(page)[0]),
    db.entities.Product.filter({ product_id: request.product_id }, { limit: 1 }).then((page) => toItems(page)[0]),
  ]);
  const due = decisionDue(request, settings);
  const sent = await db.integrations.Core.SendEmail({
    to: request.user_email,
    template_name: "SampleDecisionReminder",
    category: "transactional",
    variables: {
      business_name: profile?.business_name ?? "there",
      request_no: request.request_no,
      product_name: product?.name ?? request.product_id,
      due_date: new Date(`${due}T00:00:00Z`).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }),
      samples_url: `${APP_URL}/samples`,
    },
  });
  if (sent && sent.success === false) throw fail(sent.message ?? "We couldn't email this member.", 409);
}

/** One step forward for a request. Each action only runs from the status it belongs to. */
export const actOnSampleRequest = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      request_id: z.string().trim().min(1).max(60),
      action: z.enum(["confirm_payment", "review", "mark_ready", "mark_dispatched", "mark_delivered", "send_reminder"]),
      carrier: z.string().trim().max(60).optional(),
      tracking_number: z.string().trim().max(80).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    requireStaff(context.user);
    const db = context.getBase44().asServiceRole;
    const request = await db.entities.SampleRequest.get(data.request_id);
    assertHub(context.user, request.hub_code);
    const flags = request.flags ?? [];
    const now = today();
    const wrong = () => fail(`${request.request_no} has moved on. Refresh to see where it is.`, 409);
    let patch;

    if (data.action === "confirm_payment") {
      if (request.status !== "on_hold" || !flags.includes("awaiting payment")) throw wrong();
      const next = without(flags, "awaiting payment");
      patch = { flags: next, status: next.includes("fraud check") ? "on_hold" : "requested" };
    } else if (data.action === "review") {
      if (request.status !== "on_hold" || !flags.includes("fraud check")) throw wrong();
      const next = without(flags, "fraud check");
      patch = { flags: next, status: next.includes("awaiting payment") ? "on_hold" : "requested" };
    } else if (data.action === "mark_ready") {
      if (request.status !== "requested") throw wrong();
      patch = { status: "ready_to_dispatch" };
    } else if (data.action === "mark_dispatched") {
      if (request.status !== "ready_to_dispatch") throw wrong();
      if (!data.carrier || !data.tracking_number) throw fail("Add the carrier and tracking number.");
      patch = { status: "dispatched", carrier: data.carrier, tracking_number: data.tracking_number, dispatched_on: now };
      await setUnitStatus(db, request.unit_id, "dispatched");
    } else if (data.action === "mark_delivered") {
      if (request.status !== "dispatched") throw wrong();
      const settings = await loadSettings(db);
      patch = { status: "delivered", delivered_on: now, decision_due: addDays(now, settings.decision_days ?? 14) };
      await setUnitStatus(db, request.unit_id, "with_member");
    } else {
      const settings = await loadSettings(db);
      const due = decisionDue(request, settings);
      if (request.status !== "delivered" || request.decision || !due || due >= now) throw wrong();
      await sendReminder(db, request, settings);
      patch = { flags: [...flags.filter((flag) => !flag.startsWith("reminded ")), `reminded ${now}`] };
    }

    return db.entities.SampleRequest.update(request.id, patch);
  });

/** Printable labels for every request waiting to go out from the chosen hub. */
export const getDispatchLabels = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ hub: Hub }))
  .handler(async ({ data, context }) => {
    requireStaff(context.user);
    const db = context.getBase44().asServiceRole;
    const requests = await allRows(db.entities.SampleRequest, {
      ...hubQuery(data.hub),
      status: { $in: ["requested", "ready_to_dispatch"] },
    });
    const emails = [...new Set(requests.map((row) => row.user_email))];
    const [profiles, hubs] = await Promise.all([
      emails.length ? allRows(db.entities.MemberProfile, { user_email: { $in: emails } }) : [],
      allRows(db.entities.Hub, {}),
    ]);
    const profileByEmail = byKey(profiles, "user_email");
    const hubByCode = byKey(hubs, "hub_code");
    return requests
      .sort((a, b) => String(a.request_no).localeCompare(String(b.request_no)))
      .map((request) => {
        const profile = profileByEmail[request.user_email] ?? {};
        const hub = hubByCode[request.hub_code] ?? {};
        return {
          request_no: request.request_no,
          unit_id: request.unit_id,
          name: profile.business_name ?? request.user_email,
          street: profile.street ?? "",
          locality: [profile.suburb, profile.state, profile.postcode].filter(Boolean).join(" "),
          hub_name: hub.name ?? request.hub_code,
          hub_city: [hub.city, hub.state].filter(Boolean).join(" "),
        };
      });
  });