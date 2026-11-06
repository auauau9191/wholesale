import { base44 } from "@/api/base44Client";
import { toItems } from "@/services/paging";
import {
  getMySamples,
  getSampleEligibility,
  recordDecision,
  requestSample,
} from "@/lib/sample-fns";

/** Every sample rule runs on the server; these only call it. */
export const fetchEligibility = (productId, colour) =>
  getSampleEligibility({ data: { product_id: productId, ...(colour ? { colour } : {}) } });

export const submitSampleRequest = (productId, colour) =>
  requestSample({ data: { product_id: productId, ...(colour ? { colour } : {}) } });

export const submitDecision = (payload) => recordDecision({ data: payload });

export const fetchMySamples = () => getMySamples();

export const HUB_CITY = { BNE: "Brisbane", SYD: "Sydney" };

/** Sample requests for the signed-in member. */
export async function listMyRequests(email) {
  if (!email) return [];
  const page = await base44.entities.SampleRequest.filter(
    { user_email: email },
    { sort: "-created_date", limit: 50 }
  );
  return toItems(page);
}

/** Sample units of one product, across both hubs. */
export async function listUnitsForProduct(productId) {
  const page = await base44.entities.SampleUnit.filter(
    { product_id: productId },
    { limit: 100 }
  );
  return toItems(page);
}

/** Sample units for a set of products, both hubs. */
export async function listUnitsForProducts(productIds) {
  if (!productIds?.length) return [];
  const page = await base44.entities.SampleUnit.filter(
    { product_id: { $in: productIds } },
    { limit: 300 }
  );
  return toItems(page);
}

/** Staff: the units on one hub's shelf. */
export async function listHubUnits(hubCode) {
  const query = {};
  if (hubCode && hubCode !== "ALL") query.hub_code = hubCode;
  const page = await base44.entities.SampleUnit.filter(query, { limit: 100 });
  return toItems(page);
}