/**
 * @file features/activity/activity-record-drawer/ui/activity-record-drawer.tsx
 * Selected-day records drawer shell — date header + Home-style record list.
 *
 * Purpose: Open from a Tasks calendar day click. Add/delete land in later steps.
 * Used in: views/tasks/ui/tasks-client.tsx
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
  const { isOpen, selectedDate, setOpen } = drawer;

  const handleOpenChange = useCallback(
    (open: boolean) => {
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
        {selectedDate ? (
          <>
            <h2 className="text-h2">{selectedDate}</h2>
            <ActivityRecordList date={selectedDate} />
          </>
        ) : null}
      </div>
    </AppDrawer>
  );
}
