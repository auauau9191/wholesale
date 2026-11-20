import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import docketCss from "@/styles/docket.css?url";
import Logo from "@/components/docket/Logo";
import Ticket from "@/components/docket/Ticket";
import Sheet from "@/components/docket/Sheet";
import Mark, { Stamp } from "@/components/docket/Mark";
import LandedDocket from "@/components/docket/LandedDocket";
import { DocketRow } from "@/components/docket/Docket";
import { SampleTags, TillKeys } from "@/components/docket/Choices";
import { AbnField } from "@/components/docket/Field";

/**
 * /design: the Docket system, working. Internal reference for designers, editors and agents
 * (DESIGN.md points here). Not indexed. Uses example rows shaped like the database, so it runs without one.
 */
export const Route = createFileRoute("/design")({
  head: () => ({
    meta: [{ title: "Docket design system: Lotwise" }, { name: "robots", content: "noindex, nofollow" }],
    links: [
      { rel: "preload", href: "/fonts/martian-mono-latin-var.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: docketCss },
    ],
  }),
  component: DesignPage,
});

// Example rows from the demo import (supabase/import.sql, is_demo = true)
const SETTINGS = { fx_usd_to_aud: 1.55, broker_fee_aud: 350, gst_rate: 0.1, default_duty_rate_no_origin_cert: 0.05, inspection_fee_aud: 470, deposit_rate: 0.3 };
const PRODUCTS = [
  { product_id: "CF-CN208-0385", name: "Milk jug, 600 ml", cat: "Café supplies", moq: 300, incoterm_port: "FOB Guangzhou", freight_aud_per_unit_estimate: 0.28, has_chafta_origin_cert: true, price_tiers: [{ min_qty: 300, max_qty: 999, fob_usd: 3.15 }, { min_qty: 1000, max_qty: null, fob_usd: 2.7 }], qtys: [300, 1000, 3000], supplier: { supplier_code: "CN208", verification_score: 74, filmed_date: "2026-04-12" } },
  { product_id: "BG-CN118-0252", name: "Everyday backpack, 22 L", cat: "Bags and backpacks", moq: 300, incoterm_port: "FOB Xiamen", freight_aud_per_unit_estimate: 0.52, has_chafta_origin_cert: true, price_tiers: [{ min_qty: 300, max_qty: 999, fob_usd: 7.8 }, { min_qty: 1000, max_qty: null, fob_usd: 6.75 }], qtys: [300, 1000, 3000] },
  { product_id: "PT-CN187-0356", name: "Adjustable dog harness", cat: "Pet accessories", moq: 500, incoterm_port: "FOB Shanghai", freight_aud_per_unit_estimate: 0.19, has_chafta_origin_cert: true, price_tiers: [{ min_qty: 500, max_qty: 1999, fob_usd: 2.48 }, { min_qty: 2000, max_qty: null, fob_usd: 2.12 }], qtys: [500, 2000, 5000] },
  { product_id: "HW-CN101-0231", name: "Stoneware mug, 320 ml", cat: "Homewares and kitchen", moq: 500, incoterm_port: "FOB Shantou", freight_aud_per_unit_estimate: 0.31, has_chafta_origin_cert: true, price_tiers: [{ min_qty: 500, max_qty: 1999, fob_usd: 1.86 }, { min_qty: 2000, max_qty: null, fob_usd: 1.52 }], qtys: [500, 2000, 5000] },
];

const COLOURS = [
  ["--dk-carbon", "Carbon", "The ground: carbon paper, the copy under every docket."],
  ["--dk-carbon-2", "Carbon, lifted", "Controls and second sheets on the ground."],
  ["--dk-sheen", "Sheen", "Rules and edges on the ground."],
  ["--dk-on-carbon", "On carbon", "Writing on the carbon."],
  ["--dk-muted", "Muted", "Quiet writing on the carbon."],
  ["--dk-paper", "Paper", "Thermal docket paper: everything Lotwise states as fact."],
  ["--dk-print", "Print", "Thermal black, on paper."],
  ["--dk-fade", "Faded print", "Secondary print on paper."],
  ["--dk-red", "Red", "The printer's second colour. Totals and the one action on a screen. Nowhere else."],
  ["--dk-pen", "Pen", "A person at Lotwise checked this: ticks, rings, stamps, notes."],
];

function DesignPage() {
  const [pi, setPi] = useState(0);
  const [qty, setQty] = useState(PRODUCTS[0].qtys[1]);
  const [plan, setPlan] = useState("m");
  const [abn, setAbn] = useState("");
  const [stamped, setStamped] = useState(0);
  const [marked, setMarked] = useState(0);
  const [torn, setTorn] = useState("");
  const product = PRODUCTS[pi];

  return (
    <div className="dk dk-grain" style={{ minHeight: "100vh" }}>
      <header className="dk-wrap" style={{ display: "flex", alignItems: "center", gap: 20, minHeight: 72, borderBottom: "1px solid var(--dk-sheen)" }}>
        <Logo printing />
        <p className="dk-label" style={{ margin: 0 }}>Docket: the Lotwise design system. Internal reference, not indexed.</p>
      </header>

      <main className="dk-wrap" style={{ display: "grid", gap: 96, paddingBlock: "56px 120px" }}>
        <section aria-labelledby="d-intro" style={{ display: "grid", gap: 20, maxWidth: 900 }}>
          <h1 id="d-intro" className="dk-h1">The machine prints. Our team marks. You tear.</h1>
          <p className="dk-lede">Every animation on Lotwise belongs to one of three actors, and each always moves the same way. <b>Print</b> is stepped and linear. <b>Mark</b> is drawn in pen blue, eased like a hand. <b>Tear</b> is yours, with a little spring. With reduced motion on, nothing moves and every page is complete.</p>
        </section>

        <section aria-labelledby="d-docket" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: 48, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 28 }}>
            <h2 id="d-docket" className="dk-h2">Print: the landed-cost docket</h2>
            <p className="dk-lede">Pick a product and the old docket tears off, then the new one feeds out in line steps. Change the quantity and only the figures that changed print again. Each proof is ticked once the docket has printed, then the total is circled.</p>
            <SampleTags
              legend="Product (examples from the demo shelf)"
              items={PRODUCTS.map((p, i) => ({ value: i, label: p.name, meta: `${p.cat}, MOQ ${p.moq.toLocaleString("en-AU")}` }))}
              value={pi}
              onChange={(i) => { setPi(i); setQty(PRODUCTS[i].qtys[1]); }}
            />
            <TillKeys legend="How many units?" items={product.qtys.map((q) => ({ value: q, label: q.toLocaleString("en-AU") }))} value={qty} onChange={setQty} />
          </div>
          <LandedDocket product={product} settings={SETTINGS} quantity={qty} />
        </section>

        <section aria-labelledby="d-mark" style={{ display: "grid", gap: 28 }}>
          <h2 id="d-mark" className="dk-h2">Mark: a person checked this</h2>
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "grid", gap: 8, justifyItems: "start" }}><Mark key={`t${marked}`} kind="tick" play className="dk-mark--lg" /><span className="dk-label">Tick: a proof checked</span></div>
            <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
              <span className="dk-figure dk-ringed" style={{ fontSize: 56, color: "var(--dk-paper)" }}>74<Mark key={`r${marked}`} kind="ring" play /></span>
              <span className="dk-label">Ring: the figure that matters</span>
            </div>
            <div style={{ width: 260 }}><Stamp key={`s${stamped}`} words={<>MATCHED<br />TO MASTER</>} landed /></div>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="button" className="dk-key" onClick={() => setMarked((v) => v + 1)}>Draw again</button>
              <button type="button" className="dk-key" onClick={() => setStamped((v) => v + 1)}>Stamp again</button>
            </div>
          </div>
        </section>

        <section aria-labelledby="d-tear" style={{ display: "grid", gap: 28 }}>
          <h2 id="d-tear" className="dk-h2">Tear: the one action</h2>
          <p className="dk-lede">Red appears only where money adds up or where you act. One ticket per screen. Its tab tears off when you press it, then the action runs.</p>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
            <Ticket tab="A$60" onTorn={() => setTorn("Torn: this would open /join.")}>Join for three months</Ticket>
            <Ticket size="sm" tab="A$60" onTorn={() => setTorn("Torn: small ticket for the header.")}>Join</Ticket>
            <Ticket tab="A$60" disabled>Continue to payment</Ticket>
            <a className="dk-link" href="#d-tear">A quiet link</a>
          </div>
          <p className="dk-label" aria-live="polite" style={{ margin: 0, minHeight: "1.6em" }}>{torn}</p>
        </section>

        <section aria-labelledby="d-sheet" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", gap: 48, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 20 }}>
            <h2 id="d-sheet" className="dk-h2">Sheets and fields</h2>
            <p className="dk-lede">A sheet is paper not fed from a printer. Change the plan and only the changed rows reprint.</p>
            <TillKeys ariaLabel="How you pay after three months" items={[{ value: "m", label: "Monthly" }, { value: "y", label: "Yearly" }]} value={plan} onChange={setPlan} />
            <AbnField value={abn} onChange={setAbn} />
          </div>
          <Sheet edges="both" style={{ padding: "22px 26px 8px" }}>
            <DocketRow label="First three months, paid once" value="A$60.00" />
            <DocketRow label={plan === "y" ? "Then each year, two months free" : "Then each month"} value={plan === "y" ? "A$450.00" : "A$45.00"} />
            <DocketRow label="Your first sample, once per ABN" value="A$0.00" />
            <DocketRow label="Our fee on your order" value="A$0.00" red />
            <p className="dk-note" style={{ margin: "8px 0 18px" }}>We email you 7 days before billing starts.</p>
          </Sheet>
        </section>

        <section aria-labelledby="d-colour" style={{ display: "grid", gap: 28 }}>
          <h2 id="d-colour" className="dk-h2">Colour: one job each</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))", gap: 12 }}>
            {COLOURS.map(([token, name, job]) => (
              <li key={token} style={{ border: "1px solid var(--dk-sheen)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: 72, background: `var(${token})` }} />
                <div style={{ padding: "12px 14px", display: "grid", gap: 4 }}>
                  <b style={{ color: "var(--dk-paper)", fontSize: 13 }}>{name}</b>
                  <code style={{ fontSize: 11, color: "var(--dk-muted)" }}>{token}</code>
                  <span style={{ fontSize: 12 }}>{job}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="d-type" style={{ display: "grid", gap: 20 }}>
          <h2 id="d-type" className="dk-h2">Type: Martian Mono only</h2>
          <p className="dk-h1" aria-hidden="true">Landed, A$5.27</p>
          <p className="dk-h3" style={{ color: "var(--dk-paper)" }}>Headings at 75% width, weight 800</p>
          <p className="dk-lede">Reading text at 75% width, weight 400, about 56 characters to a line, so a monospaced face stays comfortable to read.</p>
          <p className="dk-figure" style={{ fontSize: 96, color: "var(--dk-paper)", margin: 0 }}>0%</p>
          <p className="dk-label" style={{ margin: 0 }}>Big figures: hairline weight 150, tabular. Labels: 12px, weight 600.</p>
        </section>
      </main>
    </div>
  );
}
