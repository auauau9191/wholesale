# Wholesale System: media pack

All clips are muted H.264 MP4s with faststart, 25 fps and a matching poster JPG. Each file is under 3.5 MB. They live in the repository at `public/media/` (uploaded through GitHub), so they are served as `/media/...` and come out in every ZIP export.

**Honesty rule:** this is licensed stock footage of factories and warehouses in general, not our suppliers or our hubs. Show it only as atmosphere, and never caption it as a named supplier, Brisbane or Sydney. Every clip carries `alt` text plus a small caption, "Illustrative footage", wherever it appears near real data. Replace it with our own films as they are shot. Supplier film cards always use the supplier's own verification film.

| File | Length | Where it goes | Alt text |
| --- | --- | --- | --- |
| hero-china-factory-aerial.mp4 (1920×1080) | 12 s | Landing hero, "China" chapter of the route band | Aerial view over factory roofs with hills behind |
| hero-hub-aerial-vertical.mp4 (720×1280) | 10 s | Landing hero on phones (≤ 640 px) | Aerial view of a large warehouse with trucks at the docks |
| factory-operator.mp4 | 8 s | Route band, "Factory verification" | A machine operator working at station 197 |
| factory-machine-close.mp4 | 7 s | Supplier directory, empty-state and placeholder film | Close view of an operator behind a machine |
| factory-fabric-line.mp4 | 10 s | Category page header, textiles and home | Worker at a fabric line, rolls in the foreground |
| factory-yarn-cones.mp4 | 10 s | Category page header, apparel | Yarn cones feeding a knitting machine |
| factory-packing-line.mp4 | 10 s | "How an order is made", packing step | Packers bagging goods at a long table |
| transit-conveyor-rollers.mp4 | 10 s (half speed) | Route band, "Containers" chapter | Blue trays moving over conveyor rollers |
| hub-receiving-floor.mp4 | 10 s | Hubs section, Brisbane card | Cartons on pallets being moved across a warehouse floor |
| hub-racking-aisle.mp4 | 10 s | Hubs section, Sydney card | A racking aisle stacked with cartons |
| hub-qc-check.mp4 | 7 s | "QC / samples warehouse" step | A worker checking stock on a tablet |
| hub-sample-picker.mp4 | 8.8 s | "Your sample ships in 2 business days" | A worker carrying a carton down an aisle |
| hub-pallet-jack.mp4 | 10 s | Bulk-order delivery step | A worker pulling a pallet jack |
| hub-forklift-aisle.mp4 | 10 s | Join page side panel | Forklift in a high racking aisle |

Photos (`images/`, a 1600 px and an 800 px version of each):

| File | Where it goes |
| --- | --- |
| hub-team-at-racks.jpg | Hubs section, people photo (portrait) |
| hub-orange-racking.jpg | Sample pages, side image (portrait) |
| hub-forklift-shelves.jpg | Join page |
| hub-team-carrying.jpg | Pricing page, "Samples" group |
| hub-boxes-stacked.jpg | Email header, OG/social image |
| retail-aisle-shelves.jpg | "Delivered to QLD / NSW / VIC / other", representing the buyer's own shelf |

Video rules for the build:

- Use `<video autoplay muted loop playsinline preload="metadata" poster=…>`.
- Mount videos only when they are near the viewport, via IntersectionObserver.
- Pause them when they are off screen or the tab is hidden.
- With `prefers-reduced-motion` or Save-Data on, show the poster only.
- Show no more than 2 videos playing at once.
