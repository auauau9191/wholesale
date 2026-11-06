import { base44 } from "@/api/base44Client";
import { toItems } from "@/services/paging";

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