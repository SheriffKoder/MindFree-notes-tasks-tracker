/**
 * @file entities/activity/lib/date-parts.ts
 * Breaks an ISO `YYYY-MM-DD` day into the parts a recurrence match needs.
 *
 * Purpose: single, timezone-safe source for weekday / day-of-month / day-month
 *          derivation used by schedule resolution.
 * Used in: entities/activity/lib/matches-recurrence.ts
 */

import { WEEKDAYS } from "@/entities/activity/model/types";
import type { Weekday } from "@/entities/activity/model/types";

/** `getUTCDay()` is Sunday-first (0–6); map it onto our weekday codes. */
const UTC_DAY_TO_WEEKDAY: readonly Weekday[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

/**
 * Schedule-relevant parts of a single day, pre-formatted to match the strings
 * stored in `scheduleConfig` (see afterthoughts §7).
 */
export interface ScheduleDateParts {
  /** Weekday code (`"mon"` … `"sun"`) — matches `weekly` config. */
  weekday: Weekday;
  /** Zero-padded day of month (`"01"` … `"31"`) — matches `monthly` config. */
  dayOfMonth: string;
  /** Zero-padded `DD/MM` — matches `yearly` config. */
  dayMonth: string;
}

/**
 * Splits an ISO day into the parts each recurrence type compares against.
 * Parsed in UTC so the weekday never shifts with the host timezone.
 *
 * @param isoDate - day as `YYYY-MM-DD`
 * @returns weekday, day-of-month, and `DD/MM` parts
 */
export function getScheduleDateParts(isoDate: string): ScheduleDateParts {
  const [, month, day] = isoDate.split("-");
  const utcDay = new Date(`${isoDate}T00:00:00.000Z`).getUTCDay();

  return {
    weekday: UTC_DAY_TO_WEEKDAY[utcDay] ?? WEEKDAYS[0],
    dayOfMonth: day,
    dayMonth: `${day}/${month}`,
  };
}
