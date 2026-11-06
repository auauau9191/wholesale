import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DataBlock from "@/components/shell/DataBlock";
import PageHead from "@/components/shell/PageHead";
import { useHubScope, HUB_LABEL } from "@/components/shell/HubScope";
import { secondaryButton } from "@/components/console/FormBits";
import CreateContainerDialog from "@/components/console/containers/CreateContainerDialog";
import AddToContainerDialog from "@/components/console/containers/AddToContainerDialog";
import { addToContainer, createContainer, getContainers, stepContainer } from "@/services/adminService";
import { formatDate } from "@/lib/format";

const ORDER = [
  ["booked", "Booked"],
  ["at_sea", "At sea"],
  ["arrived", "Arrived"],
  ["cleared", "Cleared"],
  ["unpacked", "Unpacked"],
];

const KINDS = {
  sample_consolidation: "Sample consolidation",
  order_lcl: "Order, LCL",
  order_fcl: "Order, FCL",
};

export const Route = createFileRoute("/_authed/admin/containers")({
  head: () => ({ meta: [{ title: "Containers · Wholesale System" }] }),
  component: ContainersPage,
});

function ContainersPage() {
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
      toast(`${container.container_no} booked.`);
    },
  });

  const add = useMutation({
    mutationFn: (payload) => addToContainer({ container_id: adding.id, ...payload }),
    onSuccess: () => {
      setAdding(null);
      refresh();
      toast("Added to the container.");
    },
  });

  const step = useMutation({
    mutationFn: (row) => stepContainer({ container_id: row.id }),
    onSuccess: (row) => {
      refresh();
      toast(row.status === "unpacked" ? "Unpacked. Its units are in QC at the hub." : `Now ${row.status}.`);
    },
    onError: (error) => toast(error.message),
  });

  const rows = data ?? [];
  const atSea = rows.filter((row) => row.status === "at_sea").length;

  return (
    <div className="space-y-6">
      <PageHead
        title="Containers"
        note={
          data
            ? `${atSea} at sea, ${rows.filter((row) => row.status === "arrived" || row.status === "cleared").length} landed and waiting. ${HUB_LABEL[hub]}, soonest ETA first.`
            : "What is at sea, what has landed and what is waiting on the broker."
        }
        action={
          <button type="button" onClick={() => setCreating(true)} className={secondaryButton}>
            New container
          </button>
        }
      />

      {isLoading ? <DataBlock state="loading" /> : null}
      {error ? <DataBlock state="error" note={error.message} /> : null}

      {data && !rows.length ? (
        <DataBlock title="No containers booked." note="Sample consolidations arrive before the first order container." />
      ) : null}

      {data
        ? ORDER.map(([status, label]) => {
            const list = rows.filter((row) => row.status === status);
            if (!list.length) return null;
            return (
              <section key={status} className="space-y-2">
                <h2 className="text-body font-medium">
                  {label} <span className="tabular text-app-meta">{list.length}</span>
                </h2>
                <ul className="space-y-2">
                  {list.map((row) => (
                    <li key={row.id} className="rounded-card border border-edge bg-sheet p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="tabular text-body font-medium">{row.container_no}</p>
                          <p className="text-label text-app-meta">
                            {KINDS[row.kind] ?? row.kind} · {row.origin_port} → {row.destination_hub} ·{" "}
                            {row.units.filter((unit) => !unit.is_master).length} units · {(row.order_nos ?? []).length} orders
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
                      <div className="mt-3 flex flex-wrap gap-2">
                        {row.next_step ? (
                          <button
                            type="button"
                            onClick={() => step.mutate(row)}
                            disabled={step.isPending}
                            className={secondaryButton}
                          >
                            Mark {ORDER.find(([value]) => value === row.next_step)?.[1]?.toLowerCase() ?? row.next_step}
                          </button>
                        ) : null}
                        <button type="button" onClick={() => setAdding(row)} className={secondaryButton}>
                          Add units or orders
                        </button>
                      </div>
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