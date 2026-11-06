import { useState } from "react";
import { Image } from "@/components/ui/image";
import { VIDEOS, videoPoster } from "@/content/media";
import { formatDate } from "@/lib/format";

function embedUrl(raw, seconds) {
  const youtube = raw.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/
  );
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}?start=${seconds}&rel=0`;
  const vimeo = raw.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}#t=${seconds}s`;
  return raw;
}

/** The factory film, with chapters that jump into the film. */
export default function FilmPanel({ supplier }) {
  const [chapter, setChapter] = useState(0);
  const chapters = supplier.video_chapters ?? [];
  const start = chapters[chapter]?.start_seconds ?? 0;

  return (
    <div className="overflow-hidden rounded-card bg-app-ink text-sheet">
      <div className="relative aspect-video w-full">
        {supplier.video_url ? (
          <iframe
            key={start}
            src={embedUrl(supplier.video_url, start)}
            title={`${supplier.supplier_code} factory film`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <>
            <Image
              src={videoPoster("factory-machine-close")}
              alt={VIDEOS["factory-machine-close"].alt}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-app-ink/75" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-6 text-center">
              <p className="text-lead font-medium">Film being edited</p>
              <p className="max-w-[320px] text-body text-sheet/70">
                Our own footage of this factory goes up once the edit is signed off.
              </p>
            </div>
            <p className="absolute bottom-3 right-3 text-label text-sheet/70">Illustrative footage</p>
          </>
        )}
        <p className="tabular absolute left-3 top-3 text-label text-sheet/70">
          {supplier.supplier_code}
          {supplier.filmed_date ? ` · ${formatDate(supplier.filmed_date)}` : ""}
        </p>
      </div>

      {chapters.length ? (
        <div className="flex gap-2 overflow-x-auto px-3 pt-3">
          {chapters.map((item, index) => {
            const active = index === chapter;
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => setChapter(index)}
                aria-pressed={active}
                className={[
                  "shrink-0 rounded-full px-3 py-1.5 text-label transition-colors",
                  active
                    ? "bg-sheet text-app-ink"
                    : "bg-sheet/10 text-sheet/80 hover:bg-sheet/20",
                ].join(" ")}
              >
                {item.title}
              </button>
            );
          })}
        </div>
      ) : null}

      <p className="px-3 py-3 text-label text-sheet/60">
        Filmed by the Wholesale System team on site. Re-filmed every 12 months.
      </p>
    </div>
  );
}