import { createFileRoute } from "@tanstack/react-router";
import MemberPage from "@/components/shell/PageBlocks";

export const Route = createFileRoute("/_authed/_app/compare")({
  head: () => ({ meta: [{ title: "Compare · Wholesale System" }] }),
  component: ComparePage,
});

function ComparePage() {
  return (
    <MemberPage
      title="Compare"
      note="Two products side by side on landed cost and spec."
      emptyTitle="Nothing to compare yet."
      emptyNote="Add products from Browse to place them side by side."
    />
  );
}