import { Block, secondaryButton } from "@/components/console/FormBits";

/** The colours a sample and an order can be made in. */
export default function ProductColourBlock({ draft, set }) {
  const colours = draft.colours ?? [];
  const setColour = (index, patch) => set({ colours: colours.map((item, i) => (i === index ? { ...item, ...patch } : item)) });

  return (
    <Block
      title="Colours"
      note="Members pick from this list, and an order is locked to the colour of the sample they approved."
      action={
        <button
          type="button"
          onClick={() => set({ colours: [...colours, { name: "", hex: "#000000" }] })}
          className={secondaryButton}
        >
          Add colour
        </button>
      }
    >
      {colours.length ? (
        <ul className="space-y-2">
          {colours.map((colour, index) => (
            <li key={index} className="flex items-center gap-2">
              <input
                type="color"
                value={colour.hex || "#000000"}
                onChange={(event) => setColour(index, { hex: event.target.value })}
                aria-label={`${colour.name || "Colour"} swatch`}
                className="h-9 w-10 shrink-0 rounded-control border border-control bg-sheet"
              />
              <input
                value={colour.name}
                onChange={(event) => setColour(index, { name: event.target.value })}
                placeholder="Name"
                className="min-h-[36px] min-w-0 flex-1 rounded-control border border-control bg-sheet px-2.5 text-body outline-none focus:border-app-ink"
              />
              <input
                value={colour.hex}
                onChange={(event) => setColour(index, { hex: event.target.value })}
                className="tabular min-h-[36px] w-[100px] rounded-control border border-control bg-sheet px-2.5 text-body outline-none focus:border-app-ink"
              />
              <button
                type="button"
                onClick={() => set({ colours: colours.filter((_, i) => i !== index) })}
                className="min-h-[36px] rounded-control px-2 text-body text-app-meta hover:text-alert"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body text-app-meta">No colours yet.</p>
      )}
    </Block>
  );
}