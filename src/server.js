// The Worker's entry: TanStack Start's default handler, plus the daily sample checks on a
// Cloudflare cron trigger (see "triggers" in wrangler.jsonc).
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import { recordRouteError } from "@/lib/error-capture.server";
import { createServiceClient } from "@/lib/backend/client.server";
import { runSampleChecks } from "@/lib/sample-checks.server";

// Runs once the router has loaded the page.
const handler = createStartHandler((ctx) => {
  for (const match of ctx.router.state.matches) {
    if (match.status === "error") recordRouteError(ctx.request, match.error, match.routeId);
  }
  return defaultStreamHandler(ctx);
});

async function dailyChecks() {
  const db = createServiceClient();
  try {
    console.log("[daily sample checks]", JSON.stringify(await runSampleChecks(db)));
  } finally {
    await db.end();
  }
}

export default {
  fetch: handler,
  scheduled: (_event, _env, ctx) => ctx.waitUntil(dailyChecks()),
};
