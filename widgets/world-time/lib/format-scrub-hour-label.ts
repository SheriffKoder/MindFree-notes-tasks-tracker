/**
 * @file widgets/world-time/lib/format-scrub-hour-label.ts
 * Formats a 0–23 hour as a short 12-hour scrub label (e.g. `10 PM`).
 *
 * Purpose: Slider active hour + sparse tick labels under the track.
 * Used in: widgets/world-time/ui/world-time-scrub-slider.tsx
 */

/** Hours shown as tick labels under the scrub track (every 3 hours). */
export const SCRUB_HOUR_LABEL_HOURS = [
  0, 3, 6, 9, 12, 15, 18, 21,
] as const;

/**
 * Format a whole hour as a compact 12-hour label.
 *
 * @param hour - Integer hour 0–23
 * @returns Locale-aware string such as `10 PM` or `12 AM`
 */
export function formatScrubHourLabel(hour: number): string {
  const wholeHour = ((Math.trunc(hour) % 24) + 24) % 24;
  // Fixed UTC calendar day — only the hour field is meaningful.
  const instant = new Date(Date.UTC(2024, 0, 1, wholeHour, 0, 0));

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    hourCycle: "h12",
    timeZone: "UTC",
  }).format(instant);
}
