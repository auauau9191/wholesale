import { getAccessToken } from "@/lib/backend/client";

const isBrowser = typeof window !== "undefined";

// Kept for the pages that still read it. The app now runs on Supabase (see src/lib/backend).
export function getAppParams() {
  return {
    appId: "wholesale",
    token: isBrowser ? getAccessToken() : null,
    functionsVersion: undefined,
    appBaseUrl: isBrowser ? window.location.origin : undefined,
  };
}
