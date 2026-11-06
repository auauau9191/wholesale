import { formatDate } from "@/lib/format";
import { HUB_CITY } from "@/services/sampleService";

const STAGE = { requested: 0, on_hold: 0, ready_to_dispatch: 1, dispatched: 2, delivered: 3, decided: 3 };

function steps(sample, decisionDays) {
  const credit = sample.paid_with === "paid_fee" ? `A$${sample.fee_aud ?? 0} sample fee` : "1 credit used";
  const tracking = [sample.carrier, sample.tracking_number].filter(Boolean).join(" ");
  return [
    {
      title: `Requested · ${credit}`,
      note: sample.status === "on_hold" ? "On hold while we confirm a few details" : formatDate(sample.requested_on),
    },
    { title: `Picked and packed at the ${HUB_CITY[sample.hub_code] ?? ""} hub`, note: "Checked against the master unit" },
    {
      title: "On its way",
      note: [sample.dispatched_on ? `Sent ${formatDate(sample.dispatched_on)}` : null, tracking ? `tracking ${tracking}` : null]
        .filter(Boolean)
        .join(" · ") || "Tracking appears once it leaves the hub",
    },
    {
      title: "Delivered",
      note: sample.delivered_on ? formatDate(sample.delivered_on) : `Then ${decisionDays} days to decide`,
    },
  ];
}

/** Requested → packed → on its way → delivered, with the current stop marked. */
export default function SampleTimeline({ sample, decisionDays }) {
  const stage = STAGE[sample.status] ?? 0;
  const list = steps(sample, decisionDays);
  return (
    <ol className="mt-5">
      {list.map((step, index) => {
        const done = index < stage || (index === stage && index === 3);
        const current = index === stage && !done;
        return (
          <li key={step.title} className="relative flex gap-3 pb-4 last:pb-0">
            {index < list.length - 1 ? (
              <span className={`absolute left-[6px] top-[16px] h-full w-[2px] ${index < stage ? "bg-data" : "bg-rule"}`} aria-hidden="true" />
            ) : null}
            <span
              className={`relative mt-[3px] h-[14px] w-[14px] shrink-0 rounded-full border-2 ${
                done ? "border-data bg-data" : current ? "border-data bg-sheet" : "border-control bg-sheet"
              }`}
              aria-hidden="true"
            />
            <div>
              <p className={`text-body ${current ? "font-medium text-app-ink" : done ? "text-app-ink" : "text-app-soft"}`}>
                {step.title}
              </p>
              <p className="tabular text-label text-app-meta">{step.note}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}