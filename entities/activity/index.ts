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
  TaskCalendarDay,
  TaskCalendarDayActivity,
  TasksPageData,
  TodayActivity,
  TodayProgress,
  TodayProgressDimension,
} from "@/entities/activity/model/read-models";

export {
  getCurrentMonth,
  getMonthRange,
  parseMonthParam,
} from "@/entities/activity/lib/month";
export type { MonthRange } from "@/entities/activity/lib/month";

export {
  getActivityStatus,
  isActiveInMonth,
  isActiveOnDay,
} from "@/entities/activity/lib/schedule";
export { isRemoteActivityNewer } from "@/entities/activity/lib/is-remote-activity-newer";
export {
  deriveTodayProgress,
  isMeaningfulRecord,
  resolveRecordConfiguration,
} from "@/entities/activity/lib/record";
export type { RecordConfiguration } from "@/entities/activity/lib/record";
export {
  buildRecordLookup,
  recordKey,
} from "@/entities/activity/lib/record";
export type { RecordLookup } from "@/entities/activity/lib/record";
export { buildTodayActivities } from "@/entities/activity/lib/today";
export { buildRecordedDayActivities } from "@/entities/activity/lib/day";
export {
  buildTaskCalendarDays,
  computeTaskMonthProgress,
} from "@/entities/activity/transform";
