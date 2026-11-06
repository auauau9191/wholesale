import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/** Why a card can't go live yet, one line per missing condition. */
export default function StageGaps({ blocked, onOpenChange }) {
  return (
    <Dialog open={Boolean(blocked)} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-card">
        <DialogHeader>
          <DialogTitle className="text-lead font-medium">{blocked?.headline} can't go live yet</DialogTitle>
          <DialogDescription className="text-body text-app-meta">
            These are the conditions for Live. Fix them in the supplier's record.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2">
          {(blocked?.gaps ?? []).map((gap) => (
            <li key={gap} className="text-body text-app-soft">
              {gap}
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}