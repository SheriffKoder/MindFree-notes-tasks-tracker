/**
 * @file entities/activity/cache/record/record-month-key.ts
 * Pure helper: the month bucket a record belongs to.
 *
 * Purpose: Map a record `date` (`YYYY-MM-DD`) to the `YYYY-MM` key of the
 *          `["activityRecords", month]` cache it lives in, so the sync hub
 *          writes exactly one bucket.
 * Used in: entities/activity/cache/synchronize-activity-caches.ts
 */

/**
 * Returns the `YYYY-MM` month key for a record's `YYYY-MM-DD` date.
 *
 * @param date - record day (`YYYY-MM-DD`, already validated upstream)
 * @returns month key (`YYYY-MM`)
 */
export function recordMonthKey(date: string): string {
  return date.slice(0, 7);
}
