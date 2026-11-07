// The access rules written in base44/entities/*.jsonc ("rls"), applied by the server.
//
// A rule is reduced against the signed-in user first: user conditions become true or false and
// "{{user.email}}" becomes the email, which leaves either a plain yes/no or a condition on the
// record's own fields (e.g. user_email = me@x.com). That condition is added to the database
// query for reads, and checked against the record for writes.

const TRUE = { kind: "bool", value: true };
const FALSE = { kind: "bool", value: false };

const fillTemplate = (value, user) => {
  if (typeof value !== "string") return value;
  const match = value.match(/^\{\{\s*user\.([a-z_]+)\s*\}\}$/i);
  if (!match) return value;
  return user ? user[match[1]] ?? null : null;
};

const and = (parts) => {
  if (parts.some((p) => p.kind === "bool" && !p.value)) return FALSE;
  const rest = parts.filter((p) => p.kind !== "bool");
  if (!rest.length) return TRUE;
  return rest.length === 1 ? rest[0] : { kind: "and", parts: rest };
};

const or = (parts) => {
  if (parts.some((p) => p.kind === "bool" && p.value)) return TRUE;
  const rest = parts.filter((p) => p.kind !== "bool");
  if (!rest.length) return FALSE;
  return rest.length === 1 ? rest[0] : { kind: "or", parts: rest };
};

/** Reduce one rule (or `undefined` = no rule) for this user. */
export function reduceRule(rule, user, { missing = TRUE } = {}) {
  if (rule === undefined || rule === null) return missing;
  if (rule === true) return TRUE;
  if (rule === false) return FALSE;
  const parts = [];
  for (const [key, value] of Object.entries(rule)) {
    if (key === "$or") parts.push(or(value.map((r) => reduceRule(r, user))));
    else if (key === "$and") parts.push(and(value.map((r) => reduceRule(r, user))));
    else if (key === "user_condition") {
      const ok = Boolean(user) && Object.entries(value).every(([k, v]) => user[k] === fillTemplate(v, user));
      parts.push(ok ? TRUE : FALSE);
    } else {
      const field = key.startsWith("data.") ? key.slice(5) : key;
      const expected = fillTemplate(value, user);
      parts.push(expected === null || expected === undefined ? FALSE : { kind: "eq", field, value: expected });
    }
  }
  return and(parts);
}

/** Does a record satisfy a reduced rule? */
export function matches(expr, record) {
  switch (expr.kind) {
    case "bool": return expr.value;
    case "eq": return record?.[expr.field] === expr.value;
    case "and": return expr.parts.every((p) => matches(p, record));
    case "or": return expr.parts.some((p) => matches(p, record));
    default: return false;
  }
}

/** A reduced rule as a Mongo-style query, to merge into a filter. null = no limit, false = nothing. */
export function toQuery(expr) {
  switch (expr.kind) {
    case "bool": return expr.value ? null : false;
    case "eq": return { [expr.field]: expr.value };
    case "and": return { $and: expr.parts.map(toQuery) };
    case "or": return { $or: expr.parts.map(toQuery) };
    default: return false;
  }
}

/** The built-in User entity: you see and edit yourself; admins see and edit everyone. */
export const USER_RULES = {
  read: { $or: [{ user_condition: { role: "admin" } }, { "data.id": "{{user.id}}" }] },
  create: { user_condition: { role: "admin" } },
  update: { $or: [{ user_condition: { role: "admin" } }, { "data.id": "{{user.id}}" }] },
  delete: { user_condition: { role: "admin" } },
};
