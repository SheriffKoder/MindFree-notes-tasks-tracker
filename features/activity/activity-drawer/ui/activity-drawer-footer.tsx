/**
 * @file features/activity/activity-drawer/ui/activity-drawer-footer.tsx
 * Thin drawer footer — last-saved / save-status only.
 *
 * Archive / restore / delete live on the form title row (same placement as
 * Notes' delete), not here. No day-nav or conflict UI.
 */

import { ActivityFormLastSaved } from "@/entities/activity/editor";
import type { ActivitySaveStatus } from "@/entities/activity/editor";

export interface ActivityDrawerFooterProps {
  formattedLastEditedAt: string | null;
  saveStatus?: ActivitySaveStatus;
}

/**
 * Compact footer row anchored below the scrollable editor content.
 */
export function ActivityDrawerFooter({
  formattedLastEditedAt,
  saveStatus = "idle",
}: ActivityDrawerFooterProps) {
  return (
    <footer className="flex shrink-0 items-center justify-end gap-2 py-1">
      <ActivityFormLastSaved
        formattedLastEditedAt={formattedLastEditedAt}
        saveStatus={saveStatus}
      />
    </footer>
  );
}
