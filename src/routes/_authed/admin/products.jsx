import { createFileRoute } from "@tanstack/react-router";
import { ConsolePage } from "@/components/shell/PageBlocks";

export const Route = createFileRoute("/_authed/admin/products")({
  head: () => ({ meta: [{ title: "Products · Wholesale System" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  return (
    <ConsolePage
      title="Products"
      note="The catalogue, its price tiers and the signed spec behind each one."
      emptyTitle="No products yet."
      emptyNote="A product goes live once its spec is signed and a sample unit is on a shelf."
    />
  );
}