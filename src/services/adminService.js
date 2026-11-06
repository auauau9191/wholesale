import { base44 } from "@/api/base44Client";
import { toItems } from "@/services/paging";
import { actOnSampleRequest, getDispatchLabels, getSampleQueue } from "@/lib/console-fns";

/** Console: the sample queue, its actions and its labels, scoped to a hub. */
export const fetchSampleQueue = (hub) => getSampleQueue({ data: { hub } });
export const actOnRequest = (payload) => actOnSampleRequest({ data: payload });
export const fetchDispatchLabels = (hub) => getDispatchLabels({ data: { hub } });

/** The AppSettings record: every configurable number lives here. */
export async function getSettings() {
  const page = await base44.entities.AppSettings.list({ limit: 1 });
  return toItems(page)[0] ?? null;
}

/** Admin: the supplier pipeline, newest first. */
export async function listSuppliers({ stage, limit = 50 } = {}) {
  const query = {};
  if (stage) query.pipeline_stage = stage;
  const page = await base44.entities.Supplier.filter(query, {
    sort: "-created_date",
    limit,
  });
  return toItems(page);
}

/** Admin: sample requests, optionally for one hub. */
export async function listSampleRequests({ hubCode, status, limit = 50 } = {}) {
  const query = {};
  if (hubCode && hubCode !== "ALL") query.hub_code = hubCode;
  if (status) query.status = status;
  const page = await base44.entities.SampleRequest.filter(query, {
    sort: "decision_due",
    limit,
  });
  return toItems(page);
}