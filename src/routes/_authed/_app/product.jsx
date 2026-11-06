import { createFileRoute } from "@tanstack/react-router";
import MemberPage from "@/components/shell/PageBlocks";

export const Route = createFileRoute("/_authed/_app/product")({
  head: () => ({ meta: [{ title: "Product · Wholesale System" }] }),
  component: ProductPage,
});

function ProductPage() {
  return (
    <MemberPage
      title="Product"
      note="Landed cost, the signed spec and the units on our shelf."
      emptyTitle="No product is open."
      emptyNote="Open a product from Browse to see its numbers and its shelf."
    />
  );
}