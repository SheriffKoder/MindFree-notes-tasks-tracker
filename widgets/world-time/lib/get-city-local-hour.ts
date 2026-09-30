/**
 * @file widgets/world-time/lib/get-city-local-hour.ts
 * Reads the 0–23 clock hour for an instant in an IANA time zone.
 *
 * Purpose: Map a wall-clock Date to the scrub slider’s hour in a locked city.
 * Used in: world-time scrub model (derive sliderHour / hour offsets).
 */

/** Formatter options — 24h clock so midnight is 0, not 12/24. */
const HOUR_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  hourCycle: "h23",
};

/**
 * Local clock hour (0–23) of `instant` in `timeZone`.
 *
 * @param instant - Wall-clock moment to inspect
 * @param timeZone - IANA time zone id
 * @returns Integer hour in that zone (0 = midnight … 23 = 11 PM)
 */
export function getCityLocalHour(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    ...HOUR_FORMAT,
    timeZone,
  }).formatToParts(instant);

  const hourPart = parts.find(function findHourPart(part) {
    return part.type === "hour";
  })?.value;

  if (hourPart === undefined) {
    throw new Error(`Unable to resolve local hour for time zone "${timeZone}"`);
  }

  return Number(hourPart);
}
