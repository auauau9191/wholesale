// The app's data and sign-in client. Named `base44` because the app was first built on Base44;
// it is now backed by Supabase (src/lib/backend/client.js) with the same API.
import { createClient } from "@/lib/backend/client";

export const base44 = createClient();
