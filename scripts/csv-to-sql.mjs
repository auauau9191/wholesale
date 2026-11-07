// Turns Base44 CSV exports (one file per entity, e.g. "Product_export.csv") into one SQL file
// to paste into Supabase → SQL Editor:
//   node scripts/csv-to-sql.mjs path/to/csv-folder > supabase/import.sql
// Records keep their ids and dates, so links between them survive. Running it twice is safe:
// rows that already exist are skipped. People sign in again with Supabase; their User row
// (role, hub) is matched to them by email the first time they log in.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ENTITIES } from "../src/lib/backend/schema.js";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((v) => v !== ""));
}

const BUILT_IN = { id: "text", created_date: "timestamp", updated_date: "timestamp", created_by: "text", created_by_id: "text" };
const names = Object.keys(ENTITIES).sort((a, b) => b.length - a.length);
const entityFor = (file) => {
  const base = file.replace(/\.csv$/i, "").toLowerCase().replace(/[^a-z]/g, "");
  return names.find((n) => base === n.toLowerCase() || base.startsWith(n.toLowerCase()));
};

const sqlString = (s) => `'${String(s).replace(/'/g, "''")}'`;
function convert(raw, type) {
  if (raw === undefined || raw === null || raw === "") return "null";
  if (type === "boolean") return /^(true|t|1|yes)$/i.test(raw) ? "true" : "false";
  if (type === "number" || type === "integer") return Number.isFinite(Number(raw)) ? String(Number(raw)) : "null";
  if (type === "array" || type === "object") {
    try { return `${sqlString(JSON.stringify(JSON.parse(raw)))}::jsonb`; }
    catch { return type === "array" ? `${sqlString(JSON.stringify(raw.split(/\s*[,;]\s*/).filter(Boolean)))}::jsonb` : "null"; }
  }
  return sqlString(raw);
}

const dir = process.argv[2];
if (!dir) { console.error("Usage: node scripts/csv-to-sql.mjs <folder with CSV files>"); process.exit(1); }
const out = ["-- Data imported from the Base44 CSV exports. Paste into Supabase → SQL Editor → Run (after schema.sql).", "begin;"];
const report = [];
// Users first, so nothing waits on them.
const files = readdirSync(dir).filter((f) => /\.csv$/i.test(f)).sort((a, b) => (entityFor(a) === "User" ? -1 : entityFor(b) === "User" ? 1 : a.localeCompare(b)));
for (const file of files) {
  const name = entityFor(file);
  if (!name) { report.push(`skipped ${file} (no matching entity)`); continue; }
  const { table, fields } = ENTITIES[name];
  const [header, ...rows] = parseCsv(readFileSync(join(dir, file), "utf8").replace(/^\uFEFF/, ""));
  const cols = header.map((h) => h.trim());
  let count = 0;
  for (const r of rows) {
    const names = [];
    const values = [];
    const extra = {};
    cols.forEach((col, i) => {
      const raw = r[i];
      if (BUILT_IN[col]) {
        if (raw) { names.push(col); values.push(sqlString(raw)); }
      } else if (fields[col]) {
        names.push(`"${col}"`);
        values.push(convert(raw, fields[col].type));
      } else if (raw !== undefined && raw !== "" && !["is_sample", "_id"].includes(col)) {
        try { extra[col] = JSON.parse(raw); } catch { extra[col] = raw; }
      }
    });
    if (name === "User") {
      const at = cols.indexOf("email");
      if (at >= 0 && r[at]) values[names.indexOf('"email"')] = sqlString(r[at].toLowerCase());
    }
    if (Object.keys(extra).length) { names.push("extra"); values.push(`${sqlString(JSON.stringify(extra))}::jsonb`); }
    const conflict = name === "User" ? "" : " on conflict (id) do nothing";
    out.push(`insert into public.${table} (${names.join(", ")}) values (${values.join(", ")})${name === "User" ? " on conflict do nothing" : conflict};`);
    count++;
  }
  report.push(`${file} → ${table}: ${count} rows`);
}
out.push("commit;");
console.log(out.join("\n"));
console.error(report.join("\n"));
