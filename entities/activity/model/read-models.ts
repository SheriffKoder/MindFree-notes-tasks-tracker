/**
 * @file entities/activity/model/read-models.ts
 * Read-model payloads consumed by Activity pages.
 *
 * The API returns flat lists; client-side lookup maps are derived separately
 * (see entities/activity/lib/record/build-record-lookup). Definitions are stable and
 * not month-scoped; records are month-scoped.
 */

import type {
  Activity,
  ActivityKind,
  ActivityRecord,
} from "@/entities/activity/model/types";

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
 * One independently-tracked progress dimension for an activity-day.
 */
export interface TodayProgressDimension {
  /** Record dimension represented by this progress value. */
  kind: "count" | "duration";
  /** Human-readable dimension label for consumers. */
  label: "Count" | "Minutes";
  /** Current recorded value (`0` when no record exists). */
  value: number;
  /** Configured target, or `null` when this dimension is unbounded. */
  goal: number | null;
  /** Units left to reach the goal (`>= 0`), or `null` when unbounded. */
  remaining: number | null;
  /** Whole-number completion percent (0–100), or `null` when unbounded. */
  percent: number | null;
}

/**
 * Derived, never-stored progress for one activity on one day. Computed by
 * `entities/activity/lib/record/derive-today-progress`; consumers read it, never
 * recompute it.
 */
export interface TodayProgress {
  /**
   * Goal-aware completion: all configured dimensions reached, or (no goals) a
   * meaningful record.
   */
  done: boolean;
  /** Dimensions relevant to the tracking mode, in display order. */
  dimensions: TodayProgressDimension[];
}

/**
 * One activity shown on Home today, paired with today's record and derived
 * progress. Client-composed by `entities/activity/lib/today/build-today-activities`.
 */
export interface TodayActivity {
  /** Activity definition shown today. */
  activity: Activity;
  /** Today's record, or `null` when nothing is recorded yet. */
  record: ActivityRecord | null;
  /** Convenience mirror of `progress.done` for view dimming/sorting. */
  done: boolean;
  /** Derived per-dimension progress for the day. */
  progress: TodayProgress;
}

/**
 * Initial data loaded by an activity page (Tasks / Reminders) for SSR hydration.
 */
export interface ActivityPageData {
  /** Definition kind seeded into `["activities", kind]`. */
  kind: ActivityKind;
  /** Resolved month key (`YYYY-MM`). */
  month: string;
  /** Definitions for {@link kind}. */
  activities: ActivitiesResponse;
  /** Current-month records (shared across kinds). */
  records: ActivityRecordsResponse;
}

/** @deprecated Prefer {@link ActivityPageData}. */
export type TasksPageData = ActivityPageData;
