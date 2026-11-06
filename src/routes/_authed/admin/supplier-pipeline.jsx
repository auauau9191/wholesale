import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DataBlock from "@/components/shell/DataBlock";
import PageHead from "@/components/shell/PageHead";
import PipelineBoard from "@/components/console/pipeline/PipelineBoard";
import StageGaps from "@/components/console/pipeline/StageGaps";
import { getSupplierBoard, moveSupplierStage } from "@/services/adminService";
import { STAGE_LABEL } from "@/lib/supplier-rules";

export const Route = createFileRoute("/_authed/admin/supplier-pipeline")({
  head: () => ({ meta: [{ title: "Supplier pipeline · Wholesale System" }] }),
  component: PipelinePage,
});

function PipelinePage() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("");
  const [showRejected, setShowRejected] = useState(false);
  const [blocked, setBlocked] = useState(null);
  const board = useQuery({ queryKey: ["supplier-board"], queryFn: getSupplierBoard });

  const move = useMutation({
    mutationFn: ({ id, stage, note }) => moveSupplierStage({ supplier_id: id, to_stage: stage, note }),
    onSuccess: (result, vars) => {
      queryClient.invalidateQueries({ queryKey: ["supplier-board"] });
      if (result.ok) toast(`${vars.headline} moved to ${vars.label}.`);
      else setBlocked({ headline: vars.headline, gaps: result.gaps });
    },
    onError: (error) => toast(error.message),
  });

  const rows = (board.data?.rows ?? []).filter((row) => !category || row.category_codes.includes(category));
  const rejected = rows.filter((row) => row.pipeline_stage === "rejected").length;
  const live = rows.filter((row) => row.pipeline_stage === "live").length;
  const blockedCount = rows.filter((row) => row.pipeline_stage !== "live" && row.pipeline_stage !== "rejected" && row.gaps.length).length;

  return (
    <div className="space-y-6">
      <PageHead
        title="Supplier pipeline"
        note={
          board.data
            ? `${live} factories are live and ${blockedCount} in the pipeline still have conditions to meet. Drag a card to move it; Live checks the conditions first.`
            : "Factories from the first screen through the visit and the film to a signed agreement."
        }
      />

      {board.isLoading ? <DataBlock state="loading" /> : null}
      {board.error ? <DataBlock state="error" note={board.error.message} /> : null}

      {board.data ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCategory("")}
              aria-pressed={category === ""}
              className={[
                "min-h-[36px] rounded-control border px-3 text-body",
                category === "" ? "border-data bg-pill-green text-pill-green-ink" : "border-control",
              ].join(" ")}
            >
              All categories
            </button>
            {board.data.categories.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => setCategory(item.code)}
                aria-pressed={category === item.code}
                className={[
                  "tabular min-h-[36px] rounded-control border px-3 text-body",
                  category === item.code ? "border-data bg-pill-green text-pill-green-ink" : "border-control",
                ].join(" ")}
              >
                {item.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowRejected((value) => !value)}
              aria-pressed={showRejected}
              className={[
                "ml-auto min-h-[36px] rounded-control border px-3 text-body",
                showRejected ? "border-data bg-pill-green text-pill-green-ink" : "border-control",
              ].join(" ")}
            >
              Rejected {rejected}
            </button>
          </div>

          {rows.length ? (
            <PipelineBoard
              rows={rows}
              showRejected={showRejected}
              onMove={(id, stage) => {
                const row = rows.find((item) => item.id === id);
                move.mutate({ id, stage, headline: row?.headline, label: STAGE_LABEL[stage] ?? stage });
              }}
            />
          ) : (
            <DataBlock title="No factories in this view." note="Pick another category, or clear the filter." />
          )}
        </>
      ) : null}

      <StageGaps blocked={blocked} onOpenChange={(open) => !open && setBlocked(null)} />
    </div>
  );
}