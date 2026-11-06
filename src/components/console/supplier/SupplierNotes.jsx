import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Block, secondaryButton } from "@/components/console/FormBits";
import { formatDate } from "@/lib/format";
import { addSupplierNote } from "@/services/adminService";
import { STAGE_LABEL } from "@/lib/supplier-rules";

/** Every move and every manual note, newest first. */
export default function SupplierNotes({ code, notes }) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const add = useMutation({
    mutationFn: () => addSupplierNote({ supplier_code: code, note: note.trim() }),
    onSuccess: () => {
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["supplier-editor", code] });
      toast("Note added.");
    },
    onError: (error) => toast(error.message),
  });

  return (
    <Block title="Timeline" note="Every stage move and every manual note.">
      <div className="flex items-end gap-2">
        <label className="min-w-0 flex-1">
          <span className="text-label text-app-meta">Add a note</span>
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="What happened?"
            className="mt-1 min-h-[36px] w-full rounded-control border border-control bg-sheet px-2.5 text-body outline-none focus:border-app-ink"
          />
        </label>
        <button
          type="button"
          disabled={!note.trim() || add.isPending}
          onClick={() => add.mutate()}
          className={secondaryButton}
        >
          Add
        </button>
      </div>
      {notes.length ? (
        <ol className="mt-4 space-y-3">
          {notes.map((entry) => (
            <li key={entry.id} className="border-b border-rule pb-3 last:border-b-0 last:pb-0">
              <p className="text-body">{entry.note}</p>
              <p className="tabular text-label text-app-meta">
                {formatDate(entry.at ?? entry.created_date)}
                {entry.to_stage ? ` · ${STAGE_LABEL[entry.to_stage] ?? entry.to_stage}` : ""}
                {entry.by_email ? ` · ${entry.by_email}` : ""}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-body text-app-meta">No notes yet.</p>
      )}
    </Block>
  );
}