export default function ColourSelector({ colours, value, onChange }) {
  if (!colours?.length) return null;

  return (
    <div>
      <p className="text-label text-app-meta">Colour{value?.name ? ` · ${value.name}` : ""}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {colours.map((colour) => {
          const active = value?.name === colour.name;
          return (
            <button
              key={colour.name}
              type="button"
              onClick={() => onChange(colour)}
              aria-pressed={active}
              className={[
                "flex min-h-[36px] items-center gap-2 rounded-control border px-2.5 text-body transition-colors",
                active
                  ? "border-app-ink text-app-ink"
                  : "border-control text-app-soft hover:border-app-soft",
              ].join(" ")}
            >
              <span
                className="h-4 w-4 rounded-sm border border-edge"
                style={{ background: colour.hex }}
                aria-hidden="true"
              />
              {colour.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}