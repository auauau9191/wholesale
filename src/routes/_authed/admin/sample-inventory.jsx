import { createFileRoute } from "@tanstack/react-router";
import { ConsolePage } from "@/components/shell/PageBlocks";

export const Route = createFileRoute("/_authed/admin/sample-inventory")({
  head: () => ({ meta: [{ title: "Sample inventory · Wholesale System" }] }),
  component: SampleInventoryPage,
});

function SampleInventoryPage() {
  return (
    <ConsolePage
      title="Sample inventory"
      note="Every unit on the shelf, from the master that never leaves to the ones out with members."
      scoped
      emptyTitle="No sample units yet."
      emptyNote="Units arrive with a container, are checked against the signed spec, then go on the shelf."
    />
  );
}