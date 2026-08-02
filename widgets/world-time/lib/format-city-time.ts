/**
 * @file widgets/world-time/lib/format-city-time.ts
 * Formats a wall-clock instant as a short local time for a city time zone.
 */

/** Shared formatter options — hour + minute only (no seconds). */
const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
};

/**
 * Format `instant` as a short clock time in `timeZone`.
 *
 * @param instant - Wall-clock moment to format
 * @param timeZone - IANA time zone id
 * @returns Locale-aware time string without seconds (e.g. "3:45 PM")
 */
export function formatCityTime(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    ...TIME_FORMAT,
    timeZone,
  }).format(instant);
}
