import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { PrintedContext } from "@/components/docket/Printer";

/**
 * A sheet of docket paper that isn't fed from a printer (membership, receipts).
 * Figures inside it reprint when they change after the first paint.
 * `edges`: "bottom" | "both" | "none" (torn zigzag edges).
 */
export default function Sheet({ as: Tag = "div", edges = "bottom", className, children, ...rest }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <Tag
      className={cn("dk-paper", (edges === "bottom" || edges === "both") && "dk-zig-b", edges === "both" && "dk-zig-t", className)}
      {...rest}
    >
      <PrintedContext.Provider value={mounted}>{children}</PrintedContext.Provider>
    </Tag>
  );
}
