// The browser side of the backend. Sign-in is Supabase Auth; data goes through the app's own
// server (/api/db), which applies the access rules — the browser never talks to the database.
import { createClient as createSupabase } from "@supabase/supabase-js";

const isBrowser = typeof window !== "undefined";
export const AUTH_STORAGE_KEY = "wholesale-auth";
export const GOOGLE_ENABLED = import.meta.env.VITE_ENABLE_GOOGLE_LOGIN === "true";

let supabase;
export function getSupabase() {
  if (!supabase) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("Supabase isn't configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
    supabase = createSupabase(url, key, {
      auth: { storageKey: AUTH_STORAGE_KEY, persistSession: isBrowser, autoRefreshToken: isBrowser, detectSessionInUrl: isBrowser },
    });
  }
  return supabase;
}

const storedSession = () => {
  if (!isBrowser) return null;
  try {
    return JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY) ?? "null");
  } catch {
    return null;
  }
};

/** The current access token, straight from storage (synchronous). */
export function getAccessToken() {
  return storedSession()?.access_token ?? null;
}

/** The current access token, refreshed first if it has expired. */
export async function getFreshAccessToken() {
  if (!isBrowser) return null;
  if (!storedSession()) return null;
  const { data } = await getSupabase().auth.getSession();
  return data.session?.access_token ?? null;
}

const fail = (message, status, data) => Object.assign(new Error(message), { status, data });

async function call(body) {
  const token = await getFreshAccessToken();
  const response = await fetch("/api/db", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw fail(result.message || `Request failed (${response.status})`, response.status, result);
  return result.data;
}

const authError = (error) => fail(error.message || "Something went wrong", error.status ?? 400);

function entitiesProxy() {
  const ops = ["filter", "list", "get", "create", "bulkCreate", "update", "updateMany", "delete", "deleteMany"];
  const cache = {};
  return new Proxy(
    {},
    {
      get: (_, entity) =>
        typeof entity === "string"
          ? (cache[entity] ??= Object.fromEntries(ops.map((op) => [op, (...args) => call({ entity, op, args })])))
          : undefined,
    },
  );
}

export function createClient() {
  return {
    entities: entitiesProxy(),
    auth: {
      hasToken: () => Boolean(getAccessToken()),
      setToken: () => {},
      me: () => call({ op: "me" }),
      updateMe: (data) => call({ op: "updateMe", args: [data] }),
      async loginViaEmailPassword(email, password) {
        const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
        if (error) throw authError(error);
        return { access_token: data.session?.access_token, user: data.user };
      },
      async register({ email, password }) {
        const { data, error } = await getSupabase().auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw authError(error);
        // With "Confirm email" off in Supabase the account is signed in straight away.
        return { access_token: data.session?.access_token ?? null, needs_verification: !data.session };
      },
      async verifyOtp({ email, otpCode }) {
        const { data, error } = await getSupabase().auth.verifyOtp({ email, token: otpCode, type: "signup" });
        if (error) throw authError(error);
        return { access_token: data.session?.access_token };
      },
      async resendOtp(email) {
        const { error } = await getSupabase().auth.resend({ type: "signup", email });
        if (error) throw authError(error);
      },
      async resetPasswordRequest(email) {
        const { error } = await getSupabase().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw authError(error);
      },
      async resetPassword({ newPassword }) {
        const { error } = await getSupabase().auth.updateUser({ password: newPassword });
        if (error) throw authError(error);
      },
      async loginWithProvider(provider, returnTo) {
        const { error } = await getSupabase().auth.signInWithOAuth({
          provider,
          options: { redirectTo: new URL(returnTo || "/", window.location.origin).href },
        });
        if (error) throw authError(error);
      },
      async logout(redirectUrl) {
        await getSupabase().auth.signOut().catch(() => {});
        try {
          window.localStorage.removeItem(AUTH_STORAGE_KEY);
        } catch {
          // Storage can be blocked (private mode); the session has already been signed out.
        }
        window.location.href = redirectUrl || "/";
      },
      redirectToLogin(returnTo) {
        const url = new URL("/login", window.location.origin);
        if (returnTo) url.searchParams.set("returnTo", returnTo);
        window.location.href = url.href;
      },
    },
  };
}
