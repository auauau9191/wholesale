import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DataBlock from "@/components/shell/DataBlock";
import PageHead from "@/components/shell/PageHead";
import { secondaryButton } from "@/components/console/FormBits";
import MarkSentDialog from "@/components/console/payouts/MarkSentDialog";
import { getPayouts, markPayoutConfirmed, markPayoutSent } from "@/services/adminService";
import { downloadCsv } from "@/lib/csv";
import { formatAud, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authed/admin/supplier-payouts")({
  head: () => ({ meta: [{ title: "Supplier payouts · Wholesale System" }] }),
  component: PayoutsPage,
});

const TONE = {
  scheduled: "bg-pill-amber text-pill-amber-ink",
  sent: "bg-pill-grey text-pill-grey-ink",
  confirmed: "bg-pill-green text-pill-green-ink",
};
const FILTERS = ["all", "scheduled", "sent", "confirmed"];
const HEAD = "px-3 py-2 text-left text-label font-normal text-app-meta first:pl-5 last:pr-5";
const CELL = "px-3 py-3 align-top first:pl-5 last:pr-5";
const monthNow = () => new Date().toISOString().slice(0, 7);

function PayoutsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("all");
  const [sending, setSending] = useState(null);
  const [supplierCode, setSupplierCode] = useState("");
  const [month, setMonth] = useState(monthNow());
  const { data, isLoading, error } = useQuery({ queryKey: ["payouts"], queryFn: getPayouts });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["payouts"] });
  const send = useMutation({
    mutationFn: (payload) => markPayoutSent({ payout_id: sending.id, ...payload }),
    onSuccess: () => {
      setSending(null);
      refresh();
      toast("Payout marked sent.");
    },
  });
  const confirm = useMutation({
    mutationFn: (row) => markPayoutConfirmed({ payout_id: row.id }),
    onSuccess: () => {
      refresh();
      toast("Payout confirmed.");
    },
    onError: (error) => toast(error.message),
  });

  const rows = (data?.rows ?? []).filter((row) => status === "all" || row.status === status);
  const scheduled = (data?.rows ?? []).filter((row) => row.status === "scheduled");
  const scheduledNet = scheduled.reduce((sum, row) => sum + (row.net_aud ?? 0), 0);

  const exportCsv = () =>
    downloadCsv(
      "supplier-payouts.csv",
      ["Payout", "Supplier", "Order", "Stage", "Gross A$", "Commission withheld A$", "Net A$", "Currency", "Amount", "Status", "Sent on", "Reference"],
      rows.map((row) => [
        row.payout_no, row.supplier, row.order_no, row.stage, row.gross_aud, row.commission_withheld_aud, row.net_aud,
        row.currency, row.amount_foreign ?? "", row.status, row.sent_on ?? "", row.provider_ref ?? "",
      ])
    );

  return (
    <div className="space-y-6">
      <PageHead
        title="Supplier payouts"
        note={
          data
            ? `${scheduled.length} payouts to send, ${formatAud(scheduledNet)} net. The balance carries our commission; the deposit does not.`
            : "Deposits and balances, with our commission withheld from the balance."
        }
      />

      {isLoading ? <DataBlock state="loading" /> : null}
      {error ? <DataBlock state="error" note={error.message} /> : null}

      {data ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                aria-pressed={status === value}
                className={[
                  "min-h-[36px] rounded-control border px-3 text-body",
                  status === value ? "border-data bg-pill-green text-pill-green-ink" : "border-control",
                ].join(" ")}
              >
                {value === "all" ? `All ${data.rows.length}` : value[0].toUpperCase() + value.slice(1)}
              </button>
            ))}
            <button type="button" onClick={exportCsv} disabled={!rows.length} className={`ml-auto ${secondaryButton}`}>
              Export CSV
            </button>
          </div>

          <section className="rounded-card border border-edge bg-sheet">
            {rows.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[940px] text-body">
                  <thead>
                    <tr>
                      <th className={HEAD}>Payout</th>
                      <th className={HEAD}>Supplier</th>
                      <th className={HEAD}>Order</th>
                      <th className={HEAD}>Stage</th>
                      <th className={`${HEAD} text-right`}>Gross</th>
                      <th className={`${HEAD} text-right`}>Commission withheld</th>
                      <th className={`${HEAD} text-right`}>Net</th>
                      <th className={HEAD}>Currency</th>
                      <th className={HEAD}>Status</th>
                      <th className={HEAD}><span className="sr-only">Action</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-t border-rule">
                        <td className={`${CELL} tabular`}>{row.payout_no}</td>
                        <td className={CELL}>{row.supplier}</td>
                        <td className={`${CELL} tabular`}>{row.order_no}</td>
                        <td className={CELL}>{row.stage}</td>
                        <td className={`${CELL} tabular text-right`}>{formatAud(row.gross_aud)}</td>
                        <td className={`${CELL} tabular text-right`}>{formatAud(row.commission_withheld_aud ?? 0)}</td>
                        <td className={`${CELL} tabular text-right`}>{formatAud(row.net_aud)}</td>
                        <td className={CELL}>
                          {row.currency}
                          {row.amount_foreign ? <p className="tabular text-label text-app-meta">{Number(row.amount_foreign).toLocaleString("en-AU", { maximumFractionDigits: 2 })}</p> : null}
                        </td>
                        <td className={CELL}>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-label ${TONE[row.status] ?? TONE.scheduled}`}>{row.status}</span>
                          {row.sent_on ? <p className="tabular text-label text-app-meta">{formatDate(row.sent_on)}</p> : null}
                          {row.provider_ref ? <p className="tabular text-label text-app-meta">{row.provider_ref}</p> : null}
                        </td>
                        <td className={`${CELL} text-right`}>
                          {row.status === "scheduled" ? (
                            <button type="button" onClick={() => setSending(row)} className={secondaryButton}>
                              Mark sent
                            </button>
                          ) : row.status === "sent" ? (
                            <button type="button" onClick={() => confirm.mutate(row)} disabled={confirm.isPending} className={secondaryButton}>
                              Mark confirmed
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="px-5 py-6 text-body text-app-meta">No payouts with that status.</p>
            )}
          </section>

          <section className="rounded-card border border-edge bg-sheet p-5">
            <h2 className="text-lead font-medium">Commission statement</h2>
            <p className="mt-1 text-body text-app-meta">One supplier, one month, every order and its commission, summed from the rows.</p>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <label className="block">
                <span className="text-label text-app-meta">Supplier</span>
                <select
                  value={supplierCode}
                  onChange={(event) => setSupplierCode(event.target.value)}
                  className="mt-1 min-h-[36px] rounded-control border border-control bg-sheet px-2 text-body outline-none focus:border-app-ink"
                >
                  <option value="">Choose a supplier</option>
                  {data.suppliers.map((item) => (
                    <option key={item.code} value={item.code}>{item.label}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-label text-app-meta">Month</span>
                <input
                  type="month"
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                  className="tabular mt-1 min-h-[36px] rounded-control border border-control bg-sheet px-2 text-body outline-none focus:border-app-ink"
                />
              </label>
              {supplierCode ? (
                <Link
                  to="/admin/commission-statement"
                  search={{ supplier: supplierCode, month }}
                  target="_blank"
                  className={secondaryButton}
                >
                  Open statement
                </Link>
              ) : null}
            </div>
          </section>

          <MarkSentDialog
            payout={sending}
            open={Boolean(sending)}
            onOpenChange={(open) => !open && setSending(null)}
            pending={send.isPending}
            error={send.error?.message ?? null}
            onSent={(payload) => send.mutate(payload)}
          />
        </>
      ) : null}
    </div>
  );
}