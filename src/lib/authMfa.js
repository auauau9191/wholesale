import { base44 } from "@/api/base44Client";

// Sign-in is Supabase Auth now (email and password). There is no second step,
// so `mfa_required` is never set and the MFA screens are not reached.
export async function loginWithMfa(email, password) {
  return base44.auth.loginViaEmailPassword(email, password);
}

export async function continueMfa() {
  throw new Error("Two-step sign-in isn't available.");
}

// provider: "google" | "microsoft" | "facebook" | "apple" (turn the provider on in Supabase first)
export async function loginWithSocial(provider, returnTo) {
  return base44.auth.loginWithProvider(provider, returnTo);
}

export function loginWithGoogle(returnTo) {
  return loginWithSocial("google", returnTo);
}
