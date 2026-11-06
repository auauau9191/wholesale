export const inputClass =
  "mt-1 min-h-[36px] w-full rounded-control border border-control bg-sheet px-2.5 text-body outline-none focus:border-app-ink";

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-label text-app-meta">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-label text-app-meta">{hint}</span> : null}
    </label>
  );
}

export function TextField({ label, hint, value, onChange, type = "text", placeholder }) {
  return (
    <Field label={label} hint={hint}>
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </Field>
  );
}

export function NumberField({ label, hint, value, onChange, step = 1, min = 0, max }) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        max={max}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
        className={`tabular ${inputClass}`}
      />
    </Field>
  );
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex min-h-[36px] items-center gap-2.5 text-body">
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded-[3px] border-control accent-data"
      />
      {label}
    </label>
  );
}

/** A section of the editor: a title, a note and its fields. */
export function Block({ title, note, children, action }) {
  return (
    <section className="rounded-card border border-edge bg-sheet p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lead font-medium">{title}</h2>
          {note ? <p className="mt-1 max-w-[560px] text-body text-app-meta">{note}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export const secondaryButton =
  "min-h-[36px] rounded-control border border-control bg-sheet px-3 text-body transition-transform duration-150 hover:border-app-ink active:scale-[0.97] disabled:opacity-40";

export const primaryButton =
  "min-h-[44px] rounded-control bg-app-ink px-4 text-body font-medium text-sheet transition-transform duration-150 active:scale-[0.97] disabled:opacity-40";