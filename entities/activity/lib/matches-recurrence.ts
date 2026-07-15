/**
 * @file entities/activity/lib/matches-recurrence.ts
 * Recurrence-pattern match for a single day, ignoring the validity window.
 *
 * Purpose: interpret `scheduleConfig` per `scheduleType` (afterthoughts §7).
 *          The window gate lives in resolve-schedule; this stays pure pattern.
 * Used in: entities/activity/lib/resolve-schedule.ts
 */

import { getScheduleDateParts } from "@/entities/activity/lib/date-parts";
import type { ScheduleConfig, ScheduleType } from "@/entities/activity/model/types";

/**
 * Answers whether the recurrence fires on a given day, config shape assumed
 * valid (Zod enforces it on write; malformed config resolves to `false`).
 *
 * @param isoDate - day as `YYYY-MM-DD`
 * @param scheduleType - recurrence pattern
 * @param scheduleConfig - configuration interpreted per `scheduleType`
 * @returns whether the pattern includes this day
 */
export function matchesRecurrence(
  isoDate: string,
  scheduleType: ScheduleType,
  scheduleConfig: ScheduleConfig,
): boolean {
  switch (scheduleType) {
    case "daily":
      return true;
    case "once":
      return scheduleConfig === isoDate;
    case "weekly": {
      if (!Array.isArray(scheduleConfig)) {
        return false;
      }

      return scheduleConfig.includes(getScheduleDateParts(isoDate).weekday);
    }
    case "monthly": {
      if (!Array.isArray(scheduleConfig)) {
        return false;
      }

      return scheduleConfig.includes(getScheduleDateParts(isoDate).dayOfMonth);
    }
    case "yearly": {
      if (!Array.isArray(scheduleConfig)) {
        return false;
      }

      return scheduleConfig.includes(getScheduleDateParts(isoDate).dayMonth);
    }
    default:
      return false;
  }
}
