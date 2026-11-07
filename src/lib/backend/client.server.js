// The server side of the backend: who is calling (Supabase Auth), their view of the data
// (the entity rules) and the unrestricted service view the server functions use.
import { env as workerEnv } from "cloudflare:workers";
import { createConnection, entityApi, ENTITIES, httpError } from "@/lib/backend/db.server";
import { matches, reduceRule, toQuery, USER_RULES } from "@/lib/backend/rules";
import { sendEmail } from "@/lib/backend/email.server";

export function serverEnv(name) {
  return workerEnv?.[name] ?? globalThis.process?.env?.[name] ?? import.meta.env?.[name];
}

const supabaseUrl = () => serverEnv("VITE_SUPABASE_URL") ?? import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = () => serverEnv("VITE_SUPABASE_ANON_KEY") ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

const adminEmails = () =>
  String(serverEnv("ADMIN_EMAILS") ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

const PROTECTED_USER_FIELDS = ["role", "email", "id", "auth_id"];

function entitiesProxy(make) {
  const cache = {};
  return new Proxy(
    {},
    {
      get: (_, name) => {
        if (typeof name !== "string" || !ENTITIES[name]) return undefined;
        return (cache[name] ??= make(name));
      },
      has: (_, name) => Boolean(ENTITIES[name]),
      ownKeys: () => Object.keys(ENTITIES),
      getOwnPropertyDescriptor: (_, name) => (ENTITIES[name] ? { enumerable: true, configurable: true } : undefined),
    },
  );
}

/** Ask Supabase Auth who owns this access token. */
async function verifyToken(token) {
  const url = supabaseUrl();
  if (!url) throw httpError("Supabase isn't configured (VITE_SUPABASE_URL is missing).", 500);
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: supabaseAnonKey() ?? "", Authorization: `Bearer ${token}` },
  });
  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw httpError(`Sign-in service error (${response.status})`, 503);
  return response.json();
}

/** The app's own record of a signed-in person, made on their first visit and linked by email. */
async function userRecord(service, authUser) {
  const Users = service.entities.User;
  const email = String(authUser.email ?? "").toLowerCase();
  let [record] = await Users.filter({ auth_id: authUser.id }, undefined, 1);
  if (!record && email) {
    [record] = await Users.filter({ email }, undefined, 1);
    if (record) record = await Users.update(record.id, { auth_id: authUser.id });
  }
  if (!record) {
    record = await Users.create({
      email,
      auth_id: authUser.id,
      full_name: authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? null,
      role: "user",
    });
  }
  if (adminEmails().includes(email) && record.role !== "admin") record = await Users.update(record.id, { role: "admin" });
  return record;
}

function scopeFor(name, user) {
  const entity = ENTITIES[name];
  const rules = name === "User" ? USER_RULES : entity.rules ?? {};
  const fieldRules = Object.entries(entity.fieldRules ?? {});
  const rule = (action) => reduceRule(rules[action], user);
  return {
    actor: user ? { email: user.email, id: user.id } : null,
    read: toQuery(rule("read")),
    canWrite: (action, record) => matches(rule(action), record),
    view: (record) => {
      if (!fieldRules.length) return record;
      const out = { ...record };
      for (const [field, fr] of fieldRules) {
        if (fr.read && !matches(reduceRule(fr.read, user), record)) delete out[field];
      }
      return out;
    },
    patch: (patch) => {
      for (const [field, fr] of fieldRules) {
        if (field in patch && fr.update && !matches(reduceRule(fr.update, user), patch)) throw httpError(`You can't change ${field}.`, 403);
      }
      if (name === "User" && user?.role !== "admin") {
        for (const field of PROTECTED_USER_FIELDS) if (field in patch) throw httpError(`You can't change ${field}.`, 403);
      }
      return patch;
    },
  };
}

function integrations() {
  return {
    Core: {
      SendEmail: (args) => sendEmail(args, serverEnv),
    },
  };
}

/** The unrestricted view, for scheduled jobs and server code with no request. */
export function createServiceClient() {
  const conn = createConnection(serverEnv("DATABASE_URL"));
  const entities = entitiesProxy((name) => entityApi(conn, name));
  return {
    entities,
    integrations: integrations(),
    aiGateway: {
      connection() {
        throw httpError("AI features aren't set up on this host.", 501);
      },
    },
    end: () => conn.end(),
    conn,
  };
}

/**
 * What `context.getBase44()` returns to server functions and routes: `auth.me()`,
 * `entities` (with the caller's access rules) and `asServiceRole` (no rules; for business logic).
 */
export function createClientFromRequest(request) {
  const header = request?.headers?.get("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null;
  const service = createServiceClient();
  let mePromise;

  const me = () =>
    (mePromise ??= (async () => {
      if (!token) throw httpError("Not signed in", 401);
      const authUser = await verifyToken(token);
      if (!authUser?.id) throw httpError("Your session has ended. Please sign in again.", 401);
      return userRecord(service, authUser);
    })());
  const meOrNull = () => me().catch((error) => (error.status === 401 ? null : Promise.reject(error)));

  const scopedEntities = entitiesProxy((name) => {
    const ops = ["filter", "list", "get", "create", "bulkCreate", "update", "updateMany", "delete", "deleteMany"];
    return Object.fromEntries(
      ops.map((op) => [
        op,
        async (...args) => {
          const user = await meOrNull();
          return entityApi(service.conn, name, scopeFor(name, user))[op](...args);
        },
      ]),
    );
  });

  return {
    auth: {
      me,
      async updateMe(data) {
        const user = await me();
        return entityApi(service.conn, "User", scopeFor("User", user)).update(user.id, data ?? {});
      },
    },
    entities: scopedEntities,
    integrations: service.integrations,
    asServiceRole: { entities: service.entities, integrations: service.integrations, aiGateway: service.aiGateway },
    end: service.end,
  };
}
