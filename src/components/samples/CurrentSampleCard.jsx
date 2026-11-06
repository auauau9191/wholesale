import { Image } from "@/components/ui/image";
import SampleTimeline from "@/components/samples/SampleTimeline";
import { HUB_CITY } from "@/services/sampleService";

/** The sample out with the member: what it is, which unit, where it ships from. */
export default function CurrentSampleCard({ sample, decisionDays }) {
  return (
    <section className="rounded-card border border-edge bg-sheet p-5 md:p-6">
      <div className="flex gap-4">
        {sample.photo_url ? (
          <Image src={sample.photo_url} alt={sample.product_name} className="h-16 w-16 shrink-0 rounded-card" />
        ) : (
          <span
            className="h-16 w-16 shrink-0 rounded-card border border-edge bg-rule"
            style={sample.colour_hex ? { backgroundColor: sample.colour_hex } : undefined}
            aria-hidden="true"
          />
        )}
        <div className="min-w-0">
          <h2 className="text-lead font-medium">
            {sample.product_name}
            {sample.colour ? ` · ${sample.colour}` : ""}
          </h2>
          <p className="tabular text-body text-app-soft">{sample.unit_id}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-pill-amber px-2 py-0.5 text-label text-pill-amber-ink">
              Sample – not for resale
            </span>
            <span className="text-label text-app-meta">Sending from our {HUB_CITY[sample.hub_code]} hub</span>
          </div>
        </div>
      </div>
      <SampleTimeline sample={sample} decisionDays={decisionDays} />
    </section>
  );
}