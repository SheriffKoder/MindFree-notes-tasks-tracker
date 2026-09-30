/**
 * @file widgets/world-time/lib/resolve-view-instant.ts
 * Builds the scrubbed view instant from live now + an hour offset.
 *
 * Purpose: One shared Date for all city clocks while the scrub slider is open.
 * Used in: world-time scrub model (`viewInstant`).
 */

/** Milliseconds in one hour. */
const MS_PER_HOUR = 3_600_000;

/**
 * Advance (or rewind) `realNow` by whole hours.
 *
 * @param realNow - Live wall-clock instant
 * @param hourOffset - Integer hours relative to `realNow` (may be negative)
 * @returns New `Date` at `realNow + hourOffset` hours
 */
export function resolveViewInstant(realNow: Date, hourOffset: number): Date {
  const wholeHours = Math.trunc(hourOffset);
  return new Date(realNow.getTime() + wholeHours * MS_PER_HOUR);
}
