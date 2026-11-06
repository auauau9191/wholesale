import { createFileRoute } from "@tanstack/react-router";
import { ConsolePage } from "@/components/shell/PageBlocks";

export const Route = createFileRoute("/_authed/admin/suppliers")({
  head: () => ({ meta: [{ title: "Suppliers · Wholesale System" }] }),
  component: SuppliersPage,
});

function SuppliersPage() {
  return (
    <ConsolePage
      title="Suppliers"
      note="Every factory we work with, live and in progress."
      emptyTitle="No suppliers yet."
      emptyNote="A supplier record holds the visit, the film and the checks it passed."
    />
  );
}