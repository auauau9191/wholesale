import { createFileRoute } from "@tanstack/react-router";
import { ConsolePage } from "@/components/shell/PageBlocks";

export const Route = createFileRoute("/_authed/admin/members")({
  head: () => ({ meta: [{ title: "Members · Wholesale System" }] }),
  component: MembersPage,
});

function MembersPage() {
  return (
    <ConsolePage
      title="Members"
      note="Who has joined, who is waiting for review and whose plan needs attention."
      scoped
      emptyTitle="No members yet."
      emptyNote="A member appears the moment an ABN is submitted for review."
    />
  );
}