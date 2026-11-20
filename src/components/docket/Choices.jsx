import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Sample tags: choose one of a few products. The chosen tag is punched (filled hole)
 * and swings on its string when you pick it (you).
 */
export function SampleTags({ legend, items, value, onChange, className }) {
  const [swinging, setSwinging] = useState(null);
  return (
    <fieldset className={cn("dk-fieldset", className)}>
      {legend ? <legend className="dk-label">{legend}</legend> : null}
      <div className="dk-tags">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            className={cn("dk-tag", swinging === item.value && "is-swinging")}
            aria-pressed={item.value === value}
            onClick={() => {
              if (item.value === value) return;
              setSwinging(item.value);
              setTimeout(() => setSwinging(null), 650);
              onChange(item.value);
            }}
          >
            <span className="dk-tag__hole" aria-hidden="true" />
            <span className="dk-tag__name">{item.label}</span>
            {item.meta ? <span className="dk-tag__meta">{item.meta}</span> : null}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Till keys: choose a quantity or a plan. The chosen key stays pressed down. */
export function TillKeys({ legend, items, value, onChange, className, ariaLabel }) {
  const keys = (
    <div className={cn("dk-keys", !legend && className)} role={legend ? undefined : "group"} aria-label={legend ? undefined : ariaLabel}>
      {items.map((item) => (
        <button key={item.value} type="button" className="dk-key" aria-pressed={item.value === value} onClick={() => onChange(item.value)}>
          {item.label}
        </button>
      ))}
    </div>
  );
  if (!legend) return keys;
  return (
    <fieldset className={cn("dk-fieldset", className)}>
      <legend className="dk-label">{legend}</legend>
      {keys}
    </fieldset>
  );
}
