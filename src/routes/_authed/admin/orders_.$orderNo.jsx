import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import DataBlock from "@/components/shell/DataBlock";
import OrderActions from "@/components/console/orders/OrderActions";
import OrderMoney from "@/components/console/orders/OrderMoney";
import OrderTimeline from "@/components/orders/OrderTimeline";
import { statusOf, statusKey } from "@/lib/orderStatus";
import { actOnOrder, getAdminOrder } from "@/services/adminService";
import { formatDate, formatQty } from "@/lib/format";
import { useAdminT } from "@/lib/adminI18n";

export const Route = createFileRoute("/_authed/admin/orders_/$orderNo")({
  head: () => ({ meta: [{ title: "Order · Wholesale System" }] }),
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { t } = useAdminT();
  const { orderNo } = Route.useParams();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-order", orderNo],
    queryFn: () => getAdminOrder({ data: { order_no: orderNo } }),
  });

  const act = useMutation({
    mutationFn: (payload) => actOnOrder({ data: { order_id: data.order.id, ...payload } }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", orderNo] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast(result.refund_deposit ? t("page.order.cancelled") : t("page.order.updated"));
    },
    onError: (error) => toast(error.message),
  });

  if (isLoading) return <DataBlock state="loading" />;
  if (error) return <DataBlock state="error" note={error.message} />;
  if (!data) return <DataBlock title={t("page.order.missingTitle")} note={t("page.order.missingNote")} />;

  const { order } = data;
  const chip = statusOf(order.status);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2">
        <Link
          to="/admin/orders"
          aria-label={t("page.order.back")}
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-control hover:bg-pill-grey"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="tabular text-title font-medium tracking-[-0.01em]">{order.order_no}</h1>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-label ${chip.tone}`}>
              {t(statusKey(order.status))}
            </span>
          </div>
          <p className="mt-2 max-w-[680px] text-body text-app-meta">
            {data.member.business_name} · {data.product?.name ?? order.product_id} ·{" "}
            {t("page.order.units", { count: formatQty(order.quantity) })} ·{" "}
            {t("page.order.placed", { date: formatDate(order.created_date) })}
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <section className="rounded-card border border-edge bg-sheet p-5">
            <h2 className="text-lead font-medium">{t("page.order.title")}</h2>
            <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {[
                [t("page.order.product"), data.product?.name ?? order.product_id],
                [t("page.order.supplier"), `${data.supplier.headline} (${data.supplier.code})`],
                [t("page.order.lockedUnit"), order.approved_unit_id],
                [t("page.order.sampleRequest"), order.sample_request_no],
                [t("page.order.specRevision"), order.spec_revision],
                [t("page.order.colour"), order.colour],
                [t("page.order.route"), order.delivery_route],
                [t("page.order.container"), order.container_no],
                [t("page.order.attempts"), String(order.inspection_attempts ?? 0)],
                [t("page.order.member"), data.member.email],
              ].map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-3 border-b border-rule py-1.5">
                  <dt className="text-body text-app-soft">{label}</dt>
                  <dd className="tabular text-right text-body">{value ?? "—"}</dd>
                </div>
              ))}
            </dl>
            {order.inspection_report_url ? (
              <p className="mt-3 text-body">
                <a href={order.inspection_report_url} target="_blank" rel="noreferrer" className="underline">
                  {t("page.order.inspectionReport")}
                </a>
              </p>
            ) : null}
          </section>

          <section className="rounded-card border border-edge bg-sheet p-5">
            <h2 className="text-lead font-medium">{t("page.order.nextTitle")}</h2>
            <p className="mt-1 text-body text-app-meta">{t("page.order.nextNote")}</p>
            <div className="mt-3">
              <OrderActions
                actions={data.admin ? data.actions : []}
                pending={act.isPending}
                error={act.error?.message ?? null}
                onAct={(payload) => act.mutate(payload)}
              />
            </div>
          </section>

          <OrderTimeline entries={order.timeline} />
        </div>

        <div className="space-y-4">
          <OrderMoney order={order} admin={data.admin} payouts={data.payouts} />
          {data.admin ? (
            <p className="text-label text-app-meta">
              {t("page.order.contact")}: {data.supplier.legal_name ?? "—"}
              {data.supplier.contact_email ? ` · ${data.supplier.contact_email}` : ""}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}