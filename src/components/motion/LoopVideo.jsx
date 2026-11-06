import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { VIDEOS, videoPoster, videoSrc } from "@/content/media";

/** At most two videos play at once across the page. */
const playing = new Set();

function claim(element) {
  if (playing.has(element)) return;
  while (playing.size >= 2) {
    const oldest = playing.values().next().value;
    oldest.pause();
    playing.delete(oldest);
  }
  playing.add(element);
  const started = element.play();
  if (started && typeof started.catch === "function") started.catch(() => {});
}

function release(element) {
  if (playing.delete(element)) element.pause();
}

/**
 * Illustrative footage. The poster paints first; the clip mounts near the
 * viewport and plays only while a quarter of it is on screen and the tab is
 * visible, and it gives up its slot when it leaves. Under reduced motion or
 * Save-Data the poster is the whole of it.
 */
export default function LoopVideo({ name, className = "", caption = false, position = "center" }) {
  const reduce = useReducedMotion();
  const frame = useRef(null);
  const element = useRef(null);
  const [near, setNear] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [saveData, setSaveData] = useState(false);

  const entry = VIDEOS[name];
  const alt = entry?.alt ?? "";
  const poster = videoPoster(name);

  useEffect(() => {
    const connection = navigator.connection;
    setSaveData(Boolean(connection?.saveData));
  }, []);

  useEffect(() => {
    const node = frame.current;
    if (!node) return undefined;
    const nearObserver = new IntersectionObserver(([item]) => setNear(item.isIntersecting), {
      rootMargin: "300px 0px",
    });
    const visibleObserver = new IntersectionObserver(
      ([item]) => setOnScreen(item.intersectionRatio >= 0.25),
      { threshold: [0, 0.25, 0.5, 0.75] }
    );
    nearObserver.observe(node);
    visibleObserver.observe(node);
    return () => {
      nearObserver.disconnect();
      visibleObserver.disconnect();
    };
  }, []);

  const plays = near && !reduce && !saveData;

  useEffect(() => {
    const video = element.current;
    if (!video) return undefined;
    const sync = () => {
      if (onScreen && document.visibilityState === "visible") claim(video);
      else release(video);
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      release(video);
    };
  }, [onScreen, plays]);

  return (
    <figure className={`relative m-0 overflow-hidden bg-ink ${className}`}>
      {plays ? (
        <video
          ref={element}
          className="h-full w-full object-cover"
          style={{ objectPosition: position }}
          muted
          loop
          playsInline
          preload="none"
          poster={poster}
          aria-label={alt}
        >
          <source src={videoSrc(name)} type="video/mp4" />
        </video>
      ) : (
        <img
          src={poster}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          style={{ objectPosition: position }}
        />
      )}
      {caption ? (
        <figcaption className="absolute bottom-0 left-0 bg-ground px-2 py-1 text-label text-ink">
          Illustrative footage
        </figcaption>
      ) : null}
    </figure>
  );
}