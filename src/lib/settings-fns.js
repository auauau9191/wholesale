import { createServerFn } from "@tanstack/react-start";

/**
 * The public settings record, read on the server so the landing page renders
 * its plan prices without a client round trip.
 */
export const getPublicSettings = createServerFn({ method: "GET" }).handler(
  async ({ context }) => {
    const result = await context.getBase44().entities.AppSettings.list({ limit: 1 });
    const items = Array.isArray(result) ? result : result?.items ?? [];
    return items[0] ?? null;
  }
);