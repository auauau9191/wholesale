import { base44 } from "@/api/base44Client";
import { toItems } from "@/services/paging";

/** The signed-in member's profile. */
export async function getMyProfile(email) {
  if (!email) return null;
  const page = await base44.entities.MemberProfile.filter(
    { user_email: email },
    { limit: 1 }
  );
  return toItems(page)[0] ?? null;
}

export async function listMyCredits(email, limit = 20) {
  if (!email) return [];
  const page = await base44.entities.CreditLedger.filter(
    { user_email: email },
    { sort: "-created_date", limit }
  );
  return toItems(page);
}

/** Admin: a page of member profiles, optionally filtered by status. */
export async function listMembers({ status, limit = 50 } = {}) {
  const query = {};
  if (status) query.status = status;
  const page = await base44.entities.MemberProfile.filter(query, {
    sort: "-created_date",
    limit,
  });
  return toItems(page);
}