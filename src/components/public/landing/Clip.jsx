import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** At most two clips play at once across the page. */
const playing = new Set();

function takeSlot(video) {
  if (playing.has(video)) return;
  if (playing.size >= 2) {
    const oldest = playing.values().next().value;
    oldest.pause();
    playing.delete(oldest);
  }
  playing.add(video);
  const started = video.play();
  if (started && typeof started.catch === "function") started.catch(() => {});
}

function releaseSlot(video) {
  if (playing.delete(video)) video.pause();
}

/**
 * Illustrative footage: mounted near the viewport, playing while it is mostly
 * on screen and the tab is visible, the poster only under reduced motion or
 * Save-Data.
 */
export default function Clip({ name, className = "" }) {
  const reduce = useReducedMotion();
  const frame = useRef(null);
  const video = useRef(null);
  const [near, setNear] = useState(false);
  const [mostly, setMostly] = useState(false);
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    const connection = navigator.connection;
    setSaveData(Boolean(connection?.saveData));
  }, []);

  useEffect(() => {
    const node = frame.current;
    if (!node) return undefined;
    const nearObserver = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      rootMargin: "300px 0px",
    });
    const mostlyObserver = new IntersectionObserver(([entry]) => setMostly(entry.intersectionRatio >= 0.5), {
      threshold: [0, 0.5, 0.75],
    });
    nearObserver.observe(node);
    mostlyObserver.observe(node);
    return () => {
      nearObserver.disconnect();
      mostlyObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const element = video.current;
    if (!element) return undefined;
    const sync = () => {
      if (mostly && !reduce && !saveData && document.visibilityState === "visible") takeSlot(element);
      else releaseSlot(element);
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      releaseSlot(element);
    };
  }, [mostly, reduce, saveData]);

  const live = near && !reduce;

  return (
    <div
      ref={frame}
      className={`relative overflow-hidden bg-ink ${className}`}
      style={{
        backgroundImage: `url(/media/posters/${name}.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {live ? (
        <video ref={video} className="h-full w-full object-cover" muted loop playsInline preload="none">
          <source src={`/media/video/${name}.mp4`} type="video/mp4" />
        </video>
      ) : null}
    </div>
  );
}