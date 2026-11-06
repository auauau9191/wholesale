// Writes supabase/demo-seed.sql: the demo catalogue (settings, hubs, 10 categories, suppliers,
// products, spec revision, sample units, containers), all marked is_demo = true.
// Use it when you have no CSV export to import.  node scripts/demo-seed.mjs
import { writeFileSync } from "node:fs";
import { ENTITIES } from "../src/lib/backend/schema.js";

const out = ["-- Demo data for Wholesale System. Paste into Supabase → SQL Editor → Run (after schema.sql).", "begin;"];
const lit = (v, type) => {
  if (v === null || v === undefined) return "null";
  if (type === "array" || type === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
};
function insert(entity, row) {
  const { table, fields } = ENTITIES[entity];
  const data = { ...row, is_demo: true };
  const keys = Object.keys(data).filter((k) => fields[k]);
  out.push(`insert into public.${table} (${keys.map((k) => `"${k}"`).join(", ")}) values (${keys.map((k) => lit(data[k], fields[k].type)).join(", ")});`);
}

insert("AppSettings", {});
insert("Hub", { hub_code: "BNE", name: "Brisbane hub", manager_name: "Yusuf", city: "Brisbane", state: "QLD", serves_states: ["QLD", "NT"], fallback_rank: 2, is_active: true });
insert("Hub", { hub_code: "SYD", name: "Sydney hub", manager_name: "Partner", city: "Sydney", state: "NSW", serves_states: ["NSW", "ACT", "VIC", "TAS", "SA", "WA"], fallback_rank: 1, is_active: true });

const categories = [
  ["PC", "Phone accessories"], ["PK", "Packaging & mailers"], ["HW", "Homewares & kitchen"], ["BG", "Bags & backpacks"], ["AA", "Apparel accessories"],
  ["FT", "Fitness accessories"], ["ST", "Stationery"], ["TL", "Hand tools"], ["PT", "Pet accessories"], ["CF", "Café supplies"],
];
categories.forEach(([code, name], i) => insert("Category", { code, name, risk_tier: "low", sort_order: i + 1, is_live: true }));

const checks = ["Business licence matches the factory name", "Export records for the last 2 years", "Production lines seen running", "QC bench with written checks", "Packing area and carton marks", "Owner interviewed on camera"];
const split = (total) => {
  const base = Math.floor(total / 5);
  const parts = [base, base, base, base, base];
  for (let i = 0; i < total - base * 5; i++) parts[i] += 1;
  return parts;
};
const suppliers = [
  ["CN018", "factory", "Shenzhen", "Guangdong", 90, "Rugged cases, drop-tested", ["PC"]],
  ["CN014", "factory", "Shenzhen", "Guangdong", 88, "TPU & silicone cases, own moulds", ["PC"]],
  ["CN022", "factory", "Guangzhou", "Guangdong", 84, "Leather wallet cases & straps", ["PC"]],
  ["CN009", "factory", "Dongguan", "Guangdong", 81, "Magnetic chargers & stands", ["PC"]],
  ["CN031", "trading_company", "Shenzhen", "Guangdong", 76, "Screen protectors, 3 partner plants", ["PC"]],
  ["CN047", "trading_company", "Yiwu", "Zhejiang", 72, "Mixed accessories, small MOQs", ["PC"]],
];
const otherHeadlines = {
  PK: ["Recycled mailers & tissue", "Printed kraft boxes"], HW: ["Ceramic tableware", "Stainless kitchen tools"], BG: ["Canvas totes & backpacks", "Laptop sleeves"],
  AA: ["Knit beanies & scarves", "Woven labels & belts"], FT: ["Resistance bands & mats", "Gym bottles & shakers"], ST: ["Notebooks & planners", "Pens & desk sets"],
  TL: ["Hand tools & sets", "Tape measures & levels"], PT: ["Pet beds & mats", "Leads, collars & toys"], CF: ["Paper cups & lids", "Barista tools"],
};
const cities = [["Ningbo", "Zhejiang"], ["Xiamen", "Fujian"], ["Foshan", "Guangdong"], ["Hangzhou", "Zhejiang"], ["Qingdao", "Shandong"]];
let n = 60;
for (const [code, heads] of Object.entries(otherHeadlines)) {
  heads.forEach((h, i) => {
    const [city, province] = cities[(n + i) % cities.length];
    suppliers.push([`CN${String(n++).padStart(3, "0")}`, "factory", city, province, 78 + ((n * 7) % 13), h, [code]]);
  });
}
suppliers.forEach(([supplier_code, supplier_type, city, province, score, headline, category_codes], i) => {
  const [cap, qual, comm, comp, exp] = split(score);
  insert("Supplier", {
    supplier_code, supplier_type, city, province, headline, category_codes,
    verification_score: score, score_capability: cap, score_quality: qual, score_communication: comm, score_compliance: comp, score_export: exp,
    checks_passed: checks, exporting_since_year: 2012 + (i % 9), staff_count: 60 + i * 10, production_lines: `${1 + (i % 3)} lines`,
    visit_date: "2026-03-10", filmed_date: "2026-03-14", agreement_status: "signed", non_circumvention_signed: true, pipeline_stage: "live",
    listing_fee_waived: i < 10, listing_fee_paid_until: i < 10 ? null : "2027-10-31", payout_currency: "CNY", payout_method: "airwallex",
    legal_name: `Demo Factory ${supplier_code.slice(2)} Co., Ltd.`,
    ...(supplier_code === "CN014"
      ? { exporting_since_year: 2017, staff_count: 140, production_lines: "2 moulding lines", video_chapters: [
          { title: "Gate & sign", start_seconds: 0 }, { title: "Moulding line", start_seconds: 42 }, { title: "QC bench", start_seconds: 118 },
          { title: "Packing", start_seconds: 171 }, { title: "Owner interview", start_seconds: 210 }] }
      : {}),
  });
});

const tiers = (a, b, c) => [{ min_qty: 500, max_qty: 1999, fob_usd: a }, { min_qty: 2000, max_qty: 4999, fob_usd: b }, { min_qty: 5000, max_qty: null, fob_usd: c }];
const products = [
  { product_id: "PC-CN014-0087", supplier_code: "CN014", name: "Premium Phone Case", short_description: "TPU and polycarbonate, 1.5 mm wall, matte finish.",
    colours: [{ name: "Forest", hex: "#2F4A40" }, { name: "Sand", hex: "#C8B48F" }, { name: "Black", hex: "#1E1F1E" }], moq: 500, lead_time_days: 25,
    price_tiers: tiers(1.42, 1.18, 0.96), freight_aud_per_unit_estimate: 0.16, hs_code_indicative: "3926.90", has_chafta_origin_cert: true,
    test_reports: [{ name: "Material test", expires_on: "2027-06-30" }], master_hub: "SYD" },
  { product_id: "PC-CN014-0091", supplier_code: "CN014", name: "Clear MagSafe Case", colours: [{ name: "Clear", hex: "#E8ECEA" }], price_tiers: tiers(1.65, 1.38, 1.12), master_hub: "BNE" },
  { product_id: "PC-CN014-0102", supplier_code: "CN014", name: "Kids Silicone Case", colours: [{ name: "Mint", hex: "#BFE3D0" }, { name: "Coral", hex: "#F2A08A" }], price_tiers: tiers(1.3, 1.08, 0.88), master_hub: "SYD" },
];
let p = 0;
for (const [code, , , , , headline, cats] of suppliers) {
  if (code === "CN014") continue;
  const count = cats[0] === "PC" ? 2 : 1;
  for (let i = 0; i < count; i++) {
    const base = 1 + ((p * 37) % 400) / 100;
    products.push({
      product_id: `${cats[0]}-${code}-${String(110 + p).padStart(4, "0")}`, supplier_code: code,
      name: `${headline.split(/[,&]/)[0].trim()}${count > 1 ? ` ${i ? "Plus" : "Classic"}` : ""}`.replace(/s$/, ""),
      colours: [{ name: "Natural", hex: "#D8D2C4" }, { name: "Charcoal", hex: "#3A3B38" }],
      price_tiers: tiers(+(base * 1.4).toFixed(2), +(base * 1.15).toFixed(2), +base.toFixed(2)), master_hub: p % 2 ? "BNE" : "SYD",
    });
    p++;
  }
}
for (const product of products) {
  insert("Product", {
    category_code: product.product_id.slice(0, 2), moq: 500, lead_time_days: 30, incoterm_port: "FOB Shenzhen", freight_aud_per_unit_estimate: 0.2,
    current_spec_revision: "R2", has_chafta_origin_cert: true, safety_flags: [], biosecurity_flags: [], test_reports: [], status: "live",
    short_description: "Sealed reference sample held in Australia.", ...product,
  });
}
insert("SpecRevision", {
  product_id: "PC-CN014-0087", revision: "R2", materials: "TPU + polycarbonate", dimensions_mm: "1.5 mm wall", tolerances: "±1 mm",
  colour_pantone: "Pantone 5535 C (Forest)", finish: "Matte", packaging: "Kraft box with printed insert", signed_date: "2026-03-20", status: "signed",
});

const unit = (product, suffix, hub, status, colour, shelf = "A1", extra = {}) =>
  insert("SampleUnit", { unit_id: `${product.product_id}-${suffix}`, product_id: product.product_id, revision: "R2", is_master: suffix === "M", colour, hub_code: hub,
    shelf_location: shelf, status, qc_result: status === "in_transit" || status === "qc_hold" ? null : "match", ...extra });
for (const product of products) {
  const colour = product.colours[0].name;
  unit(product, "M", product.master_hub, "in_stock", colour, "A1");
  if (product.product_id === "PC-CN014-0087") {
    unit(product, "S01", "BNE", "in_stock", "Forest", "B1"); unit(product, "S02", "BNE", "in_stock", "Sand", "B1");
    unit(product, "S03", "SYD", "in_stock", "Forest", "B2"); unit(product, "S04", "SYD", "in_stock", "Black", "B2");
    unit(product, "S05", "BNE", "with_member", "Forest", "B1"); unit(product, "S06", "SYD", "with_member", "Sand", "B2");
    unit(product, "S07", "SYD", "reserved", "Forest", "B4");
    continue;
  }
  ["S01", "S02"].forEach((s) => unit(product, s, "BNE", "in_stock", colour, "B1"));
  ["S03", "S04", "S05"].forEach((s) => unit(product, s, "SYD", "in_stock", colour, "B2"));
}
const transit = ["S06", "S07", "S08", "S09", "S10", "S11"].map((s) => `PC-CN014-0091-${s}`);
transit.forEach((id) => insert("SampleUnit", { unit_id: id, product_id: "PC-CN014-0091", revision: "R2", colour: "Clear", hub_code: "BNE", container_no: "CNT-2611-01", status: "in_transit" }));
insert("Container", { container_no: "CNT-2611-01", kind: "sample_consolidation", origin_port: "Shenzhen (Yantian)", destination_hub: "BNE", etd: "2026-10-29", eta: "2026-11-12", status: "at_sea", unit_ids: transit, order_nos: [] });
const hold = products.filter((x) => x.supplier_code === "CN018").map((x) => `${x.product_id}-S06`);
hold.forEach((id) => insert("SampleUnit", { unit_id: id, product_id: id.slice(0, -4), revision: "R2", colour: "Natural", hub_code: "SYD", container_no: "CNT-2610-02", status: "qc_hold" }));
insert("Container", { container_no: "CNT-2610-02", kind: "sample_consolidation", origin_port: "Shenzhen (Yantian)", destination_hub: "SYD", etd: "2026-10-08", eta: "2026-10-24", status: "unpacked", unit_ids: hold, order_nos: [] });

out.push("commit;");
writeFileSync(new URL("../supabase/demo-seed.sql", import.meta.url), out.join("\n") + "\n");
console.log(`${out.length - 3} rows → supabase/demo-seed.sql`);
