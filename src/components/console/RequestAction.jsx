import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DispatchDialog from "@/components/console/DispatchDialog";
import ReviewDialog from "@/components/console/ReviewDialog";
import { ACTION_LABEL } from "@/lib/requestLabels";
import { actOnRequest } from "@/services/adminService";

const BUTTON =
  "min-h-[36px] whitespace-nowrap rounded-control border border-control bg-sheet px-3 text-body text-app-ink transition-transform duration-150 hover:border-app-ink active:scale-[0.97] disabled:opacity-40";

/** The row's one next step. Dispatch and review ask first; the rest run straight away. */
export default function RequestAction({ row }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const act = useMutation({
    mutationFn: (extra) => actOnRequest({ request_id: row.id, action: row.action, ...extra }),
    onSuccess: () => {
      setOpen(false);
      toast(`${row.request_no}: ${ACTION_LABEL[row.action].toLowerCase()} done.`);
      queryClient.invalidateQueries({ queryKey: ["sample-queue"] });
    },
    onError: (error) => {
      if (!open) toast(error.message);
    },
  });

  if (!row.action) return null;
  const asks = row.action === "mark_dispatched" || row.action === "review";
  const Dialog = row.action === "review" ? ReviewDialog : DispatchDialog;

  return (
    <>
      <button type="button" disabled={act.isPending} onClick={() => (asks ? setOpen(true) : act.mutate({}))} className={BUTTON}>
        {act.isPending && !asks ? "Saving" : ACTION_LABEL[row.action]}
      </button>
      {asks ? (
        <Dialog
          row={row}
          open={open}
          onOpenChange={setOpen}
          pending={act.isPending}
          error={act.error?.message ?? null}
          onConfirm={(extra) => act.mutate(extra)}
        />
      ) : null}
    </>
  );
}