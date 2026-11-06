import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { inputClass, secondaryButton, Toggle } from "@/components/console/FormBits";
import { saveHub } from "@/services/adminService";
import { useAdminT } from "@/lib/adminI18n";

const STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

/** One hub: who runs it, where it is and which states it serves first. */
export default function HubCard({ hub, canEdit }) {
  const { t } = useAdminT();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState({
    name: hub.name ?? "",
    manager_name: hub.manager_name ?? "",
    city: hub.city ?? "",
    state: hub.state ?? "",
    street_address: hub.street_address ?? "",
    serves_states: hub.serves_states ?? [],
    fallback_rank: hub.fallback_rank ?? 1,
    is_active: Boolean(hub.is_active),
  });
  const set = (patch) => setDraft((current) => ({ ...current, ...patch }));

  const save = useMutation({
    mutationFn: () => saveHub({ hub_id: hub.id, patch: { ...draft, fallback_rank: Number(draft.fallback_rank) || 1 } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubs"] });
      toast(t("page.hubs.saved", { name: draft.name || hub.hub_code }));
    },
    onError: (error) => toast(error.message),
  });

  const toggleState = (code) =>
    set({
      serves_states: draft.serves_states.includes(code)
        ? draft.serves_states.filter((item) => item !== code)
        : [...draft.serves_states, code],
    });

  const field = (label, key, type = "text") => (
    <label className="block">
      <span className="text-label text-app-meta">{label}</span>
      <input
        type={type}
        value={draft[key]}
        disabled={!canEdit}
        onChange={(event) => set({ [key]: type === "number" ? Number(event.target.value) : event.target.value })}
        className={`${type === "number" ? "tabular" : ""} ${inputClass} disabled:bg-pill-grey`}
      />
    </label>
  );

  return (
    <section className="rounded-card border border-edge bg-sheet p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-lead font-medium">{hub.name ?? hub.hub_code}</h2>
          <p className="tabular text-label text-app-meta">
            {hub.hub_code} · {t("page.hubs.unitsOnShelf", { count: hub.on_shelf })}
          </p>
        </div>
        {canEdit ? (
          <button type="button" onClick={() => save.mutate()} disabled={save.isPending} className={secondaryButton}>
            {save.isPending ? t("common.saving") : t("page.hubs.save")}
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {field(t("page.hubs.fieldName"), "name")}
        {field(t("page.hubs.fieldManager"), "manager_name")}
        {field(t("page.hubs.fieldCity"), "city")}
        {field(t("page.hubs.fieldState"), "state")}
        {field(t("page.hubs.fieldStreet"), "street_address")}
        {field(t("page.hubs.fieldRank"), "fallback_rank", "number")}
      </div>

      <p className="mt-4 text-label text-app-meta">{t("page.hubs.statesFirst")}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {STATES.map((code) => {
          const on = draft.serves_states.includes(code);
          return (
            <button
              key={code}
              type="button"
              disabled={!canEdit}
              onClick={() => toggleState(code)}
              aria-pressed={on}
              className={[
                "tabular min-h-[32px] rounded-control border px-2.5 text-label disabled:opacity-60",
                on ? "border-data bg-pill-green text-pill-green-ink" : "border-control text-app-soft",
              ].join(" ")}
            >
              {code}
            </button>
          );
        })}
      </div>
      <div className="mt-3">
        <Toggle label={t("page.hubs.takingRequests")} checked={draft.is_active} onChange={(value) => canEdit && set({ is_active: value })} />
      </div>
    </section>
  );
}