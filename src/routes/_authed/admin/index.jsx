import { createFileRoute } from "@tanstack/react-router";
import { ConsolePage } from "@/components/shell/PageBlocks";

export const Route = createFileRoute("/_authed/admin/")({
  head: () => ({ meta: [{ title: "Overview · Wholesale System" }] }),
  component: OverviewPage,
});

function OverviewPage() {
  return (
    <ConsolePage
      title="Overview"
      note="What needs attention today."
      scoped
      emptyTitle="Nothing to report yet."
      emptyNote="Counts appear as members, suppliers, samples and orders arrive."
    />
  );
}