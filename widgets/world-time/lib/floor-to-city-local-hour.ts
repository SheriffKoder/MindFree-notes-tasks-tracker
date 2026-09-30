/**
 * @file widgets/world-time/lib/floor-to-city-local-hour.ts
 * Floors a wall-clock instant to the start of its local hour in a zone.
 *
 * Purpose: Scrub snaps to whole hours (10:33 → 10:00) in the locked city.
 * Used in: world-time scrub model (`viewInstant` base).
 */

/**
 * Instant at the same local hour as `instant` in `timeZone`, with minutes
 * and seconds cleared (e.g. 10:33 → 10:00 in that zone).
 *
 * @param instant - Wall-clock moment to floor
 * @param timeZone - IANA time zone id
 * @returns New `Date` at local `HH:00:00.000` in `timeZone`
 */
export function floorToCityLocalHour(instant: Date, timeZone: string): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).formatToParts(instant);

  const minute = Number(
    parts.find(function findMinute(part) {
      return part.type === "minute";
    })?.value ?? 0,
  );
  const second = Number(
    parts.find(function findSecond(part) {
      return part.type === "second";
    })?.value ?? 0,
  );

  return new Date(
    instant.getTime() - minute * 60_000 - second * 1_000 - instant.getMilliseconds(),
  );
}
