/**
 * @file entities/activity/editor/activity-form-last-saved.tsx
 * Thin last-saved / save-status label for the activity drawer footer.
 */

import {
  SaveStatusLabel,
  getSaveStatusLabel,
} from "@/entities/editor/ui/save-status-label";
import type { ActivitySaveStatus } from "@/entities/activity/editor/model/types";

export interface ActivityFormLastSavedProps {
  formattedLastEditedAt: string | null;
  saveStatus?: ActivitySaveStatus;
}

/**
 * Shows transient save feedback or the last-edited timestamp.
 */
export function ActivityFormLastSaved({
  formattedLastEditedAt,
  saveStatus = "idle",
}: ActivityFormLastSavedProps) {
  const saveStatusLabel = getSaveStatusLabel(saveStatus);
  const label = saveStatusLabel ?? formattedLastEditedAt ?? "New task";

  return (
    <SaveStatusLabel
      label={label}
      saveStatus={saveStatus}
    />
  );
}
