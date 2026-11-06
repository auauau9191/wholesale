import { base44 } from "@/api/base44Client";
import { toItems } from "@/services/paging";

export async function listHubs() {
  const page = await base44.entities.Hub.filter(
    { is_active: true },
    { sort: "fallback_rank", limit: 10 }
  );
  return toItems(page);
}

export async function listContainers(hubCode) {
  const query = {};
  if (hubCode && hubCode !== "ALL") query.destination_hub = hubCode;
  const page = await base44.entities.Container.filter(query, {
    sort: "eta",
    limit: 50,
  });
  return toItems(page);
}