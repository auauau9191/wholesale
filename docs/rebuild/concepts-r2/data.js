// Demo data from supabase/import.sql (is_demo = true). Landed cost uses the same formula as src/lib/landedSheet.js.
window.LW = {
  settings: { fx: 1.55, broker: 350, gst: 0.1, dutyNoCert: 0.05, inspection: 470, sampleFee: 25, deposit: 0.3, dispatchDays: 2, decisionDays: 14 },
  products: [
    { id: "CF-CN208-0385", name: "Milk jug, 600 ml", cat: "Café supplies", supplier: "CN208", city: "Foshan", score: 74, filmed: "12 Apr 2026", moq: 300, lead: 36, port: "Guangzhou", freight: 0.28, chafta: true, tiers: [[300, 3.15], [1000, 2.7]], qtys: [300, 1000, 3000], img: "media/factory-machine-close.jpg" },
    { id: "BG-CN118-0252", name: "Everyday backpack, 22 L", cat: "Bags and backpacks", supplier: "CN118", city: "Xiamen", moq: 300, lead: 35, port: "Xiamen", freight: 0.52, chafta: true, tiers: [[300, 7.8], [1000, 6.75]], qtys: [300, 1000, 3000] },
    { id: "PT-CN187-0356", name: "Adjustable dog harness", cat: "Pet accessories", supplier: "CN187", city: "", moq: 500, lead: 28, port: "Shanghai", freight: 0.19, chafta: true, tiers: [[500, 2.48], [2000, 2.12]], qtys: [500, 2000, 5000] },
    { id: "HW-CN101-0231", name: "Stoneware mug, 320 ml", cat: "Homewares and kitchen", supplier: "CN101", city: "", moq: 500, lead: 40, port: "Shantou", freight: 0.31, chafta: true, tiers: [[500, 1.86], [2000, 1.52]], qtys: [500, 2000, 5000] }
  ],
  landed(p, qty) {
    const s = this.settings, r2 = (v) => Math.round((Number(v) || 0) * 100) / 100;
    let fob = p.tiers[0][1]; for (const [min, f] of p.tiers) if (qty >= min) fob = f;
    const goods = r2(fob * s.fx), freight = r2(p.freight), duty = r2(goods * (p.chafta ? 0 : s.dutyNoCert));
    const broker = r2(s.broker / qty), gst = r2(s.gst * (goods + freight + duty));
    return { fob, goods, freight, duty, broker, gst, landed: r2(goods + freight + duty + broker + gst) };
  }
};
