import { cn } from "@/lib/utils";

/**
 * The Lotwise wordmark: printed in thermal white over a red tear edge.
 * `printing` prints it in once (page load only).
 */
export default function Logo({ printing = false, className, ...rest }) {
  return (
    <span className={cn("dk-logo", printing && "is-printing", className)} {...rest}>
      <b>lotwise</b>
      <i aria-hidden="true" />
    </span>
  );
}
