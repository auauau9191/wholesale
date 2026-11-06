import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import PageHead from "@/components/shell/PageHead";
import DataBlock from "@/components/shell/DataBlock";
import CurrentSampleCard from "@/components/samples/CurrentSampleCard";
import DecisionCard from "@/components/samples/DecisionCard";
import SampleExplainer from "@/components/samples/SampleExplainer";
import SampleHistory from "@/components/samples/SampleHistory";
import { formatDate } from "@/lib/format";
import { fetchMySamples } from "@/services/sampleService";

export const Route = createFileRoute("/_authed/_app/samples")({
  head: () => ({ meta: [{ title: "Samples · Wholesale System" }] }),
  component: SamplesPage,
});

function finding(current) {
  if (!current) return "No sample out with you right now. Request one from any product page.";
  if (current.status === "on_hold") return "Your sample is on hold while we confirm a few details.";
  if (current.status === "delivered") return `It has arrived. Decide by ${formatDate(current.decision_due)}.`;
  if (current.status === "dispatched") return "Your sample is on its way.";
  if (current.status === "decided") return "You've decided on your last sample.";
  return "We're picking and packing your sample.";
}

function SamplesPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ["my-samples"], queryFn: fetchMySamples });
  const current = data?.current ?? null;

  const credits = data ? (
    <span className="tabular text-body text-app-meta">
      {data.credits_left} free {data.credits_left === 1 ? "credit" : "credits"} left
    </span>
  ) : null;

  return (
    <div className="space-y-7">
      <PageHead title="Samples" note={data ? finding(current) : "Your sample, its tracking and your decision."} action={credits} />

      {isLoading ? <DataBlock state="loading" /> : null}
      {error ? <DataBlock state="error" note={error.message} /> : null}

      {data && current ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <CurrentSampleCard sample={current} decisionDays={data.explainer.decision_days} />
          <DecisionCard key={current.id} sample={current} orderCredits={data.explainer.order_sample_credits} />
        </div>
      ) : null}

      {data && !current ? (
        <DataBlock
          title="No sample out right now."
          note="Pick a product and request a sample. It ships from the hub nearest you."
          action={
            <Link to="/browse" className="inline-flex min-h-[44px] items-center rounded-control bg-app-ink px-4 text-body font-medium text-sheet">
              Browse products
            </Link>
          }
        />
      ) : null}

      <SampleExplainer explainer={data?.explainer} />
      {data ? <SampleHistory items={data.history} /> : null}
    </div>
  );
}