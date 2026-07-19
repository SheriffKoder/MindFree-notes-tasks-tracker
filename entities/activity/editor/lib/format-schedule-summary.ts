/**
 * @file entities/activity/editor/lib/format-schedule-summary.ts
 * Trigger labels for scheduleConfig dropdowns.
 */

import type { ScheduleConfig, ScheduleType, Weekday } from "@/entities/activity/model/types";
import { WEEKDAY_LABELS } from "@/entities/activity/editor/lib/form-labels";

/**
 * Short summary shown on the schedule-dependents menu trigger.
 */
export function formatScheduleSummary(
  scheduleType: ScheduleType,
  scheduleConfig: ScheduleConfig,
): string {
  switch (scheduleType) {
    case "once":
      return typeof scheduleConfig === "string" ? scheduleConfig : "Pick date";
    case "daily":
      return "Every day";
    case "weekly": {
      if (!Array.isArray(scheduleConfig) || scheduleConfig.length === 0) {
        return "Pick days";
      }

      return scheduleConfig
        .map((day) => WEEKDAY_LABELS[day as Weekday] ?? day)
        .join(", ");
    }
    case "monthly": {
      if (!Array.isArray(scheduleConfig) || scheduleConfig.length === 0) {
        return "Pick days";
      }

      return scheduleConfig.map((day) => String(Number(day))).join(", ");
    }
    case "yearly": {
      if (!Array.isArray(scheduleConfig) || scheduleConfig.length === 0) {
        return "Pick dates";
      }

      return scheduleConfig.join(", ");
    }
  }
}
