/**
 * @file widgets/world-time/lib/format-gmt-offset.ts
 * Formats a time zone’s UTC offset label (e.g. GMT-7, GMT+5:30).
 */

/**
 * Format the GMT/UTC offset for `timeZone` at `instant`.
 *
 * Uses `shortOffset` so DST changes are reflected automatically.
 *
 * @param instant - Wall-clock moment (offset can depend on date)
 * @param timeZone - IANA time zone id
 * @returns Offset string such as `GMT-7` or `GMT+5:30`
 */
export function formatGmtOffset(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  }).formatToParts(instant);

  const offset = parts.find(function findOffsetPart(part) {
    return part.type === "timeZoneName";
  })?.value;

  // Normalize rare "UTC" / "GMT±0" variants to a stable GMT label.
  if (!offset || offset === "GMT" || offset === "UTC") {
    return "GMT+0";
  }

  return offset.replace(/^UTC/, "GMT");
}
