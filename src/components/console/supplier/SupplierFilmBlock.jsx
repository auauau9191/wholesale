import { Block, secondaryButton, TextField } from "@/components/console/FormBits";

const embedUrl = (url) => {
  const value = String(url ?? "").trim();
  const youtube = value.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{6,})/);
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;
  const vimeo = value.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  if (/^https:\/\/(www\.)?(bunny|iframe\.mediadelivery)/.test(value)) return value;
  return null;
};

/** The verification film and its chapters. */
export default function SupplierFilmBlock({ draft, set }) {
  const chapters = draft.video_chapters ?? [];
  const preview = embedUrl(draft.video_url);
  const setChapter = (index, patch) =>
    set({ video_chapters: chapters.map((chapter, i) => (i === index ? { ...chapter, ...patch } : chapter)) });

  return (
    <Block title="Film" note="An unlisted YouTube, Vimeo or Bunny Stream link. Members see it with its chapters.">
      <TextField
        label="Video URL"
        value={draft.video_url}
        onChange={(value) => set({ video_url: value })}
        placeholder="https://youtu.be/…"
      />
      {preview ? (
        <div className="mt-3 overflow-hidden rounded-card border border-edge">
          <div className="aspect-video w-full bg-pill-grey">
            <iframe src={preview} title="Supplier film preview" className="h-full w-full" allowFullScreen loading="lazy" />
          </div>
        </div>
      ) : draft.video_url ? (
        <p className="mt-2 text-body text-app-meta">That link can't be previewed. Paste a YouTube, Vimeo or Bunny Stream URL.</p>
      ) : null}

      <div className="mt-4 flex items-baseline justify-between">
        <p className="text-label text-app-meta">Chapters</p>
        <button
          type="button"
          onClick={() => set({ video_chapters: [...chapters, { title: "", start_seconds: 0 }] })}
          className={secondaryButton}
        >
          Add chapter
        </button>
      </div>
      {chapters.length ? (
        <ul className="mt-2 space-y-2">
          {chapters.map((chapter, index) => (
            <li key={index} className="flex items-end gap-2">
              <label className="min-w-0 flex-1">
                <span className="text-label text-app-meta">Title</span>
                <input
                  value={chapter.title}
                  onChange={(event) => setChapter(index, { title: event.target.value })}
                  className="mt-1 min-h-[36px] w-full rounded-control border border-control bg-sheet px-2.5 text-body outline-none focus:border-app-ink"
                />
              </label>
              <label className="w-[110px]">
                <span className="text-label text-app-meta">Starts (s)</span>
                <input
                  type="number"
                  min={0}
                  value={chapter.start_seconds}
                  onChange={(event) => setChapter(index, { start_seconds: Number(event.target.value) || 0 })}
                  className="tabular mt-1 min-h-[36px] w-full rounded-control border border-control bg-sheet px-2.5 text-body outline-none focus:border-app-ink"
                />
              </label>
              <button
                type="button"
                onClick={() => set({ video_chapters: chapters.filter((_, i) => i !== index) })}
                className="min-h-[36px] rounded-control px-2 text-body text-app-meta hover:text-alert"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-body text-app-meta">No chapters yet.</p>
      )}
    </Block>
  );
}