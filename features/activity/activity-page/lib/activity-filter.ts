/**
 * @file features/activity/activity-page/lib/activity-filter.ts
 * Pure helpers for the activity calendar's client-side definition filter.
 *
 * The filter narrows which activities' records render on the calendar. State is
 * a set of HIDDEN activity ids (empty = all shown) so newly-created rows appear
 * by default and "reset" is a simple clear. Incomplete day entries are hidden
 * by default and shown only when `showIncomplete` is true. Only the calendar
 * consumes this; the activity list stays stable.
 */

import type { Activity, ActivityRecord } from "@/entities/activity";
import {
  isMeaningfulRecord,
  resolveRecordConfiguration,
} from "@/entities/activity";

/**
 * Whether an activity's records should render given the hidden set.
 */
export function isActivityShown(
  hidden: ReadonlySet<string>,
  activityId: string,
): boolean {
  return !hidden.has(activityId);
}

/**
 * Toggles an activity's hidden membership, returning a new set.
 */
export function toggleHiddenActivity(
  hidden: ReadonlySet<string>,
  activityId: string,
): Set<string> {
  const next = new Set(hidden);

  if (next.has(activityId)) {
    next.delete(activityId);
  } else {
    next.add(activityId);
  }

  return next;
}

/**
 * Whether a scheduled day-activity entry should render on the calendar.
 * Incomplete entries (no meaningful record) are hidden unless `showIncomplete`.
 */
export function isDayActivityShown(
  activity: Pick<Activity, "trackingMode" | "goal" | "goalDuration">,
  record: ActivityRecord | null,
  showIncomplete: boolean,
): boolean {
  if (showIncomplete) {
    return true;
  }

  if (record === null) {
    return false;
  }

  const { trackingMode } = resolveRecordConfiguration(activity, record);

  return isMeaningfulRecord(record, trackingMode);
}
