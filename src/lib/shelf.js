/** How many units of this product a member can actually be sent. */
export function freeToSend(units = []) {
  return units.filter((unit) => !unit.is_master && unit.status === "in_stock").length;
}

/** Free units per product id, for lists. */
export function freeByProduct(units = []) {
  return units.reduce((counts, unit) => {
    if (!unit.is_master && unit.status === "in_stock") {
      counts[unit.product_id] = (counts[unit.product_id] ?? 0) + 1;
    }
    return counts;
  }, {});
}