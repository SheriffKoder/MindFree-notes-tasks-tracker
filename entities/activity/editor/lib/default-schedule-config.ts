/**
 * @file entities/activity/editor/lib/default-schedule-config.ts
 * Valid default `scheduleConfig` for each `scheduleType`.
 *
 * Purpose: Keep form emissions passing `addScheduleConfigIssues` when the type
 *          changes (never empty weekly/monthly/yearly arrays, never null once).
 * Used in: useActivityForm setScheduleType, schedule-input consumers.
 */

import { getScheduleDateParts } from "@/entities/activity/lib/schedule/date-parts";
import type { ScheduleConfig, ScheduleType } from "@/entities/activity/model/types";
import { getTodayIsoDate } from "@/shared/calendar";

/**
 * Returns a schema-valid config seed for the given schedule type, based on today.
 */
export function defaultScheduleConfig(
  scheduleType: ScheduleType,
): ScheduleConfig {
  const today = getTodayIsoDate();
  const parts = getScheduleDateParts(today);

  switch (scheduleType) {
    case "once":
      return today;
    case "daily":
      return null;
    case "weekly":
      return [parts.weekday];
    case "monthly":
      return [parts.dayOfMonth];
    case "yearly":
      return [parts.dayMonth];
  }
}
