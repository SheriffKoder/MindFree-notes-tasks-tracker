/**
 * @file entities/activity/index.ts
 * Shared domain exports — types and pure helpers only.
 *
 * Server reads: `entities/activity/server` (added later)
 * Client cache: `entities/activity/client` (added later)
 */

export { WEEKDAYS } from "@/entities/activity/model/types";
export type {
  Activity,
  ActivityKind,
  ActivityRecord,
  ActivityRecordRow,
  ActivityRow,
  ActivityStatus,
  ScheduleConfig,
  ScheduleType,
  TrackingMode,
  Weekday,
} from "@/entities/activity/model/types";
export type {
  ActivitiesResponse,
  ActivityRecordsResponse,
  TasksPageData,
} from "@/entities/activity/model/read-models";
