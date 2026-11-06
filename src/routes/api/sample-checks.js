import { createFileRoute } from "@tanstack/react-router";
import { requireUserRoute } from "@/lib/auth-middleware";
import { toItems } from "@/services/paging";
import { decisionDue, loadSettings, today } from "@/lib/samples.server";

async function all(entity, query) {
  const rows = [];
  let cursor;
  do {
    const page = await entity.filter(query, { limit: 500, ...(cursor ? { cursor } : {}) });
    rows.push(...toItems(page));
    cursor = page?.has_more ? page.next_cursor : null;
  } while (cursor);
  return rows;
}

const sameFlags = (a = [], b = []) => a.length === b.length && a.every((flag) => b.includes(flag));

/** Daily: overdue decisions, low and empty shelves, and products with nothing left to send. */
export const Route = createFileRoute("/api/sample-checks")({
  server: {
    middleware: [requireUserRoute],
    handlers: {
      POST: async ({ context }) => {
        if (context.user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });
        const db = context.getBase44().asServiceRole;
        const settings = await loadSettings(db);
        const now = today();
        const level = settings.sample_reorder_level ?? 3;

        let overdue = 0;
        for (const request of await all(db.entities.SampleRequest, { status: "delivered" })) {
          const due = decisionDue(request, settings);
          if (request.decision || !due || due >= now) continue;
          if ((request.flags ?? []).includes("decision overdue")) continue;
          await db.entities.SampleRequest.update(request.id, { flags: [...(request.flags ?? []), "decision overdue"] });
          overdue += 1;
        }

        const hubs = toItems(await db.entities.Hub.filter({ is_active: true }, { limit: 20 })).map((hub) => hub.hub_code);
        const units = (await all(db.entities.SampleUnit, { status: "in_stock" })).filter(
          (unit) => !unit.is_master && hubs.includes(unit.hub_code)
        );
        const products = await all(db.entities.Product, { status: { $in: ["live", "sample_unavailable"] } });

        let flagged = 0;
        let unavailable = 0;
        for (const product of products) {
          const mine = units.filter((unit) => unit.product_id === product.product_id);
          const flags = [];
          if (mine.length <= level) flags.push("low stock");
          if (product.status === "live") {
            for (const hub of hubs) {
              if (!mine.some((unit) => unit.hub_code === hub)) flags.push(`empty at ${hub}`);
            }
          }
          const patch = {};
          if (!sameFlags(flags, product.stock_flags)) patch.stock_flags = flags;
          if (mine.length === 0 && product.status === "live") patch.status = "sample_unavailable";
          if (!Object.keys(patch).length) continue;
          await db.entities.Product.update(product.id, patch);
          if (patch.stock_flags) flagged += 1;
          if (patch.status) unavailable += 1;
        }

        return Response.json({ overdue, flagged, unavailable, checked_products: products.length });
      },
    },
  },
});