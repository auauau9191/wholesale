import { toItems } from "@/services/paging";
import { fail } from "@/lib/samples.server";

const CITY = { BNE: "Brisbane", SYD: "Sydney" };

/** Admins, and hub staff (User.hub_code BNE, SYD or ALL). */
export function requireStaff(user) {
  if (user.role === "admin" || ["BNE", "SYD", "ALL"].includes(user.hub_code)) return;
  throw fail("Only the team can do that.", 403);
}

/** Hub staff act only on their own hub's records. */
export function assertHub(user, hubCode) {
  if (user.role === "admin" || user.hub_code === "ALL" || user.hub_code === hubCode) return;
  throw fail(`That belongs to the ${CITY[hubCode] ?? hubCode} hub.`, 403);
}

export const hubQuery = (hub) => (hub && hub !== "ALL" ? { hub_code: hub } : {});

export async function allRows(entity, query) {
  const rows = [];
  let cursor;
  do {
    const page = await entity.filter(query, { limit: 500, ...(cursor ? { cursor } : {}) });
    rows.push(...toItems(page));
    cursor = page?.has_more ? page.next_cursor : null;
  } while (cursor);
  return rows;
}

/** Weekends skipped, dates as YYYY-MM-DD in UTC. */
export function addBusinessDays(isoDate, days) {
  const date = new Date(`${String(isoDate).slice(0, 10)}T00:00:00Z`);
  let left = days;
  while (left > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    const day = date.getUTCDay();
    if (day !== 0 && day !== 6) left -= 1;
  }
  return date.toISOString().slice(0, 10);
}

export function addDays(isoDate, days) {
  const date = new Date(`${String(isoDate).slice(0, 10)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export const daysBetween = (from, to) =>
  Math.round((new Date(`${to}T00:00:00Z`) - new Date(`${from}T00:00:00Z`)) / 86_400_000);

export const maskAbn = (abn) => (abn ? `ABN ·· ··· ··· ${String(abn).slice(-3)}` : "No ABN");

export const byKey = (rows, key) => Object.fromEntries(rows.map((row) => [row[key], row]));