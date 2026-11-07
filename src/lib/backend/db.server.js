// The data layer: the same entity API the app was written against
// (filter, list, get, create, update, updateMany, delete, deleteMany, bulkCreate),
// stored in Supabase Postgres. Tables come from supabase/schema.sql.
import pg from "pg";
import { ENTITIES } from "@/lib/backend/schema";

const BUILT_IN = ["id", "created_date", "updated_date", "created_by", "created_by_id"];
const HIDDEN = new Set(["extra", "auth_id"]);
const MAX_ROWS = 5000;

export const httpError = (message, status) => Object.assign(new Error(message), { status });

/** One database connection, opened on first use and closed with `end()` when the request is done. */
export function createConnection(connectionString) {
  let client;
  let ready;
  const connect = () => {
    if (!connectionString) throw httpError("The database isn't configured (DATABASE_URL is missing).", 500);
    if (!ready) {
      client = new pg.Client({ connectionString });
      ready = client.connect().then(() => client);
    }
    return ready;
  };
  return {
    query: async (text, params) => (await connect()).query(text, params),
    end: async () => {
      if (!ready) return;
      const c = client;
      client = undefined;
      ready = undefined;
      await c.end().catch(() => {});
    },
  };
}

const quote = (name) => `"${String(name).replace(/"/g, '""')}"`;

function columnOf(entity, key) {
  if (BUILT_IN.includes(key)) return { sql: quote(key), type: key.endsWith("_date") ? "timestamp" : "string" };
  const field = entity.fields[key];
  if (field) return { sql: quote(key), type: field.type };
  if (!/^[a-zA-Z0-9_]+$/.test(key)) throw httpError(`Unknown field "${key}"`, 400);
  return { sql: `(extra->>'${key}')`, type: "extra" };
}

const isOperatorObject = (v) => v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).some((k) => k.startsWith("$"));
const isJson = (type) => type === "array" || type === "object";

/** A Mongo-style query ({field: value, field: {$in: [...]}, $or: [...]}) as a SQL condition. */
function where(entity, query, params) {
  if (query === false) return "false";
  if (!query) return "true";
  const add = (value) => {
    params.push(value);
    return `$${params.length}`;
  };
  const parts = [];
  for (const [key, value] of Object.entries(query)) {
    if (key === "$or" || key === "$and" || key === "$nor") {
      const list = (value ?? []).map((q) => `(${where(entity, q, params)})`);
      if (!list.length) parts.push(key === "$or" ? "false" : "true");
      else if (key === "$or") parts.push(`(${list.join(" or ")})`);
      else if (key === "$and") parts.push(`(${list.join(" and ")})`);
      else parts.push(`not (${list.join(" or ")})`);
      continue;
    }
    const col = columnOf(entity, key);
    const eq = (v) => {
      if (v === null || v === undefined) return `${col.sql} is null`;
      if (col.type === "array") return Array.isArray(v) ? `${col.sql} = ${add(JSON.stringify(v))}::jsonb` : `${col.sql} @> ${add(JSON.stringify([v]))}::jsonb`;
      if (col.type === "object") return `${col.sql} = ${add(JSON.stringify(v))}::jsonb`;
      if (col.type === "extra") return `${col.sql} = ${add(String(v))}`;
      return `${col.sql} = ${add(v)}`;
    };
    if (!isOperatorObject(value)) {
      parts.push(eq(value));
      continue;
    }
    for (const [op, arg] of Object.entries(value)) {
      const list = Array.isArray(arg) ? arg : [arg];
      const listParam = () => (col.type === "extra" ? add(list.map(String)) : add(list));
      switch (op) {
        case "$eq": parts.push(eq(arg)); break;
        case "$ne": parts.push(arg === null ? `${col.sql} is not null` : `not coalesce(${eq(arg)}, false)`); break;
        case "$in":
          if (!list.length) parts.push("false");
          else if (col.type === "array") parts.push(`${col.sql} ?| ${add(list.map(String))}::text[]`);
          else parts.push(`${col.sql} = any(${listParam()})`);
          break;
        case "$nin":
          if (!list.length) break;
          if (col.type === "array") parts.push(`not coalesce(${col.sql} ?| ${add(list.map(String))}::text[], false)`);
          else parts.push(`(${col.sql} is null or not (${col.sql} = any(${listParam()})))`);
          break;
        case "$gt": parts.push(`${col.sql} > ${add(arg)}`); break;
        case "$gte": parts.push(`${col.sql} >= ${add(arg)}`); break;
        case "$lt": parts.push(`${col.sql} < ${add(arg)}`); break;
        case "$lte": parts.push(`${col.sql} <= ${add(arg)}`); break;
        case "$exists": parts.push(arg ? `${col.sql} is not null` : `${col.sql} is null`); break;
        case "$regex": {
          // Searches are plain text; match them as text, case-insensitive when asked.
          const text = String(arg).replace(/[\\%_]/g, (c) => `\\${c}`);
          const ci = String(value.$options ?? "").includes("i");
          parts.push(`${col.type === "array" || col.type === "object" ? `${col.sql}::text` : col.sql} ${ci ? "ilike" : "like"} ${add(`%${text}%`)}`);
          break;
        }
        case "$options": break;
        case "$all": parts.push(`${col.sql} @> ${add(JSON.stringify(list))}::jsonb`); break;
        default: throw httpError(`Unsupported query operator ${op}`, 400);
      }
    }
  }
  return parts.length ? parts.join(" and ") : "true";
}

