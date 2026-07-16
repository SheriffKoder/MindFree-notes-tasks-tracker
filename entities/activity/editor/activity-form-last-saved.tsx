/**
 * @file entities/activity/editor/activity-form-last-saved.tsx
 * Thin last-saved / save-status label for the activity drawer footer.
 */

import { cn } from "@/lib/utils";
import { getSaveStatusLabel } from "@/entities/activity/editor/lib/form-classes";
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
    <p
      className={cn(
        "shrink-0 text-right text-[11px] leading-none opacity-60",
        saveStatus === "error"
          ? "[color:var(--color-error)] opacity-100"
          : saveStatus === "saved"
            ? "[color:var(--color-success)] opacity-100"
            : "text-body-muted",
      )}
      role={saveStatusLabel ? "status" : undefined}
    >
      {label}
    </p>
  );
}
