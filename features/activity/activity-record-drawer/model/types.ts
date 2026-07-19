/**
 * @file features/activity/activity-record-drawer/model/types.ts
 * Kind-agnostic contracts for controlling the selected-day records drawer.
 */

/**
 * Minimal controller consumed by ActivityRecordDrawer.
 *
 * Keeping this contract in the feature prevents the reusable drawer from
 * depending on either the Tasks or Reminders view.
 */
export interface ActivityRecordDrawerController {
  isOpen: boolean;
  selectedDate: string | null;
  openForDate: (date: string) => void;
  close: () => void;
  setOpen: (open: boolean) => void;
}