function orderBy(entity, sort) {
  if (!sort) return `order by created_date desc, id`;
  const fields = String(sort).split(",").map((s) => s.trim()).filter(Boolean);
  const terms = fields.map((s) => {
    const desc = s.startsWith("-");
    const key = s.replace(/^[-+]/, "");
    return `${columnOf(entity, key).sql} ${desc ? "desc nulls last" : "asc nulls first"}`;
  });
  return `order by ${[...terms, "id"].join(", ")}`;
}

/** A database row as the app sees a record: extra fields folded in, empty fields left out. */
function toRecord(row) {
  const out = { ...(row.extra ?? {}) };
  for (const [key, value] of Object.entries(row)) {
    if (HIDDEN.has(key) || value === null || value === undefined) continue;
    out[key] = value instanceof Date ? value.toISOString() : value;
  }
  return out;
}

/** Split a patch into real columns and extra fields, ready for SQL. */
function columnsFor(entity, data) {
  const cols = [];
  const extra = {};
  for (const [key, value] of Object.entries(data ?? {})) {
    if (value === undefined || BUILT_IN.includes(key) || key === "extra") continue;
    const field = entity.fields[key];
    if (!field) {
      extra[key] = value;
      continue;
    }
    cols.push({ key, value: isJson(field.type) && value !== null ? JSON.stringify(value) : value, json: isJson(field.type) });
  }
  return { cols, extra };
}

