import { createFileRoute } from "@tanstack/react-router";
import MemberPage from "@/components/shell/PageBlocks";

export const Route = createFileRoute("/_authed/_app/supplier")({
  head: () => ({ meta: [{ title: "Supplier · Wholesale System" }] }),
  component: SupplierPage,
});

function SupplierPage() {
  return (
    <MemberPage
      title="Supplier"
      note="Factories we have visited, filmed and signed."
      emptyTitle="No live suppliers yet."
      emptyNote="Each supplier carries our own footage and the checks it passed."
    />
  );
}