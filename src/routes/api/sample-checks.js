import { createFileRoute } from "@tanstack/react-router";
import { requireUserRoute } from "@/lib/auth-middleware";
import { runSampleChecks } from "@/lib/sample-checks.server";

/** The daily checks on demand, for admins. The schedule itself runs from src/server.js. */
export const Route = createFileRoute("/api/sample-checks")({
  server: {
    middleware: [requireUserRoute],
    handlers: {
      POST: async ({ context }) => {
        if (context.user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });
        return Response.json(await runSampleChecks(context.getBase44().asServiceRole));
      },
    },
  },
});
