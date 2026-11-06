import { useState } from "react";
import { Image } from "@/components/ui/image";

/** Rough ink for text sitting on an unknown colour. */
function inkOn(hex) {
  const value = (hex ?? "").replace("#", "");
  if (value.length !== 6) return "#ffffff";
  const [r, g, b] = [0, 2, 4].map((at) => parseInt(value.slice(at, at + 2), 16));
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#23290f" : "#ffffff";
}

/** Photos when we have them, otherwise the colour itself. */
export default function ProductGallery({ product, colour }) {
  const photos = product.photo_urls ?? [];
  const [index, setIndex] = useState(0);

  if (photos.length === 0) {
    const ink = inkOn(colour?.hex);
    return (
      <div
        className="flex aspect-square w-full flex-col justify-end rounded-card border border-edge p-5"
        style={{ background: colour?.hex ?? "#23290f" }}
      >
        <p className="text-lead font-medium" style={{ color: ink }}>
          {product.name}
        </p>
        <p className="tabular mt-1 text-label" style={{ color: ink, opacity: 0.72 }}>
          {product.product_id}
          {colour?.name ? ` · ${colour.name}` : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-card border border-edge bg-sheet">
        <Image
          src={photos[index]}
          alt={product.name}
          className="h-full w-full"
          fittingType="fill"
        />
      </div>
      {photos.length > 1 ? (
        <div className="grid grid-cols-4 gap-2">
          {photos.map((photo, at) => (
            <button
              key={photo}
              type="button"
              onClick={() => setIndex(at)}
              aria-label={`Photo ${at + 1}`}
              className={[
                "relative aspect-square overflow-hidden rounded-control border",
                at === index ? "border-app-ink" : "border-edge",
              ].join(" ")}
            >
              <Image src={photo} alt="" className="h-full w-full" fittingType="fill" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}