import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import DataBlock from "@/components/shell/DataBlock";
import LockedSampleCard from "@/components/orders/LockedSampleCard";
import QuantityStepper from "@/components/orders/QuantityStepper";
import OrderLines from "@/components/orders/OrderLines";
import HowYouPay from "@/components/orders/HowYouPay";
import OrderPlaced from "@/components/orders/OrderPlaced";
import useAppSettings from "@/hooks/useAppSettings";
import { formatAudWhole } from "@/lib/format";
import { fetchOrderBuilder, fetchQuote, placeOrder } from "@/services/orderService";

export const Route = createFileRoute("/_authed/_app/orders_/new")({
  validateSearch: (search) => ({ request: search.request ? String(search.request) : undefined }),
  head: () => ({ meta: [{ title: "Bulk order · Wholesale System" }] }),
  component: OrderBuilderPage,
});

function OrderBuilderPage() {
  const { request } = Route.useSearch();
  const { data: settings } = useAppSettings();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(null);

  const builder = useQuery({
    queryKey: ["order-builder", request],
    queryFn: () => fetchOrderBuilder(request),
    enabled: Boolean(request),
    retry: false,
  });
  const lock = builder.data;
  const qty = quantity ?? lock?.default_quantity;

  const quote = useQuery({
    queryKey: ["order-quote", lock?.product_id, qty],
    queryFn: () => fetchQuote(lock.product_id, qty),
    enabled: Boolean(lock && qty),
    placeholderData: keepPreviousData,
  });

  const place = useMutation({
    mutationFn: () => placeOrder(request, qty),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-orders"] }),
  });

  return (
    <div className="mx-auto max-w-[640px] space-y-5">
      <div className="flex items-start gap-2">
        <Link to="/samples" aria-label="Back to samples" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control hover:bg-pill-grey">
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-title font-medium tracking-[-0.01em]">Bulk order</h1>
          <p className="mt-2 text-body text-app-meta">
            Locked to the sample you approved. Quantities step up from the factory&apos;s minimum.
          </p>
        </div>
      </div>

      {!request ? <DataBlock title="Start from a sample you approved." note="Approve a sample on the Samples page, then order it here." /> : null}
      {builder.isLoading ? <DataBlock state="loading" /> : null}
      {builder.error ? <DataBlock state="error" note={builder.error.message} /> : null}

      {lock && place.data ? <OrderPlaced order={place.data} /> : null}

      {lock && !place.data ? (
        <>
          <LockedSampleCard lock={lock} />
          <section className="rounded-card border border-edge bg-sheet p-5">
            <QuantityStepper
              quantity={qty}
              moq={lock.moq}
              step={lock.step}
              unitFob={quote.data?.unit_fob_usd}
              disabled={place.isPending}
              onChange={setQuantity}
            />
            <div className="mt-5">
              {quote.data ? <OrderLines quote={quote.data} commissionRate={settings?.supplier_commission_rate} /> : null}
              {quote.isLoading ? <DataBlock state="loading" /> : null}
              {quote.error ? <p className="text-body text-alert">{quote.error.message}</p> : null}
            </div>
          </section>
          {quote.data ? <HowYouPay quote={quote.data} depositRate={settings?.deposit_rate} /> : null}
          {place.error ? <p className="text-body text-alert">{place.error.message}</p> : null}
          <button
            type="button"
            onClick={() => place.mutate()}
            disabled={!quote.data || quote.isFetching || place.isPending}
            className="min-h-[48px] w-full rounded-control bg-app-ink px-5 text-lead font-medium text-sheet transition-transform duration-150 active:scale-[0.97] disabled:opacity-40"
          >
            {place.isPending
              ? "Placing your order"
              : `Confirm order and pay ${formatAudWhole(quote.data?.deposit_aud)} deposit`}
          </button>
        </>
      ) : null}
    </div>
  );
}