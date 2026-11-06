import { createFileRoute } from "@tanstack/react-router";
import { ConsolePage } from "@/components/shell/PageBlocks";

export const Route = createFileRoute("/_authed/admin/sample-requests")({
  head: () => ({ meta: [{ title: "Sample requests · Wholesale System" }] }),
  component: SampleRequestsPage,
});

function SampleRequestsPage() {
  return (
    <ConsolePage
      title="Sample requests"
      note="What to pack today, what is in transit and who is deciding."
      scoped
      emptyTitle="No sample requests yet."
      emptyNote="A request appears here the moment a member uses a credit."
    />
  );
}