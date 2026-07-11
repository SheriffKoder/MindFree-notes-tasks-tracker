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
  /** `overlay` anchors inside the content row; `inline` renders in a thin footer row. */
  variant?: "overlay" | "inline";
}

/**
 * Shows transient save feedback or the last-edited timestamp.
 */
export function NoteFormLastSaved({
  formattedLastEditedAt,
  saveStatus = "idle",
  variant = "overlay",
}: NoteFormLastSavedProps) {
  const saveStatusLabel = getSaveStatusLabel(saveStatus);
  const label = saveStatusLabel ?? formattedLastEditedAt ?? "New note";

  return (
    <p
      className={cn(
        "text-[11px] leading-none",
        variant === "overlay"
          ? "pointer-events-none absolute bottom-0 right-0"
          : "shrink-0 text-right opacity-60",
        saveStatus === "error"
          ? "[color:var(--note-form-save-error)] opacity-100"
          : saveStatus === "saved"
            ? "[color:var(--note-form-save-success)] opacity-100"
            : "text-body-muted",
      )}
      role={saveStatusLabel ? "status" : undefined}
    >
      {label}
    </p>
  );
}
