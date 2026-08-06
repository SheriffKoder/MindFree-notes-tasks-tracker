/**
 * @file entities/note/editor/ui/note-form-last-saved.tsx
 * Bottom-right last-saved label anchored inside the description row.
 */

import { cn } from "@/lib/utils";
import {
  SaveStatusLabel,
  getSaveStatusLabel,
} from "@/entities/editor/ui/save-status-label";
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
  let label: string;

  if (saveStatus === "saving") {
    const suffix = formattedLastEditedAt
      ? ` · ${formattedLastEditedAt}`
      : " · Edited just now";
    label = `Saving${suffix}`;
  } else if (saveStatus === "saved") {
    label = formattedLastEditedAt ?? "Edited just now";
  } else {
    label = formattedLastEditedAt ?? "New note";
  }

  return (
    <SaveStatusLabel
      label={label}
      saveStatus={saveStatus}
      variant={variant}
    />
  );
}
