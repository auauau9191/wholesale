import { createFileRoute } from "@tanstack/react-router";

const ENTITY_OPS = new Set(["filter", "list", "get", "create", "bulkCreate", "update", "updateMany", "delete", "deleteMany"]);

/**
 * The browser's door to the data. Every call runs as the signed-in visitor, so the access
 * rules in base44/entities decide what they may read and change (src/lib/backend/rules.js).
 */
export const Route = createFileRoute("/api/db")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const body = await request.json().catch(() => null);
        if (!body || typeof body !== "object") return Response.json({ message: "Bad request" }, { status: 400 });
        const client = context.getBase44();
        const args = Array.isArray(body.args) ? body.args : [];
        try {
          let data;
          if (body.op === "me") data = await client.auth.me();
          else if (body.op === "updateMe") data = await client.auth.updateMe(args[0]);
          else if (ENTITY_OPS.has(body.op) && typeof body.entity === "string") {
            const entity = client.entities[body.entity];
            if (!entity) return Response.json({ message: `Unknown entity ${body.entity}` }, { status: 400 });
            data = await entity[body.op](...args);
          } else return Response.json({ message: "Unknown operation" }, { status: 400 });
          return Response.json({ data: data ?? null });
        } catch (error) {
          const status = Number(error?.status) || 500;
          if (status >= 500) console.error("[api/db]", error);
          return Response.json({ message: status >= 500 ? "Server error" : error.message }, { status });
        }
      },
    },
  },
});
