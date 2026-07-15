/**
 * @file entities/activity/index.ts
 * Shared domain exports — types and pure helpers only.
 *
 * Cross-slice consumers (features/*, views/*) import from here, never from
 * individual lib files. Server reads: `entities/activity/server`
 * client cache: `entities/activity/client`
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

export {
  getCurrentMonth,
  getMonthRange,
  parseMonthParam,
} from "@/entities/activity/lib/parse-month";
export type { MonthRange } from "@/entities/activity/lib/parse-month";

export {
  isActiveInMonth,
  isActiveOnDay,
} from "@/entities/activity/lib/resolve-schedule";
export { getActivityStatus } from "@/entities/activity/lib/activity-status";
export { isMeaningfulRecord } from "@/entities/activity/lib/is-meaningful-record";
export {
  buildRecordLookup,
  recordKey,
} from "@/entities/activity/lib/build-record-lookup";
export type { RecordLookup } from "@/entities/activity/lib/build-record-lookup";
