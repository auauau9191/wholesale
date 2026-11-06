import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { inputClass, primaryButton, secondaryButton } from "@/components/console/FormBits";
import { actionKey } from "@/lib/orderActionLabels";
import { useAdminT } from "@/lib/adminI18n";

/** The next step only. Two actions need an answer before they run. */
export default function OrderActions({ actions, pending, error, onAct }) {
  const { t } = useAdminT();
  const [dialog, setDialog] = useState(null);
  const [reportUrl, setReportUrl] = useState("");
  const [note, setNote] = useState("");
  const [containerNo, setContainerNo] = useState("");
  const [route, setRoute] = useState("via_BNE");

  const routes = [
    ["via_BNE", t("page.order.actions.viaBNE")],
    ["via_SYD", t("page.order.actions.viaSYD")],
    ["direct", t("page.order.actions.direct")],
  ];

  if (!actions.length) {
    return <p className="text-body text-app-meta">{t("page.order.actions.none")}</p>;
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <button
            key={action}
            type="button"
            disabled={pending}
            onClick={() => {
              if (action === "inspection_failed" || action === "shipped") setDialog(action);
              else onAct({ action });
            }}
            className={index === 0 ? primaryButton : secondaryButton}
          >
            {t(actionKey(action))}
          </button>
        ))}
      </div>
      {error ? <p className="mt-2 text-body text-alert">{error}</p> : null}

      <Dialog open={Boolean(dialog)} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="rounded-card">
          <DialogHeader>
            <DialogTitle className="text-lead font-medium">{dialog ? t(actionKey(dialog)) : ""}</DialogTitle>
            <DialogDescription className="text-body text-app-meta">
              {dialog === "shipped" ? t("page.order.actions.shippedNote") : t("page.order.actions.failedNote")}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (dialog === "shipped") onAct({ action: "shipped", container_no: containerNo.trim(), delivery_route: route });
              else onAct({ action: "inspection_failed", report_url: reportUrl.trim(), note: note.trim() || undefined });
              setDialog(null);
            }}
            className="space-y-3"
          >
            {dialog === "shipped" ? (
              <>
                <label className="block">
                  <span className="text-label text-app-meta">{t("page.order.actions.containerNo")}</span>
                  <input value={containerNo} onChange={(event) => setContainerNo(event.target.value)} className={`tabular ${inputClass}`} required />
                </label>
                <label className="block">
                  <span className="text-label text-app-meta">{t("page.order.actions.route")}</span>
                  <select value={route} onChange={(event) => setRoute(event.target.value)} className={inputClass}>
                    {routes.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <>
                <label className="block">
                  <span className="text-label text-app-meta">{t("page.order.actions.report")}</span>
                  <input value={reportUrl} onChange={(event) => setReportUrl(event.target.value)} className={inputClass} required />
                </label>
                <label className="block">
                  <span className="text-label text-app-meta">{t("page.order.actions.failed")}</span>
                  <input value={note} onChange={(event) => setNote(event.target.value)} className={inputClass} />
                </label>
              </>
            )}
            <button type="submit" disabled={pending} className={`w-full ${primaryButton}`}>
              {pending ? t("common.saving") : dialog ? t(actionKey(dialog)) : ""}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}