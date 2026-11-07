import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DataBlock from "@/components/shell/DataBlock";
import PageHead from "@/components/shell/PageHead";
import { primaryButton, secondaryButton } from "@/components/console/FormBits";
import { activateMembership } from "@/lib/member-fns";
import { getMembersBoard, setMemberStatus } from "@/lib/console-pages-fns";
import { formatDate } from "@/lib/format";
import { useAdminT } from "@/lib/adminI18n";

const TABS = ["pending_review", "active", "on_hold", "suspended"];
const HEAD = "px-3 py-2 text-left text-label font-normal text-app-meta first:pl-5 last:pr-5";
const CELL = "px-3 py-3 align-top first:pl-5 last:pr-5";
const PILL = {
  pending_review: "bg-pill-amber text-pill-amber-ink",
  active: "bg-pill-green text-pill-green-ink",
  on_hold: "bg-pill-grey text-pill-grey-ink",
  suspended: "bg-pill-grey text-pill-grey-ink",
};

export const Route = createFileRoute("/_authed/admin/members")({
  head: () => ({ meta: [{ title: "Members · Wholesale System" }] }),
  component: MembersPage,
});

function MembersPage() {
  const { t } = useAdminT();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("pending_review");
  const { data, isLoading, error } = useQuery({ queryKey: ["members-board"], queryFn: () => getMembersBoard() });
  const done = (message) => {
    queryClient.invalidateQueries({ queryKey: ["members-board"] });
    toast(message);
  };
  const activate = useMutation({
    mutationFn: (row) => activateMembership({ data: { user_email: row.user_email } }),
    onSuccess: (_, row) => done(t("page.members.activated", { name: row.business_name || row.user_email })),
    onError: (e) => toast(e.message),
  });
  const hold = useMutation({
    mutationFn: (row) => setMemberStatus({ data: { profile_id: row.id, status: "on_hold" } }),
    onSuccess: (_, row) => done(t("page.members.held", { name: row.business_name || row.user_email })),
    onError: (e) => toast(e.message),
  });

  const rows = (data ?? []).filter((row) => row.status === tab);
  const pending = (data ?? []).filter((row) => row.status === "pending_review").length;
  const busy = activate.isPending || hold.isPending;

  const action = (row) =>
    row.status === "pending_review" || row.status === "on_hold" ? (
      <button type="button" className={primaryButton} disabled={busy} onClick={() => activate.mutate(row)}>
        {t("page.members.activate")}
      </button>
    ) : row.status === "active" ? (
      <button type="button" className={secondaryButton} disabled={busy} onClick={() => hold.mutate(row)}>
        {t("page.members.putOnHold")}
      </button>
    ) : null;

  return (
    <div className="space-y-6">
      <PageHead
        title={t("page.members.title")}
        note={data ? t("page.members.noteCount", { total: data.length, pending }) : t("page.members.note")}
      />
      {isLoading ? <DataBlock state="loading" /> : null}
      {error ? <DataBlock state="error" note={error.message} /> : null}
      {data && !data.length ? <DataBlock title={t("page.members.emptyTitle")} note={t("page.members.emptyNote")} /> : null}
      {data && data.length ? (
        <>
          <div className="flex flex-wrap gap-2">
            {TABS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                aria-pressed={tab === value}
                className={["min-h-[44px] rounded-control border px-3 text-body", tab === value ? "border-data bg-pill-green text-pill-green-ink" : "border-control"].join(" ")}
              >
                {t(`page.members.tab.${value}`)} <span className="tabular">{data.filter((row) => row.status === value).length}</span>
              </button>
            ))}
          </div>
          <section className="rounded-card border border-edge bg-sheet">
            {rows.length ? (
              <>
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[860px] text-body">
                    <thead>
                      <tr>
                        <th className={HEAD}>{t("page.members.headBusiness")}</th>
                        <th className={HEAD}>{t("page.members.headState")}</th>
                        <th className={HEAD}>{t("page.members.headPlan")}</th>
                        <th className={HEAD}>{t("page.members.headPayment")}</th>
                        <th className={`${HEAD} text-right`}>{t("page.members.headCredits")}</th>
                        <th className={HEAD}>{t("page.members.headPaidUntil")}</th>
                        <th className={HEAD}>{t("page.members.headStatus")}</th>
                        <th className={HEAD}><span className="sr-only">{t("page.members.headAction")}</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id} className={["border-t border-rule", row.fraud_flags.length ? "bg-pill-amber/40" : ""].join(" ")}>
                          <td className={CELL}>
                            <p className="font-medium">{row.business_name || "—"}</p>
                            <p className="tabular text-label text-app-meta">
                              {row.user_email} · ABN ·· ··· ··· {row.abn_tail}
                            </p>
                            {row.fraud_flags.length ? <p className="text-label text-alert">{row.fraud_flags.join(", ")}</p> : null}
                          </td>
                          <td className={CELL}>{row.state || "—"}</td>
                          <td className={CELL}>{row.plan ? t(`page.members.plan.${row.plan}`) : "—"}</td>
                          <td className={CELL}>{t(`page.members.payment.${row.payment_status}`)}</td>
                          <td className={`${CELL} tabular text-right`}>{row.credits}</td>
                          <td className={`${CELL} tabular`}>{row.paid_until ? formatDate(row.paid_until) : "—"}</td>
                          <td className={CELL}>
                            <span className={`inline-flex h-[22px] items-center rounded-full px-2 text-label font-medium ${PILL[row.status]}`}>
                              {t(`page.members.tab.${row.status}`)}
                            </span>
                          </td>
                          <td className={`${CELL} text-right`}>{action(row)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ul className="lg:hidden">
                  {rows.map((row) => (
                    <li key={row.id} className="flex min-h-[64px] items-center justify-between gap-3 border-t border-rule px-4 py-3 first:border-t-0">
                      <div className="min-w-0">
                        <p className="truncate text-body font-medium">{row.business_name || row.user_email}</p>
                        <p className="tabular truncate text-label text-app-meta">
                          {row.state || "—"} · {row.plan ? t(`page.members.plan.${row.plan}`) : "—"} · {t(`page.members.payment.${row.payment_status}`)}
                        </p>
                      </div>
                      <div className="shrink-0">{action(row)}</div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="p-6 text-body text-app-meta">{t("page.members.noneInTab")}</p>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
