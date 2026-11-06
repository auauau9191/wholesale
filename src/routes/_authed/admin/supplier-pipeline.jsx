import { createFileRoute } from "@tanstack/react-router";
import { ConsolePage } from "@/components/shell/PageBlocks";

export const Route = createFileRoute("/_authed/admin/supplier-pipeline")({
  head: () => ({ meta: [{ title: "Supplier pipeline · Wholesale System" }] }),
  component: PipelinePage,
});

function PipelinePage() {
  return (
    <ConsolePage
      title="Supplier pipeline"
      note="Factories from the first screen through the visit and the film to a signed agreement."
      emptyTitle="The pipeline is empty."
      emptyNote="Screening a supplier is the first step, and it starts here."
    />
  );
}