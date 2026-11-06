import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DataBlock from "@/components/shell/DataBlock";
import PageHead from "@/components/shell/PageHead";
import { useHubScope } from "@/components/shell/HubScope";
import { secondaryButton } from "@/components/console/FormBits";
import CreateContainerDialog from "@/components/console/containers/CreateContainerDialog";
import AddToContainerDialog from "@/components/console/containers/AddToContainerDialog";
import { addToContainer, createContainer, getContainers, stepContainer } from "@/services/adminService";
import { formatDate } from "@/lib/format";
import { useAdminT } from "@/lib/adminI18n";

const STEPS = ["booked", "at_sea", "arrived", "cleared", "unpacked"];

export const Route = createFileRoute("/_authed/admin/containers")({
  head: () => ({ meta: [{ title: "Containers · Wholesale System" }] }),
  component: ContainersPage,
});

function ContainersPage() {
  const { t } = useAdminT();
  const { hub } = useHubScope();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ["containers", hub],
    queryFn: () => getContainers({ hub }),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["containers"] });

  const create = useMutation({
    mutationFn: (form) => createContainer(form),
    onSuccess: (container) => {
      setCreating(false);
      refresh();
      toast(t("page.containers.booked", { no: container.container_no }));
    },
  });

  const add = useMutation({
    mutationFn: (payload) => addToContainer({ container_id: adding.id, ...payload }),
    onSuccess: () => {
      setAdding(null);
      refresh();
      toast(t("page.containers.added"));
    },
  });

  const step = useMutation({
    mutationFn: (row) => stepContainer({ container_id: row.id }),
    onSuccess: (row) => {
      refresh();
      toast(
        row.status === "unpacked"
          ? t("page.containers.unpacked")
          : t("page.containers.moved", { status: t(`containerStatus.${row.status}`) }),
      );
    },
    onError: (error) => toast(error.message),
  });

  const rows = data?.rows ?? [];
  const canEdit = Boolean(data?.can_edit);
  const atSea = rows.filter((row) => row.status === "at_sea").length;
  const landed = rows.filter((row) => row.status === "arrived" || row.status === "cleared").length;

  return (
    <div className="space-y-6">
      <PageHead
        title={t("page.containers.title")}
        note={
          data
            ? t("page.containers.note", { atSea, landed, hub: t(`hub.${hub}`) })
            : t("page.containers.notePlain")
        }
        action={
          canEdit ? (
            <button type="button" onClick={() => setCreating(true)} className={secondaryButton}>
              {t("page.containers.new")}
            </button>
          ) : null
        }
      />

      {isLoading ? <DataBlock state="loading" /> : null}
      {error ? <DataBlock state="error" note={error.message} /> : null}

      {data && !rows.length ? (
        <DataBlock title={t("page.containers.emptyTitle")} note={t("page.containers.emptyNote")} />
      ) : null}

      {data
        ? STEPS.map((status) => {
            const list = rows.filter((row) => row.status === status);
            if (!list.length) return null;
            return (
              <section key={status} className="space-y-2">
                <h2 className="text-body font-medium">
                  {t(`containerStatus.${status}`)} <span className="tabular text-app-meta">{list.length}</span>
                </h2>
                <ul className="space-y-2">
                  {list.map((row) => (
                    <li key={row.id} className="rounded-card border border-edge bg-sheet p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="tabular text-body font-medium">{row.container_no}</p>
                          <p className="text-label text-app-meta">
                            {t(`containerKind.${row.kind}`)} · {row.origin_port} → {row.destination_hub} ·{" "}
                            {t("page.containers.units", {
                              count: row.units.filter((unit) => !unit.is_master).length,
                            })}{" "}
                            · {t("page.containers.orders", { count: (row.order_nos ?? []).length })}
                          </p>
                        </div>
                        <p className="tabular text-body">
                          ETA {formatDate(row.eta)}
                          <span className="block text-label text-app-meta">ETD {formatDate(row.etd)}</span>
                        </p>
                      </div>
                      {row.units.length ? (
                        <p className="tabular mt-2 text-label text-app-meta">
                          {row.units.map((unit) => unit.unit_id).join(" · ")}
                        </p>
                      ) : null}
                      {canEdit ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {row.next_step ? (
                            <button
                              type="button"
                              onClick={() => step.mutate(row)}
                              disabled={step.isPending}
                              className={secondaryButton}
                            >
                              {t("page.containers.mark", { status: t(`containerStatus.${row.next_step}`) })}
                            </button>
                          ) : null}
                          <button type="button" onClick={() => setAdding(row)} className={secondaryButton}>
                            {t("page.containers.add")}
                          </button>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
        : null}

      <CreateContainerDialog
        open={creating}
        onOpenChange={setCreating}
        pending={create.isPending}
        error={create.error?.message ?? null}
        onCreate={(form) => create.mutate(form)}
      />
      <AddToContainerDialog
        container={adding}
        open={Boolean(adding)}
        onOpenChange={(open) => !open && setAdding(null)}
        pending={add.isPending}
        error={add.error?.message ?? null}
        onAdd={(payload) => add.mutate(payload)}
      />
    </div>
  );
}