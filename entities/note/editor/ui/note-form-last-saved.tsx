/**
 * @file entities/note/editor/ui/note-form-last-saved.tsx
 * Bottom-right last-saved label anchored inside the description row.
 */

import {
  SaveStatusLabel,
  getSaveStatusLabel,
} from "@/entities/editor/ui/save-status-label";
import type { NoteSaveStatus } from "@/entities/note/editor/model/types";

export interface NoteFormLastSavedProps {
  formattedLastEditedAt: string | null;
  saveStatus?: NoteSaveStatus;
  /**
   * Optional detailed status/error copy (e.g. HTTP status + concurrency token).
   * When set, replaces the default short label for the current saveStatus.
   */
  saveFeedback?: string | null;
  /** `overlay` anchors inside the content row; `inline` renders in a thin footer row. */
  variant?: "overlay" | "inline";
}

/**
 * Shows transient save feedback or the last-edited timestamp.
 */
export function NoteFormLastSaved({
  formattedLastEditedAt,
  saveStatus = "idle",
  saveFeedback = null,
  variant = "overlay",
}: NoteFormLastSavedProps) {
  let label: string;

  if (saveFeedback) {
    label = saveFeedback;
  } else if (saveStatus === "saving") {
    const suffix = formattedLastEditedAt
      ? ` · ${formattedLastEditedAt}`
      : " · Edited just now";
    label = `Saving${suffix}`;
  } else if (saveStatus === "saved") {
    label = formattedLastEditedAt ?? "Edited just now";
  } else if (saveStatus === "error") {
    label = getSaveStatusLabel("error") ?? "Could not save";
  } else {
    label = formattedLastEditedAt ?? "New note";
  }

  return (
    <SaveStatusLabel
      className={
        saveFeedback
          ? "max-w-full whitespace-normal break-words text-right leading-snug"
          : undefined
      }
      label={label}
      saveStatus={saveStatus}
      variant={variant}
    />
  );
}
