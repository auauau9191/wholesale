/** filter() and list() return a page object once options are passed. */
export function toItems(result) {
  if (Array.isArray(result)) return result;
  return result?.items ?? [];
}