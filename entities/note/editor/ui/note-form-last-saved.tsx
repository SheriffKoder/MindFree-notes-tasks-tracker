/**
 * @file entities/note/editor/ui/note-form-last-saved.tsx
 * Bottom-right last-saved label anchored inside the description row.
 */

import { cn } from "@/lib/utils";
import { getSaveStatusLabel } from "@/entities/note/editor/lib/note-form-classes";
import type { NoteSaveStatus } from "@/entities/note/editor/model/types";

export interface NoteFormLastSavedProps {
  formattedLastEditedAt: string | null;
  saveStatus?: NoteSaveStatus;
}

/**
 * Shows transient save feedback or the last-edited timestamp in the bottom-right
 * corner of the description area.
 */
export function NoteFormLastSaved({
  formattedLastEditedAt,
  saveStatus = "idle",
}: NoteFormLastSavedProps) {
  const saveStatusLabel = getSaveStatusLabel(saveStatus);
  const label = saveStatusLabel ?? formattedLastEditedAt ?? "New note";

  return (
    <p
      className={cn(
        "pointer-events-none absolute bottom-0 right-0 text-caption",
        saveStatus === "error"
          ? "[color:var(--note-form-save-error)]"
          : saveStatus === "saved"
            ? "[color:var(--note-form-save-success)]"
            : "text-body-muted",
      )}
      role={saveStatusLabel ? "status" : undefined}
    >
      {label}
    </p>
  );
}
