/**
 * @file views/tasks/lib/task-filter.ts
 * Pure helpers for the Tasks calendar's client-side task filter.
 *
 * The filter narrows which tasks' records render on the calendar. State is a set
 * of HIDDEN task ids (empty = all shown) so newly-created tasks appear by
 * default and "reset" is a simple clear. Incomplete day entries are hidden by
 * default and shown only when `showIncomplete` is true. Only the calendar
 * consumes this; the activity list stays stable (tasks-page.md).
 */

import type { Activity, ActivityRecord } from "@/entities/activity";
import { isMeaningfulRecord } from "@/entities/activity";

/**
 * Whether a task's records should render given the hidden set.
 *
 * @param hidden - currently hidden task ids
 * @param taskId - task id to test
 * @returns true when the task is shown (not hidden)
 */
export function isTaskShown(
  hidden: ReadonlySet<string>,
  taskId: string,
): boolean {
  return !hidden.has(taskId);
}

/**
 * Toggles a task's hidden membership, returning a new set.
 *
 * @param hidden - current hidden set
 * @param taskId - task id to flip
 * @returns next hidden set (new reference)
 */
export function toggleHiddenTask(
  hidden: ReadonlySet<string>,
  taskId: string,
): Set<string> {
  const next = new Set(hidden);

  if (next.has(taskId)) {
    next.delete(taskId);
  } else {
    next.add(taskId);
  }

  return next;
}

/**
 * Whether a scheduled day-activity entry should render on the calendar.
 * Incomplete entries (no meaningful record) are hidden unless `showIncomplete`.
 *
 * @param activity - activity definition (tracking mode)
 * @param record - day's record, or `null` when not recorded
 * @param showIncomplete - when true, incomplete entries are visible
 * @returns true when the pill should render
 */
export function isDayActivityShown(
  activity: Pick<Activity, "trackingMode">,
  record: ActivityRecord | null,
  showIncomplete: boolean,
): boolean {
  if (showIncomplete) {
    return true;
  }

  return (
    record !== null && isMeaningfulRecord(record, activity.trackingMode)
  );
}
