/**
 * @file entities/activity/model/types.ts
 * Domain and database-row types for the Activity domain (tasks + reminders).
 *
 * One data model backs both kinds; `kind` decides where an activity appears
 * and how it is presented. See app/development/workflow/activity/activity-domain.md.
 */

/**
 * Where an activity appears. Set by the creating page, never asked in the drawer.
 */
export type ActivityKind = "task" | "reminder";

/**
 * How progress is recorded. The recording UI derives entirely from this value.
 */
export type TrackingMode = "boolean" | "count" | "duration" | "count+duration";

/**
 * Recurrence pattern. `once` is a single day; the rest recur inside the
 * `startsAt`/`endsAt` window.
 */
export type ScheduleType = "once" | "daily" | "weekly" | "monthly" | "yearly";

/**
 * Weekday codes used by `weekly` schedules, Monday-first.
 */
export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

/**
 * A single weekday code (`"mon"` … `"sun"`).
 */
export type Weekday = (typeof WEEKDAYS)[number];

/**
 * JSON configuration interpreted per `ScheduleType`:
 *
 * - `once`    → `"YYYY-MM-DD"` (the single day)
 * - `daily`   → `null`
 * - `weekly`  → `Weekday[]` (e.g. `["mon", "tue"]`)
 * - `monthly` → day-of-month strings (`["01", "15"]`)
 * - `yearly`  → `"DD/MM"` strings (`["25/01", "23/02"]`)
 */
export type ScheduleConfig = null | string | string[];

/**
 * Derived lifecycle status for an activity at a point in time. Never stored:
 * computed from the validity window and `archivedAt`.
 */
export type ActivityStatus = "active" | "upcoming" | "expired" | "archived";

/**
 * An activity definition (`mf_task`) as used across pages.
 */
export interface Activity {
  /** Row id. */
  id: string;
  /** Task or reminder. */
  kind: ActivityKind;
  /** Display title. */
  title: string;
  /** Optional longer description. */
  description: string | null;
  /** Card color (tasks); `null` for reminders. */
  color: string | null;
  /** How completion is recorded. */
  trackingMode: TrackingMode;
  /** Recurrence pattern. */
  scheduleType: ScheduleType;
  /** Recurrence configuration, interpreted per {@link scheduleType}. */
  scheduleConfig: ScheduleConfig;
  /** Target value (tasks); `null` for reminders and unbounded tasks. */
  goal: number | null;
  /** Validity window start (`YYYY-MM-DD`), or `null` for open-ended. */
  startsAt: string | null;
  /** Validity window end (`YYYY-MM-DD`), or `null` for open-ended. */
  endsAt: string | null;
  /** Manual archive timestamp (ISO), or `null` when active. */
  archivedAt: string | null;
  /** Creation timestamp (ISO). */
  createdAt: string;
  /** Last update timestamp (ISO). */
  updatedAt: string;
}

/**
 * A day's completion record for one activity (`mf_task_record`).
 *
 * Natural key is `(taskId, date)` — one aggregate row per activity per day.
 * Completion is derived; there is no stored `isCompleted` flag.
 */
export interface ActivityRecord {
  /** Row id. */
  id: string;
  /** Owning activity id. */
  taskId: string;
  /** Recorded day (`YYYY-MM-DD`). */
  date: string;
  /** Recorded count (0 when duration-only). */
  count: number;
  /** Recorded duration in minutes (0 when count-only). */
  duration: number;
  /** Optional note attached to the record. */
  description: string | null;
  /** Creation timestamp (ISO). */
  createdAt: string;
  /** Last update timestamp (ISO). */
  updatedAt: string;
}

/**
 * Supabase row shape for `mf_task` before domain mapping.
 */
export interface ActivityRow {
  id: string;
  user_id: string;
  kind: ActivityKind;
  title: string;
  description: string | null;
  color: string | null;
  tracking_mode: TrackingMode;
  schedule_type: ScheduleType;
  schedule_config: ScheduleConfig;
  goal: number | null;
  starts_at: string | null;
  ends_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Supabase row shape for `mf_task_record` before domain mapping.
 */
export interface ActivityRecordRow {
  id: string;
  user_id: string;
  task_id: string;
  date: string;
  count: number;
  duration: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}
