/**
 * @file entities/activity/model/read-models.ts
 * Read-model payloads consumed by Activity pages.
 *
 * The API returns flat lists; client-side lookup maps are derived separately
 * (see entities/activity/lib/record/build-record-lookup). Definitions are stable and
 * not month-scoped; records are month-scoped.
 */

import type { Activity, ActivityRecord } from "@/entities/activity/model/types";

/**
 * Activity definitions for a kind (stable, not month-scoped).
 */
export interface ActivitiesResponse {
  /** Definitions for the requested kind, active and archived. */
  activities: Activity[];
}

/**
 * Completion records for a single month (flat; lookups derived client-side).
 */
export interface ActivityRecordsResponse {
  /** Month key (`YYYY-MM`). */
  month: string;
  /** All records whose `date` falls in the month. */
  records: ActivityRecord[];
}

/**
 * One activity scheduled on a calendar day, paired with its record when present.
 */
export interface TaskCalendarDayActivity {
  /** Activity definition active on the day. */
  activity: Activity;
  /** Completion record for that activity-day, or `null` when not yet recorded. */
  record: ActivityRecord | null;
}

/**
 * Client-composed calendar row: one day in a month with all active activities.
 */
export interface TaskCalendarDay {
  /** Day of month (1–31). */
  day: number;
  /** ISO date (`YYYY-MM-DD`). */
  date: string;
  /** Activities active on the day, each with its record or `null`. */
  activities: TaskCalendarDayActivity[];
}

/**
 * Initial data loaded by the Tasks server page for SSR hydration.
 */
export interface TasksPageData {
  /** Resolved month key (`YYYY-MM`). */
  month: string;
  /** Task definitions (`kind = task`). */
  activities: ActivitiesResponse;
  /** Current-month records. */
  records: ActivityRecordsResponse;
}
