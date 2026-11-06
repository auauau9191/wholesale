// Wholesale System — sample data for the team console and the buyer product page.
// Every count and total on screen is computed from these rows. Today is Friday 31 Oct 2026, Sydney.
// All businesses, suppliers, products and figures are SAMPLE DATA to be replaced (listed in the report).
window.WS = (() => {
  const TODAY = '2026-10-31';
  const DISPATCH_BUSINESS_DAYS = 2;
  const DECISION_DAYS = 14;

  // add n business days (Mon–Fri) to an ISO date
  const addBusinessDays = (iso, n) => {
    const d = new Date(iso + 'T12:00:00');
    while (n > 0) { d.setDate(d.getDate() + 1); const w = d.getDay(); if (w !== 0 && w !== 6) n--; }
    return d.toISOString().slice(0, 10);
  };
  const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

  const products = {
    'PC-CN014-0087': { name: 'Premium phone case', short: 'Phone case', supplier: 'CN014', category: 'PC' },
    'PT-CN052-0011': { name: 'Padded nylon harness', short: 'Pet harness', supplier: 'CN052', category: 'PT' },
    'BG-CN019-0006': { name: 'Waxed canvas tote', short: 'Canvas tote', supplier: 'CN019', category: 'BG' },
    'CF-CN033-0019': { name: 'Double-wall paper cup, 8 oz', short: 'Paper cup', supplier: 'CN033', category: 'CF' },
    'HW-CN027-0040': { name: 'Stoneware mug, 350 ml', short: 'Stoneware mug', supplier: 'CN027', category: 'HW' },
    'FT-CN061-0003': { name: 'Resistance band set', short: 'Band set', supplier: 'CN061', category: 'FT' },
    'ST-CN044-0012': { name: 'A5 dot-grid notebook', short: 'Notebook', supplier: 'CN044', category: 'ST' },
  };

  // the shelf: every unit of each product in today's queue. M = sealed master (never leaves).
  // state: in_stock | queued (reserved for a request in today's queue) | with_member | retired
  const shelf = {
    // index n is unit S0n; index 0 is the master
    'PC-CN014-0087': ['M', 'in_stock', 'in_stock', 'in_stock', 'with_member', 'with_member', 'with_member', 'queued'],
    'PT-CN052-0011': ['M', 'with_member', 'with_member', 'queued', 'in_stock', 'in_stock', 'in_stock', 'in_stock'],
    'BG-CN019-0006': ['M', 'in_stock', 'with_member', 'with_member', 'with_member', 'queued'],
    'CF-CN033-0019': ['M', 'with_member', 'with_member', 'queued', 'in_stock', 'with_member'],
    'HW-CN027-0040': ['M', 'with_member', 'with_member', 'with_member', 'queued', 'with_member', 'in_stock', 'in_stock', 'in_stock', 'in_stock', 'retired'],
    'FT-CN061-0003': ['M', 'with_member', 'queued', 'in_stock', 'in_stock', 'in_stock', 'in_stock'],
    'ST-CN044-0012': ['M', 'with_member', 'with_member', 'queued', 'with_member', 'in_stock', 'in_stock', 'in_stock', 'in_stock'],
  };
  const REORDER_LEVEL = 3;

  // requests. status: to_send | in_transit | waiting | on_hold   (overdue decisions are derived from 'waiting')
  const R = (no, member, abn4, unit, paid, requested, status, extra = {}) => ({ no, member, abn4, unit, product: unit.split('-').slice(0, 3).join('-'), paid, requested, status, ...extra });
  const requests = [
    R('SR-0324', 'Harbour Goods Pty Ltd', '556', 'PC-CN014-0087-S07', 'Join credit', '2026-10-29 09:14', 'to_send'),
    R('SR-0322', 'Coastline Pet Co', '937', 'PT-CN052-0011-S03', 'Order credit', '2026-10-28 15:02', 'to_send'),
    R('SR-0321', 'Bondi Bag Studio', '080', 'BG-CN019-0006-S05', 'Paid A$25', '2026-10-28 11:40', 'to_send'),
    R('SR-0326', 'Northside Café Supplies', '864', 'CF-CN033-0019-S03', 'Swap', '2026-10-30 08:31', 'to_send'),
    R('SR-0327', 'Kettle & Grain', '219', 'HW-CN027-0040-S04', 'Join credit', '2026-10-30 13:55', 'to_send'),
    R('SR-0328', 'Fern Street Fitness', '402', 'FT-CN061-0003-S02', 'Join credit', '2026-10-31 08:52', 'to_send'),
    R('SR-0329', 'Little Lane Stationery', '771', 'ST-CN044-0012-S03', 'Order credit', '2026-10-31 10:30', 'to_send'),

    R('SR-0318', 'Saltbush Living', '318', 'HW-CN027-0040-S02', 'Join credit', '2026-10-24 10:05', 'in_transit', { sent: '2026-10-27', eta: '2026-10-31' }),
    R('SR-0317', 'Two Rivers Tackle', '505', 'BG-CN019-0006-S03', 'Join credit', '2026-10-24 14:20', 'in_transit', { sent: '2026-10-27', eta: '2026-10-31' }),
    R('SR-0316', 'Morning Ritual Coffee', '622', 'CF-CN033-0019-S01', 'Join credit', '2026-10-23 09:48', 'in_transit', { sent: '2026-10-27', eta: '2026-10-30' }),
    R('SR-0315', 'Gully Road Pets', '143', 'PT-CN052-0011-S01', 'Paid A$25', '2026-10-23 16:10', 'in_transit', { sent: '2026-10-27', eta: '2026-11-03' }),
    R('SR-0314', 'Pocket & Pine', '977', 'PC-CN014-0087-S05', 'Join credit', '2026-10-23 11:31', 'in_transit', { sent: '2026-10-24', eta: '2026-10-29' }),
    R('SR-0313', 'Wattle & Co Gifts', '360', 'ST-CN044-0012-S01', 'Order credit', '2026-10-22 13:02', 'in_transit', { sent: '2026-10-24', eta: '2026-10-29' }),
    R('SR-0312', 'Seabreeze Retail', '811', 'PC-CN014-0087-S06', 'Join credit', '2026-10-22 08:44', 'in_transit', { sent: '2026-10-24', eta: '2026-10-30' }),
    R('SR-0311', 'Iron Bark Tools', '254', 'TL-CN038-0002-S04', 'Join credit', '2026-10-22 10:17', 'in_transit', { sent: '2026-10-24', eta: '2026-10-28' }),
    R('SR-0310', 'Lantern House', '690', 'HW-CN027-0040-S03', 'Order credit', '2026-10-21 15:58', 'in_transit', { sent: '2026-10-23', eta: '2026-10-28' }),
    R('SR-0309', 'Kindred Knits', '432', 'AA-CN071-0005-S02', 'Join credit', '2026-10-21 09:26', 'in_transit', { sent: '2026-10-23', eta: '2026-10-28' }),
    R('SR-0308', 'Hilltop Hardware', '587', 'TL-CN038-0002-S02', 'Paid A$25', '2026-10-21 12:40', 'in_transit', { sent: '2026-10-23', eta: '2026-11-03' }),
    R('SR-0307', 'Blue Gum Outfitters', '018', 'BG-CN019-0006-S04', 'Join credit', '2026-10-20 14:12', 'in_transit', { sent: '2026-10-22', eta: '2026-10-27' }),

    R('SR-0306', 'Paperbark Studio', '733', 'ST-CN044-0012-S02', 'Join credit', '2026-10-17 09:10', 'waiting', { delivered: '2026-10-22' }),
    R('SR-0305', 'Old Mill Kitchen', '146', 'CF-CN033-0019-S02', 'Join credit', '2026-10-16 11:05', 'waiting', { delivered: '2026-10-21' }),
    R('SR-0304', 'Sunday Market Co', '899', 'HW-CN027-0040-S01', 'Swap', '2026-10-15 15:44', 'waiting', { delivered: '2026-10-21' }),
    R('SR-0303', 'Rockpool Swim', '512', 'AA-CN071-0005-S01', 'Join credit', '2026-10-15 10:22', 'waiting', { delivered: '2026-10-20' }),
    R('SR-0302', 'Greenhood Pets', '277', 'PT-CN052-0011-S02', 'Order credit', '2026-10-14 13:39', 'waiting', { delivered: '2026-10-20' }),
    R('SR-0301', 'Marlowe Leather', '664', 'BG-CN019-0006-S02', 'Join credit', '2026-10-13 09:57', 'waiting', { delivered: '2026-10-17' }),
    R('SR-0300', 'Station Street Deli', '031', 'CF-CN033-0019-S05', 'Paid A$25', '2026-10-10 14:28', 'waiting', { delivered: '2026-10-19' }),
    R('SR-0299', 'Coral Coast Phones', '425', 'PC-CN014-0087-S04', 'Join credit', '2026-10-09 10:48', 'waiting', { delivered: '2026-10-18' }),
    R('SR-0298', 'Thistle & Thread', '808', 'AA-CN071-0005-S03', 'Join credit', '2026-10-08 16:02', 'waiting', { delivered: '2026-10-17' }),
    R('SR-0297', 'Ridgeline Climbing', '359', 'FT-CN061-0003-S01', 'Join credit', '2026-10-06 09:15', 'waiting', { delivered: '2026-10-10' }),
    R('SR-0296', 'Banksia Home', '720', 'HW-CN027-0040-S05', 'Order credit', '2026-10-03 11:37', 'waiting', { delivered: '2026-10-09' }),
    R('SR-0295', 'Quay Street Books', '184', 'ST-CN044-0012-S04', 'Join credit', '2026-10-02 13:50', 'waiting', { delivered: '2026-10-08' }),

    R('SR-0320', 'J. Nguyen Trading', '032', 'HW-CN027-0040-S06', 'Join credit', '2026-10-27 12:06', 'on_hold', { hold: 'Delivery address matches Banksia Home' }),
    R('SR-0319', 'Eastside Mobile', '556', 'PC-CN014-0087-S03', 'Join credit', '2026-10-27 09:33', 'on_hold', { hold: 'ABN already used its free sample (Harbour Goods)' }),
  ];

  // derived fields: due-out date for unsent requests, decision due for delivered ones
  for (const r of requests) {
    const day = r.requested.slice(0, 10);
    r.dueOut = addBusinessDays(day, DISPATCH_BUSINESS_DAYS);
    r.lateDays = r.status === 'to_send' && r.dueOut < TODAY ? Math.round((new Date(TODAY) - new Date(r.dueOut)) / 864e5) : 0;
    if (r.delivered) { r.decisionDue = addDays(r.delivered, DECISION_DAYS); r.overdue = r.decisionDue < TODAY; }
  }

  const views = {
    to_send: { label: 'To send today', rows: requests.filter((r) => r.status === 'to_send').sort((a, b) => a.dueOut.localeCompare(b.dueOut) || a.requested.localeCompare(b.requested)) },
    in_transit: { label: 'In transit', rows: requests.filter((r) => r.status === 'in_transit') },
    waiting: { label: 'Waiting on a decision', rows: requests.filter((r) => r.status === 'waiting' && !r.overdue) },
    overdue: { label: 'Decision overdue', rows: requests.filter((r) => r.status === 'waiting' && r.overdue) },
    on_hold: { label: 'On hold', rows: requests.filter((r) => r.status === 'on_hold') },
  };

  // checks: the counts are the rows; the parts make the whole
  const total = Object.values(views).reduce((s, v) => s + v.rows.length, 0);
  console.assert(total === requests.length, 'every request sits in exactly one view');
  console.assert(views.to_send.rows.length === 7, 'seven to send today');
  console.assert(views.overdue.rows.length === 3 && views.waiting.rows.length === 9, 'three overdue, nine waiting');
  console.assert(views.to_send.rows.filter((r) => r.lateDays > 0).length === 2, 'two past the 2-business-day promise');
  for (const r of views.to_send.rows) console.assert(shelf[r.product][+r.unit.slice(-2)] === 'queued', 'each queued request reserves its unit on the shelf: ' + r.unit);

  const inStock = (p) => shelf[p].filter((s) => s === 'in_stock').length;
  const low = Object.keys(shelf).filter((p) => inStock(p) <= REORDER_LEVEL).sort((a, b) => inStock(a) - inStock(b));

  // the buyer product page: PC-CN014-0087
  const FX = 1.55, BROKER = 350, GST = 0.10;
  const tiers = [
    { qty: 500, fob: 1.42, freight: 0.38 },
    { qty: 1000, fob: 1.31, freight: 0.30 },
    { qty: 2000, fob: 1.18, freight: 0.24 },
    { qty: 5000, fob: 0.96, freight: 0.16 },
    { qty: 10000, fob: 0.89, freight: 0.14 },
  ];
  const landed = tiers.map((t) => {
    const goods = +(t.fob * FX).toFixed(2), broker = +(BROKER / t.qty).toFixed(2);
    const gst = +((goods + t.freight) * GST).toFixed(2);
    const unit = +(goods + t.freight + broker + gst).toFixed(2);   // summed from the parts as shown
    return { ...t, goods, broker, gst, unit };
  });
  console.assert(landed.find((l) => l.qty === 5000).unit === 1.89, 'landed per unit at 5,000 matches the landing page (A$1.89)');

  return { TODAY, products, shelf, REORDER_LEVEL, requests, views, inStock, low, landed, FX };
})();