const encodeCursor = (offset) => btoa(String(offset));
const decodeCursor = (cursor) => {
  const n = Number(cursor ? atob(cursor) : 0);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/**
 * One entity's operations. `scope` (optional) narrows every read and write:
 *   scope.read      - extra query merged into reads (false = nothing visible)
 *   scope.canWrite  - (action, record) => boolean
 *   scope.view      - (record) => record, to hide fields the user may not see
 *   scope.patch     - (patch) => patch, rejects fields the user may not change
 *   scope.actor     - { email, id } written as created_by
 */
export function entityApi(conn, name, scope = {}) {
  const entity = ENTITIES[name];
  if (!entity) throw httpError(`Unknown entity ${name}`, 400);
  const table = `public.${entity.table}`;
  const view = scope.view ?? ((r) => r);
  const scoped = (query) => {
    if (scope.read === undefined || scope.read === null) return query ?? {};
    if (scope.read === false) return false;
    return { $and: [query ?? {}, scope.read] };
  };

  async function select(query, { sort, limit, offset = 0 } = {}) {
    const params = [];
    const cond = where(entity, scoped(query), params);
    const max = Math.min(Number(limit) || MAX_ROWS, MAX_ROWS);
    params.push(max + 1, offset);
    const { rows } = await conn.query(
      `select * from ${table} where ${cond} ${orderBy(entity, sort)} limit $${params.length - 1} offset $${params.length}`,
      params,
    );
    return { rows: rows.slice(0, max).map(toRecord).map(view), more: rows.length > max, next: offset + max };
  }

  // filter(query, sort?, limit?, skip?) → array; filter(query, { sort, limit, cursor }) → page.
  async function filter(query = {}, sortOrOptions, limit, skip) {
    if (sortOrOptions && typeof sortOrOptions === "object") {
      const o = sortOrOptions;
      const offset = o.cursor ? decodeCursor(o.cursor) : Number(o.skip) || 0;
      const r = await select(query, { sort: o.sort, limit: o.limit, offset });
      return { items: r.rows, has_more: r.more, next_cursor: r.more ? encodeCursor(r.next) : null };
    }
    return (await select(query, { sort: sortOrOptions, limit, offset: Number(skip) || 0 })).rows;
  }

  async function getRow(id) {
    const params = [String(id)];
    const cond = where(entity, scoped({}), params);
    const { rows } = await conn.query(`select * from ${table} where id = $1 and (${cond})`, params);
    if (!rows[0]) throw httpError(`${name} not found`, 404);
    return toRecord(rows[0]);
  }

  async function insert(data) {
    const record = { ...(data ?? {}) };
    if (scope.canWrite && !scope.canWrite("create", record)) throw httpError(`You can't create ${name} records.`, 403);
    const { cols, extra } = columnsFor(entity, record);
    const entries = [
      ...(data?.id ? [{ name: "id", value: String(data.id) }] : []),
      { name: "created_by", value: data?.created_by ?? scope.actor?.email ?? null },
      { name: "created_by_id", value: data?.created_by_id ?? scope.actor?.id ?? null },
      ...(data?.created_date ? [{ name: "created_date", value: data.created_date }] : []),
      ...(data?.updated_date ? [{ name: "updated_date", value: data.updated_date }] : []),
      ...cols.map((c) => ({ name: quote(c.key), value: c.value, json: c.json })),
      { name: "extra", value: JSON.stringify(extra), json: true },
    ];
    const params = entries.map((e) => e.value);
    const values = entries.map((e, i) => `$${i + 1}${e.json ? "::jsonb" : ""}`);
    const { rows } = await conn.query(
      `insert into ${table} (${entries.map((e) => e.name).join(", ")}) values (${values.join(", ")}) returning *`,
      params,
    );
    return view(toRecord(rows[0]));
  }

  async function patchWhere(cond, condParams, patch) {
    const { cols, extra } = columnsFor(entity, patch);
    const params = [...condParams];
    const sets = cols.map((c) => {
      params.push(c.value);
      return `${quote(c.key)} = $${params.length}${c.json ? "::jsonb" : ""}`;
    });
    if (Object.keys(extra).length) {
      params.push(JSON.stringify(extra));
      sets.push(`extra = extra || $${params.length}::jsonb`);
    }
    sets.push("updated_date = now()");
    const { rows } = await conn.query(`update ${table} set ${sets.join(", ")} where ${cond} returning *`, params);
    return rows.map(toRecord);
  }

  return {
    filter,
    list: (sortOrOptions, limit, skip) => filter({}, sortOrOptions, limit, skip),
    get: async (id) => view(await getRow(id)),
    create: insert,
    bulkCreate: async (list) => {
      const out = [];
      for (const item of list ?? []) out.push(await insert(item));
      return out;
    },
    update: async (id, data) => {
      const patch = scope.patch ? scope.patch(data ?? {}) : data ?? {};
      if (scope.canWrite) {
        const current = await getRow(id);
        if (!scope.canWrite("update", current)) throw httpError(`You can't change this ${name}.`, 403);
      }
      const rows = await patchWhere("id = $1", [String(id)], patch);
      if (!rows[0]) throw httpError(`${name} not found`, 404);
      return view(rows[0]);
    },
    updateMany: async (query, change) => {
      if (scope.canWrite) throw httpError(`Only the server can change many ${name} records at once.`, 403);
      const patch = change?.$set ?? change ?? {};
      const params = [];
      const cond = where(entity, query ?? {}, params);
      const rows = await patchWhere(cond, params, patch);
      return { updated: rows.length };
    },
    delete: async (id) => {
      if (scope.canWrite) {
        const current = await getRow(id);
        if (!scope.canWrite("delete", current)) throw httpError(`You can't delete this ${name}.`, 403);
      }
      await conn.query(`delete from ${table} where id = $1`, [String(id)]);
      return { success: true };
    },
    deleteMany: async (query) => {
      if (scope.canWrite) throw httpError(`Only the server can delete many ${name} records at once.`, 403);
      const params = [];
      const { rowCount } = await conn.query(`delete from ${table} where ${where(entity, query ?? {}, params)}`, params);
      return { deleted: rowCount };
    },
  };
}

export { ENTITIES };
