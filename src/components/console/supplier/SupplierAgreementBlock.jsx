import { Block, Toggle } from "@/components/console/FormBits";

const STATUS = [
  ["none", "Not sent"],
  ["sent", "Sent"],
  ["signed", "Signed"],
];

/** The agreement is one of the conditions for Live, so it sits on its own. */
export default function SupplierAgreementBlock({ draft, set }) {
  return (
    <Block title="Agreement" note="Live needs the agreement and the non-circumvention clause both signed.">
      <div className="flex flex-wrap gap-2">
        {STATUS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => set({ agreement_status: value })}
            aria-pressed={draft.agreement_status === value}
            className={[
              "min-h-[36px] rounded-control border px-3 text-body",
              draft.agreement_status === value
                ? "border-data bg-pill-green text-pill-green-ink"
                : "border-control text-app-soft",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <Toggle
          label="Non-circumvention signed"
          checked={draft.non_circumvention_signed}
          onChange={(value) => set({ non_circumvention_signed: value })}
        />
      </div>
    </Block>
  );
}