/**
 * @file widgets/world-time/lib/cities.ts
 * Static city list, map positions, and IANA time zones for World Time.
 */

/**
 * One city marker on the World Time globe.
 */
export interface WorldTimeCity {
  /** Full city name (accessibility / tooling). */
  label: string;
  /** Two-character grid label. */
  code: string;
  /** IANA time zone id for `Intl` formatting. */
  timeZone: string;
  /** Horizontal marker position as % of the map width. */
  x: number;
  /** Vertical marker position as % of the map height. */
  y: number;
}

/**
 * Default cities shown on the Home aside World Time map.
 *
 * Marker `{ x, y }` values were calibrated against `/images/globe.webp`.
 */
export const WORLD_TIME_CITIES: readonly WorldTimeCity[] = [
  {
    label: "Los Angeles",
    code: "LA",
    timeZone: "America/Los_Angeles",
    x: 14.64,
    y: 47.7,
  },
  {
    label: "New York",
    code: "NY",
    timeZone: "America/New_York",
    x: 26.87,
    y: 47.7,
  },
  {
    label: "London",
    code: "LO",
    timeZone: "Europe/London",
    x: 46.74,
    y: 40.83,
  },
  {
    label: "Cairo",
    code: "CA",
    timeZone: "Africa/Cairo",
    x: 55.92,
    y: 54.57,
  },
  {
    label: "Dubai",
    code: "DU",
    timeZone: "Asia/Dubai",
    x: 62.29,
    y: 56.19,
  },
  {
    label: "New Delhi",
    code: "ND",
    timeZone: "Asia/Kolkata",
    x: 69.42,
    y: 57.4,
  },
  {
    label: "Sydney",
    code: "SY",
    timeZone: "Australia/Sydney",
    x: 89.00,
    y: 84.08,
  },
] as const;
