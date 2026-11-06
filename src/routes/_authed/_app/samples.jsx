import { createFileRoute } from "@tanstack/react-router";
import MemberPage from "@/components/shell/PageBlocks";

export const Route = createFileRoute("/_authed/_app/samples")({
  head: () => ({ meta: [{ title: "Samples · Wholesale System" }] }),
  component: SamplesPage,
});

function SamplesPage() {
  return (
    <MemberPage
      title="Samples"
      note="Requests, tracking and the decision you made."
      emptyTitle="No sample requests yet."
      emptyNote="Your first sample uses the free credit that comes with joining."
    />
  );
}