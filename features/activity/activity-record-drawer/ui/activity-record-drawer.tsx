/**
 * @file features/activity/activity-record-drawer/ui/activity-record-drawer.tsx
 * Selected-day records drawer shell — date header, Add picker, and record list.
 *
 * Purpose: Bridge page-owned visibility/date state to the feature-owned data
 *          list. This shell does not fetch tasks or records itself.
 * Used in: views/tasks/ui/tasks-client.tsx
 *
 * Ownership:
 * - `TasksClient` owns `useTaskRecordsDrawer` and opens it after a day click.
 * - This component maps that state to the shared `AppDrawer`.
 * - `ActivityRecordList` receives only the date; `useSelectedDayRecords`
 *   reads canonical query caches and derives day rows + Add candidates.
 */

"use client";

import { useCallback } from "react";

import { ActivityRecordList } from "@/features/activity/activity-record-drawer/ui/activity-record-list";
import { AppDrawer } from "@/shared/drawer";
import type { UseTaskRecordsDrawerResult } from "@/views/tasks/model/use-task-records-drawer";

export interface ActivityRecordDrawerProps {
  /** Page-level drawer open/close state and selected date. */
  drawer: UseTaskRecordsDrawerResult;
  /** Clears page selection when the drawer is dismissed. */
  onDismiss?: () => void;
}

/**
 * `AppDrawer` for a selected calendar day with its persisted records.
 */
export function ActivityRecordDrawer({
  drawer,
  onDismiss,
}: ActivityRecordDrawerProps) {
  // `selectedDate` identifies the drawer's content. `isOpen` only controls the
  // portal; the last date remains in page state after closing.
  const { isOpen, selectedDate, setOpen } = drawer;

  const handleOpenChange = useCallback(
    (open: boolean) => {
      // AppDrawer reports overlay, Escape, and close-button dismissals here.
      // Clear the calendar highlight before closing the page-owned drawer.
      if (!open) {
        onDismiss?.();
      }

      setOpen(open);
    },
    [onDismiss, setOpen],
  );

  return (
    <AppDrawer
      ariaLabel={
        selectedDate ? `Records for ${selectedDate}` : "Day records"
      }
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <div className="flex min-h-full flex-col gap-4 p-4">
        {selectedDate ? <ActivityRecordList date={selectedDate} /> : null}
      </div>
    </AppDrawer>
  );
}
