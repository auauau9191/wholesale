/** One h1 per screen, with one grey sentence that states today's finding. */
export default function PageHead({ title, note, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-title font-medium tracking-[-0.01em]">{title}</h1>
        {note ? <p className="mt-2 max-w-[660px] text-body text-app-meta">{note}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}