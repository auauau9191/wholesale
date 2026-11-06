import { Block, secondaryButton } from "@/components/console/FormBits";

const cell = "min-h-[36px] w-full rounded-control border border-control bg-sheet px-2.5 text-body outline-none focus:border-app-ink";

/** One signed price list for every member. Factory prices are in US$. */
export default function ProductPriceBlock({ draft, set, moq }) {
  const tiers = draft.price_tiers ?? [];
  const setTier = (index, patch) => set({ price_tiers: tiers.map((tier, i) => (i === index ? { ...tier, ...patch } : tier)) });

  return (
    <Block
      title="Price tiers"
      note="Each tier starts where the one before it ends. Leave the last top empty for open-ended."
      action={
        <button
          type="button"
          onClick={() =>
            set({
              price_tiers: [
                ...tiers,
                { min_qty: tiers.at(-1)?.max_qty ? tiers.at(-1).max_qty + 1 : moq || 500, max_qty: null, fob_usd: 0 },
              ],
            })
          }
          className={secondaryButton}
        >
          Add tier
        </button>
      }
    >
      {tiers.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-body">
            <thead>
              <tr className="text-label text-app-meta">
                <th className="pb-2 text-left font-normal">From</th>
                <th className="pb-2 text-left font-normal">To</th>
                <th className="pb-2 text-left font-normal">FOB, US$</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier, index) => (
                <tr key={index}>
                  <td className="pr-2 pt-2">
                    <input
                      type="number"
                      min={1}
                      value={tier.min_qty}
                      onChange={(event) => setTier(index, { min_qty: Number(event.target.value) || 0 })}
                      className={`tabular ${cell}`}
                    />
                  </td>
                  <td className="pr-2 pt-2">
                    <input
                      type="number"
                      min={0}
                      value={tier.max_qty ?? ""}
                      placeholder="open"
                      onChange={(event) => setTier(index, { max_qty: event.target.value === "" ? null : Number(event.target.value) })}
                      className={`tabular ${cell}`}
                    />
                  </td>
                  <td className="pr-2 pt-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={tier.fob_usd}
                      onChange={(event) => setTier(index, { fob_usd: Number(event.target.value) || 0 })}
                      className={`tabular ${cell}`}
                    />
                  </td>
                  <td className="pt-2 text-right">
                    <button
                      type="button"
                      onClick={() => set({ price_tiers: tiers.filter((_, i) => i !== index) })}
                      className="min-h-[36px] rounded-control px-2 text-body text-app-meta hover:text-alert"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-body text-app-meta">No price tiers signed yet.</p>
      )}
    </Block>
  );
}