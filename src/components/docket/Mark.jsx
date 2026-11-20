import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { loadLottie, prefersReducedMotion } from "@/lib/motion/docket-motion";
import MARKS from "@/lib/motion/marks.json";

/**
 * A pen mark made by a person at Lotwise: "tick" (checked), "ring" (circled), "stamp" (the frame of a stamp).
 * Drawn by Lottie in pen blue when `play` turns true. With reduced motion it appears finished.
 * If Lottie can't load, a CSS tick stands in, so the meaning never depends on the animation.
 */
export default function Mark({ kind = "tick", play = false, delay = 0, speed = 1, className }) {
  const ref = useRef(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (!play) return undefined;
    let anim = null;
    let cancelled = false;
    const reduce = prefersReducedMotion();
    const timer = setTimeout(() => {
      loadLottie()
        .then((lottie) => {
          if (cancelled || !ref.current) return;
          ref.current.innerHTML = "";
          anim = lottie.loadAnimation({
            container: ref.current,
            renderer: "svg",
            loop: false,
            autoplay: false,
            animationData: JSON.parse(JSON.stringify(MARKS[kind])),
            rendererSettings: { preserveAspectRatio: kind === "ring" ? "none" : "xMidYMid meet" },
          });
          anim.setSpeed(speed);
          // Rest on the finished mark, even when a slow device skipped every frame on the way.
          anim.addEventListener("complete", () => anim.goToAndStop(anim.totalFrames - 2, true));
          if (reduce) anim.goToAndStop(anim.totalFrames - 2, true);
          else anim.play();
        })
        .catch(() => !cancelled && setFallback(true));
    }, reduce ? 0 : delay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (anim) anim.destroy();
    };
  }, [play, kind, delay, speed]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn("dk-mark", kind === "ring" && "dk-ring", fallback && kind === "tick" && "is-static", className)}
    />
  );
}

/** A stamp: the pen-blue frame lands (Lottie) and its words land with it (CSS). Words are real text. */
export function Stamp({ words, landed = false, className, style }) {
  return (
    <div className={cn("dk-stamp", landed && "is-landed", className)} style={style}>
      <Mark kind="stamp" play={landed} className="dk-stamp__ring" />
      <div className="dk-stamp__words">{words}</div>
    </div>
  );
}
