/**
 * @file features/activity/activity-record-drawer/ui/activity-record-drawer.tsx
 * Selected-day records drawer shell — date header, Add picker, and record list.
 *
 * Purpose: Bridge page-owned visibility/date state to the feature-owned data
 *          list. This shell does not fetch tasks or records itself.
 * Used in: features/activity/activity-page/ui/activity-page-client.tsx
 */

"use client";

import { useCallback } from "react";

import type { ActivityKind } from "@/entities/activity/model/types";
import type { ActivityRecordDrawerController } from "@/features/activity/activity-record-drawer/model/types";
import { ActivityRecordList } from "@/features/activity/activity-record-drawer/ui/activity-record-list";
import { AppDrawer } from "@/shared/drawer";

export interface ActivityRecordDrawerProps {
  /** Definition kind owned by the mounting page. */
  kind: ActivityKind;
  /** Page-level drawer open/close state and selected date. */
  drawer: ActivityRecordDrawerController;
  /** Clears page selection when the drawer is dismissed. */
  onDismiss?: () => void;
}

/**
 * `AppDrawer` for a selected calendar day with its persisted records.
 */
export function ActivityRecordDrawer({
  kind,
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
          <ActivityRecordList date={selectedDate} kind={kind} />
        ) : null}
      </div>
    </AppDrawer>
  );
}
