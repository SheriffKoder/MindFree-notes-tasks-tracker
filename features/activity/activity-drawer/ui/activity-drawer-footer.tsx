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
    <footer className="absolute bottom-0 right-0 md:right-3 w-full md:w-[50%] z-10 flex min-h-[2rem] items-center justify-end gap-2 px-3 pointer-events-none">
      <div className="flex min-w-0 justify-end">
        <ActivityFormLastSaved
          formattedLastEditedAt={formattedLastEditedAt}
          saveStatus={saveStatus}
        />
      </div>
    </footer>
  );
}
