import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ApprovePanel from "@/components/samples/ApprovePanel";
import RejectPanel from "@/components/samples/RejectPanel";
import ChangePanel from "@/components/samples/ChangePanel";
import DecisionDone from "@/components/samples/DecisionDone";
import { formatDate } from "@/lib/format";
import { submitDecision } from "@/services/sampleService";

const CHOICES = [
  { key: "approve", label: "Approve" },
  { key: "reject", label: "Reject" },
  { key: "change", label: "Need a change" },
];

/** Approve, reject with a reason, or ask for a change. Opens once the sample is delivered. */
export default function DecisionCard({ sample, orderCredits }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [choice, setChoice] = useState("approve");
  const [reason, setReason] = useState(null);
  const [notes, setNotes] = useState("");
  const canDecide = sample.status === "delivered" && !sample.decision;
  const late = sample.decision_due && sample.decision_due < new Date().toISOString().slice(0, 10);

  const decide = useMutation({
    mutationFn: (payload) => submitDecision({ request_id: sample.id, ...payload }),
    onSuccess: (result, payload) => {
      queryClient.invalidateQueries({ queryKey: ["my-samples"] });
      if (payload.decision === "approve") navigate({ to: "/orders" });
      if (payload.decision === "reject" && result.category_code) navigate({ to: "/category", search: { code: result.category_code } });
    },
  });

  if (sample.decision) return <DecisionDone sample={sample} />;

  const panel = { sample, disabled: !canDecide, pending: decide.isPending };
  return (
    <section className="rounded-card border border-app-ink bg-sheet p-5 md:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lead font-medium">Your decision</h2>
        {sample.decision_due ? (
          <span className={`tabular text-label ${late ? "text-alert" : "text-pill-amber-ink"}`}>due {formatDate(sample.decision_due)}</span>
        ) : null}
      </div>
      <p className="mt-2 max-w-[520px] text-body text-app-soft">
        {canDecide
          ? "Hold it, test it, compare it to the photos. Then tell us. Your next free sample depends on it."
          : "You decide once it arrives. Hold it, test it, compare it to the photos."}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Your decision">
        {CHOICES.map((item) => (
          <button
            key={item.key}
            type="button"
            role="radio"
            aria-checked={choice === item.key}
            onClick={() => setChoice(item.key)}
            className={`min-h-[44px] rounded-control border px-2 text-body transition-transform duration-150 active:scale-[0.97] ${
              choice === item.key ? "border-data bg-pill-green font-medium text-pill-green-ink" : "border-control bg-sheet text-app-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {choice === "approve" ? <ApprovePanel {...panel} orderCredits={orderCredits} onSubmit={() => decide.mutate({ decision: "approve" })} /> : null}
      {choice === "reject" ? <RejectPanel {...panel} reason={reason} onReason={setReason} onSubmit={() => decide.mutate({ decision: "reject", reason })} /> : null}
      {choice === "change" ? <ChangePanel {...panel} notes={notes} onNotes={setNotes} onSubmit={() => decide.mutate({ decision: "change", notes: notes.trim() })} /> : null}
      {decide.error ? <p className="mt-3 text-body text-alert">{decide.error.message}</p> : null}
      {!canDecide ? (
        <p className="mt-3 text-label text-app-meta">
          The buttons open when it's delivered. <Link to="/browse" className="underline underline-offset-4">Keep browsing</Link>
        </p>
      ) : null}
    </section>
  );
}