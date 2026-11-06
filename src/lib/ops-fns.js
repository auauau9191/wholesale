import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { toItems } from "@/services/paging";
import { fail } from "@/lib/samples.server";
import { allRows, requireStaff } from "@/lib/console.server";

const requireAdmin = (context) => {
  if (context.user.role !== "admin") throw fail("Only an admin can do that.", 403);
};

/** A hub staff member only ever acts on the hub on their own account. */
const hubFor = (user, hub) => (user.role === "admin" || user.hub_code === "ALL" ? hub : user.hub_code);

const HUB_FIELDS = ["name", "manager_name", "city", "state", "street_address", "serves_states", "fallback_rank", "is_active"];

export const getHubs = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    requireStaff(context.user);
    const db = context.getBase44().asServiceRole;
    const [hubs, units] = await Promise.all([
      allRows(db.entities.Hub, {}),
      allRows(db.entities.SampleUnit, { status: "in_stock" }),
    ]);
    const stocked = {};
    for (const unit of units) if (!unit.is_master) stocked[unit.hub_code] = (stocked[unit.hub_code] ?? 0) + 1;
    return {
      rows: hubs
        .sort((a, b) => (a.fallback_rank ?? 99) - (b.fallback_rank ?? 99))
        .map((hub) => {
          // The street address is admin-only on the entity, so it must not ride
          // out on a staff read either.
          const { street_address, ...rest } = hub;
          return {
            ...rest,
            ...(context.user.role === "admin" ? { street_address: street_address ?? "" } : {}),
            on_shelf: stocked[hub.hub_code] ?? 0,
          };
        }),
      can_edit: context.user.role === "admin",
    };
  });

export const saveHub = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      hub_id: z.string().trim().min(1).max(60),
      patch: z.object({
        name: z.string().trim().max(80).optional(),
        manager_name: z.string().trim().max(120).optional(),
        city: z.string().trim().max(60).optional(),
        state: z.string().trim().max(10).optional(),
        street_address: z.string().trim().max(200).optional(),
        serves_states: z.array(z.string().trim().max(10)).max(10).optional(),
        fallback_rank: z.number().int().min(1).max(20).optional(),
        is_active: z.boolean().optional(),
      }),
    })
  )
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    const patch = Object.fromEntries(Object.entries(data.patch).filter(([key, value]) => HUB_FIELDS.includes(key) && value !== undefined));
    return db.entities.Hub.update(data.hub_id, patch);
  });

export const CONTAINER_STEPS = ["booked", "at_sea", "arrived", "cleared", "unpacked"];
export const CONTAINER_LABEL = { booked: "Booked", at_sea: "At sea", arrived: "Arrived", cleared: "Cleared", unpacked: "Unpacked" };

export const getContainers = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ hub: z.enum(["ALL", "BNE", "SYD"]) }))
  .handler(async ({ data, context }) => {
    requireStaff(context.user);
    const db = context.getBase44().asServiceRole;
    const hub = hubFor(context.user, data.hub);
    const query = hub === "ALL" ? {} : { destination_hub: hub };
    const containers = await allRows(db.entities.Container, query);
    const units = await allRows(db.entities.SampleUnit, {});
    const byContainer = {};
    for (const unit of units) {
      if (!unit.container_no) continue;
      (byContainer[unit.container_no] ??= []).push({ unit_id: unit.unit_id, status: unit.status, hub_code: unit.hub_code, is_master: Boolean(unit.is_master) });
    }
    return {
      rows: containers
        .map((container) => ({
          ...container,
          units: byContainer[container.container_no] ?? [],
          next_step: CONTAINER_STEPS[CONTAINER_STEPS.indexOf(container.status) + 1] ?? null,
        }))
        .sort((a, b) => String(a.eta ?? "").localeCompare(String(b.eta ?? ""))),
      can_edit: context.user.role === "admin",
    };
  });

export const createContainer = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      kind: z.enum(["sample_consolidation", "order_lcl", "order_fcl"]),
      origin_port: z.string().trim().min(1).max(60),
      destination_hub: z.enum(["BNE", "SYD"]),
      etd: z.string().trim().min(4).max(20),
      eta: z.string().trim().min(4).max(20),
    })
  )
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    if (data.eta < data.etd) throw fail("The ETA can't be before the ETD.");
    const existing = await allRows(db.entities.Container, {});
    const yymm = String(data.etd).slice(2, 7).replace("-", "");
    const seq = existing.filter((row) => String(row.container_no ?? "").includes(yymm)).length + 1;
    return db.entities.Container.create({
      container_no: `CNT-${yymm}-${String(seq).padStart(2, "0")}`,
      kind: data.kind,
      origin_port: data.origin_port,
      destination_hub: data.destination_hub,
      etd: data.etd,
      eta: data.eta,
      status: "booked",
      unit_ids: [],
      order_nos: [],
      is_demo: false,
    });
  });

const lines = (value) =>
  [...new Set(String(value ?? "").split(/[\n,]+/).map((item) => item.trim()).filter(Boolean))];

/** Add units or orders by ID, one per line. Unknown IDs are refused, not ignored. */
export const addToContainer = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      container_id: z.string().trim().min(1).max(60),
      unit_ids: z.string().max(4000).optional(),
      order_nos: z.string().max(4000).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    const container = await db.entities.Container.get(data.container_id);
    const unitIds = lines(data.unit_ids);
    const orderNos = lines(data.order_nos);

    const units = unitIds.length
      ? toItems(await db.entities.SampleUnit.filter({ unit_id: { $in: unitIds } }, { limit: 200 }))
      : [];
    const missing = unitIds.filter((id) => !units.some((unit) => unit.unit_id === id));
    if (missing.length) throw fail(`No sample unit: ${missing.join(", ")}.`);

    if (orderNos.length) {
      const orders = toItems(await db.entities.Order.filter({ order_no: { $in: orderNos } }, { limit: 200 }));
      const unknown = orderNos.filter((no) => !orders.some((order) => order.order_no === no));
      if (unknown.length) throw fail(`No order: ${unknown.join(", ")}.`);
    }

    for (const unit of units) {
      await db.entities.SampleUnit.update(unit.id, {
        container_no: container.container_no,
        hub_code: container.destination_hub,
        status: unit.status === "retired" ? "retired" : "in_transit",
      });
    }

    return db.entities.Container.update(container.id, {
      unit_ids: [...new Set([...(container.unit_ids ?? []), ...unitIds])],
      order_nos: [...new Set([...(container.order_nos ?? []), ...orderNos])],
    });
  });

/** Booked → At sea → Arrived → Cleared → Unpacked. Unpacked puts its units in QC at the hub. */
export const stepContainer = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ container_id: z.string().trim().min(1).max(60) }))
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    const container = await db.entities.Container.get(data.container_id);
    const next = CONTAINER_STEPS[CONTAINER_STEPS.indexOf(container.status) + 1];
    if (!next) throw fail(`${container.container_no} is already unpacked.`, 409);

    const updated = await db.entities.Container.update(container.id, { status: next });
    if (next === "unpacked") {
      await db.entities.SampleUnit.updateMany(
        { container_no: container.container_no },
        { $set: { status: "qc_hold", hub_code: container.destination_hub } }
      );
    }
    return updated;
  });