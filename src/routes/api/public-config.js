import { createFileRoute } from "@tanstack/react-router";
import { serverEnv } from "@/lib/backend/client.server";

/** The Supabase address and public key for the browser. Both are public by design. */
export const Route = createFileRoute("/api/public-config")({
  server: {
    handlers: {
      GET: () =>
        Response.json(
          {
            url: serverEnv("VITE_SUPABASE_URL") ?? serverEnv("SUPABASE_URL") ?? null,
            key: serverEnv("VITE_SUPABASE_ANON_KEY") ?? serverEnv("SUPABASE_ANON_KEY") ?? null,
          },
          { headers: { "Cache-Control": "public, max-age=300" } },
        ),
    },
  },
});
