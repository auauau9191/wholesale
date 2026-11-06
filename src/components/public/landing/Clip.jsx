import LoopVideo from "@/components/motion/LoopVideo";

/** A landing clip: the shared looping-video behaviour, nothing of its own. */
export default function Clip({ name, className = "" }) {
  return <LoopVideo name={name} className={className} />;
}