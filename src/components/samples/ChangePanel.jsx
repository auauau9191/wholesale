const ACTION =
  "mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-control bg-app-ink px-4 text-body font-medium text-sheet transition-transform duration-150 active:scale-[0.97] disabled:opacity-40";

/** Need a change: the notes go to our team, who take it up with the factory. */
export default function ChangePanel({ notes, onNotes, disabled, pending, onSubmit }) {
  return (
    <div className="mt-4 rounded-card bg-pill-grey p-4 text-body text-pill-grey-ink">
      <label htmlFor="change-notes" className="font-medium">
        What should change?
      </label>
      <textarea
        id="change-notes"
        value={notes}
        onChange={(event) => onNotes(event.target.value)}
        disabled={disabled}
        rows={3}
        maxLength={1000}
        placeholder="A deeper green, a thicker lip around the camera"
        className="mt-2 w-full rounded-control border border-control bg-sheet p-3 text-body text-app-ink placeholder:text-app-meta focus:border-app-ink focus:outline-none"
      />
      <p className="mt-2">Our team takes it to the factory and comes back to you with a new spec.</p>
      <button type="button" onClick={onSubmit} disabled={disabled || pending || !notes.trim()} className={ACTION}>
        {pending ? "Sending" : "Send to our team"}
      </button>
    </div>
  );
}