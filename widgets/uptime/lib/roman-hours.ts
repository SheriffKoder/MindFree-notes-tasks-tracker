/**
 * @file widgets/uptime/lib/roman-hours.ts
 * Roman numeral labels for the Uptime dial’s hour textPath.
 */

/**
 * Twelve-hour Roman labels, with a trailing XII so the circular textPath closes.
 */
export const ROMAN_HOUR_LABELS = [
  "XII",
  "I",
  "II",
  "III",
  "IIII",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
] as const;
