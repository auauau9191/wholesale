#!/usr/bin/env node
/**
 * Page checks for the Docket rebuild. Run against a running build:
 *
 *   npm run build && npx vite preview --port 4173 &
 *   node scripts/qa/check.mjs --base http://127.0.0.1:4173 --paths /,/design --out qa-report
 *
 * For each path it records, and fails on:
 *   - screenshots at 360, 390, 768, 1024, 1440, 1920 and 2560 px (full page)
 *   - horizontal overflow at any of those widths
 *   - axe-core violations (WCAG 2.2 A and AA rules), at 1440 and 390
 *   - console errors and failed requests to our own origin
 *   - broken internal links (every same-origin <a href>)
 *   - the page not being complete with reduced motion (anything still at opacity 0 or clipped away)
 * Results go to <out>/report.json and <out>/*.png. Exit code 1 if anything failed.
 */
import { chromium } from "playwright";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, v, i, all) => (v.startsWith("--") ? [...acc, [v.slice(2), all[i + 1]]] : acc), []));
const BASE = (args.base ?? "http://127.0.0.1:4173").replace(/\/$/, "");
const PATHS = (args.paths ?? "/").split(",");
const OUT = args.out ?? "qa-report";
const WIDTHS = [360, 390, 768, 1024, 1440, 1920, 2560];
const AXE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
mkdirSync(OUT, { recursive: true });

const slug = (p) => (p === "/" ? "home" : p.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "-"));
const report = { base: BASE, when: new Date().toISOString(), pages: [] };
let failed = false;
const fail = (page, kind, detail) => { failed = true; page.failures.push({ kind, detail }); };

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });

for (const path of PATHS) {
  const page = { path, failures: [], screenshots: [], axe: {} };
  report.pages.push(page);

  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    const errors = [];
    // "Failed to load resource" repeats a request failure without its URL; requests are checked below by URL
    p.on("console", (m) => m.type() === "error" && !m.text().startsWith("Failed to load resource") && errors.push(m.text()));
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("requestfailed", (r) => (r.url().startsWith(BASE) ? errors.push(`request failed: ${r.url()}`) : page.external = [...new Set([...(page.external ?? []), new URL(r.url()).host])]));
    const res = await p.goto(BASE + path, { waitUntil: "networkidle" });
    if (!res || res.status() >= 400) fail(page, "status", `${width}px: HTTP ${res?.status()}`);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(400);

    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) fail(page, "overflow", `${width}px: page is ${overflow}px wider than the screen`);

    // complete at rest: with reduced motion, nothing meant to be read may be hidden
    const hidden = await p.evaluate(() => [...document.querySelectorAll("h1,h2,h3,p,li,a,button,dd,dt,td,th,label")]
      .filter((el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (Number(s.opacity) === 0 || s.clipPath.includes("inset(0px 0px 100%") || s.clipPath.includes("inset(0px 100%")); })
      .slice(0, 5).map((el) => el.outerHTML.slice(0, 120)));
    if (hidden.length) fail(page, "hidden-at-rest", `${width}px: ${hidden.join(" | ")}`);

    const file = `${OUT}/${slug(path)}-${width}.png`;
    await p.screenshot({ path: file, fullPage: true });
    page.screenshots.push(file);

    if (width === 1440 || width === 390) {
      await p.addScriptTag({ content: AXE });
      const result = await p.evaluate(async () => window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } }));
      page.axe[width] = result.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help }));
      const serious = result.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      if (serious.length) fail(page, "axe", `${width}px: ${serious.map((v) => `${v.id} (${v.nodes.length})`).join(", ")}`);
    }

    if (width === 1440) {
      const links = await p.evaluate((base) => [...new Set([...document.querySelectorAll("a[href]")].map((a) => a.href).filter((h) => h.startsWith(base)).map((h) => h.split("#")[0]))], BASE);
      page.links = links.length;
      for (const href of links) {
        const r = await ctx.request.get(href, { maxRedirects: 5 }).catch(() => null);
        if (!r || r.status() >= 400) fail(page, "broken-link", `${href} -> ${r?.status() ?? "no response"}`);
      }
    }
    if (errors.length) fail(page, "console", `${width}px: ${[...new Set(errors)].slice(0, 5).join(" | ")}`);
    await ctx.close();
  }
}
await browser.close();
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
for (const page of report.pages) {
  console.log(`${page.failures.length ? "FAIL" : "PASS"}  ${page.path}  (${page.screenshots.length} screenshots, ${page.links ?? 0} links)${page.external ? `  [unreachable third parties: ${page.external.join(", ")}]` : ""}`);
  for (const f of page.failures) console.log(`   - ${f.kind}: ${f.detail}`);
}
process.exit(failed ? 1 : 0);
