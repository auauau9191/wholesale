/**
 * Every file in public/media, with the placement and alt text it was delivered
 * with (public/media/MEDIA.md). It is licensed stock footage of factories and
 * warehouses in general: atmosphere only, never captioned as a named supplier,
 * Brisbane or Sydney. Every video is a muted H.264 MP4 with a matching poster.
 */

export const VIDEOS = {
  "hero-china-factory-aerial": {
    width: 1920,
    height: 1080,
    seconds: 12,
    placement: 'Landing hero, "China" chapter of the route band',
    alt: "Aerial view over factory roofs with hills behind",
  },
  "hero-hub-aerial-vertical": {
    width: 720,
    height: 1280,
    seconds: 10,
    placement: "Landing hero on phones (≤ 640 px)",
    alt: "Aerial view of a large warehouse with trucks at the docks",
  },
  "factory-operator": {
    seconds: 8,
    placement: 'Route band, "Factory verification"',
    alt: "A machine operator working at station 197",
  },
  "factory-machine-close": {
    seconds: 7,
    placement: "Supplier directory, empty-state and placeholder film",
    alt: "Close view of an operator behind a machine",
  },
  "factory-fabric-line": {
    seconds: 10,
    placement: "Category page header, textiles and home",
    alt: "Worker at a fabric line, rolls in the foreground",
  },
  "factory-yarn-cones": {
    seconds: 10,
    placement: "Category page header, apparel",
    alt: "Yarn cones feeding a knitting machine",
  },
  "factory-packing-line": {
    seconds: 10,
    placement: '"How an order is made", packing step',
    alt: "Packers bagging goods at a long table",
  },
  "transit-conveyor-rollers": {
    seconds: 10,
    note: "Half speed",
    placement: 'Route band, "Containers" chapter',
    alt: "Blue trays moving over conveyor rollers",
  },
  "hub-receiving-floor": {
    seconds: 10,
    placement: "Hubs section, Brisbane card",
    alt: "Cartons on pallets being moved across a warehouse floor",
  },
  "hub-racking-aisle": {
    seconds: 10,
    placement: "Hubs section, Sydney card",
    alt: "A racking aisle stacked with cartons",
  },
  "hub-qc-check": {
    seconds: 7,
    placement: '"QC / samples warehouse" step',
    alt: "A worker checking stock on a tablet",
  },
  "hub-sample-picker": {
    seconds: 8.8,
    placement: '"Your sample ships in 2 business days"',
    alt: "A worker carrying a carton down an aisle",
  },
  "hub-pallet-jack": {
    seconds: 10,
    placement: "Bulk-order delivery step",
    alt: "A worker pulling a pallet jack",
  },
  "hub-forklift-aisle": {
    seconds: 10,
    placement: "Join page side panel",
    alt: "Forklift in a high racking aisle",
  },
};

/** Photos, in a 1600 px and an 800 px version of each. */
export const PHOTOS = {
  "hub-team-at-racks": { placement: "Hubs section, people photo (portrait)" },
  "hub-orange-racking": { placement: "Sample pages, side image (portrait)" },
  "hub-forklift-shelves": { placement: "Join page" },
  "hub-team-carrying": { placement: 'Pricing page, "Samples" group' },
  "hub-boxes-stacked": { placement: "Email header, OG/social image" },
  "retail-aisle-shelves": {
    placement: '"Delivered to QLD / NSW / VIC / other", representing the buyer\'s own shelf',
  },
};

export function videoSrc(name) {
  return `/media/video/${name}.mp4`;
}

export function videoPoster(name) {
  return `/media/posters/${name}.jpg`;
}

export function imageSrc(name, width = 1600) {
  return `/media/images/${name}${width === 800 ? "-800" : ""}.jpg`;
}

/** A video entry with its paths resolved. */
export function video(name) {
  const entry = VIDEOS[name];
  if (!entry) throw new Error(`Unknown video: ${name}`);
  return { ...entry, name, src: videoSrc(name), poster: videoPoster(name) };
}