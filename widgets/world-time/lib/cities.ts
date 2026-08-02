/**
 * @file widgets/world-time/lib/cities.ts
 * Static city list, map positions, IANA time zones, and weather coords.
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
  /** City-center latitude for OpenWeather lookups. */
  lat: number;
  /** City-center longitude for OpenWeather lookups. */
  lon: number;
}

/**
 * Default cities shown on the Home aside World Time map.
 *
 * Marker `{ x, y }` values were calibrated against `/images/globe.webp`.
 * `{ lat, lon }` are approximate city centers for weather queries.
 */
export const WORLD_TIME_CITIES: readonly WorldTimeCity[] = [
  {
    label: "Los Angeles",
    code: "LA",
    timeZone: "America/Los_Angeles",
    x: 14.64,
    y: 47.7,
    lat: 34.05,
    lon: -118.25,
  },
  {
    label: "New York",
    code: "NY",
    timeZone: "America/New_York",
    x: 26.87,
    y: 47.7,
    lat: 40.71,
    lon: -74.01,
  },
  {
    label: "London",
    code: "LO",
    timeZone: "Europe/London",
    x: 46.74,
    y: 40.83,
    lat: 51.51,
    lon: -0.13,
  },
  {
    label: "Cairo",
    code: "CA",
    timeZone: "Africa/Cairo",
    x: 55.92,
    y: 54.57,
    lat: 30.04,
    lon: 31.24,
  },
  {
    label: "Dubai",
    code: "DU",
    timeZone: "Asia/Dubai",
    x: 62.29,
    y: 56.19,
    lat: 25.2,
    lon: 55.27,
  },
  {
    label: "New Delhi",
    code: "ND",
    timeZone: "Asia/Kolkata",
    x: 69.42,
    y: 57.4,
    lat: 28.61,
    lon: 77.21,
  },
  {
    label: "Sydney",
    code: "SY",
    timeZone: "Australia/Sydney",
    x: 89.0,
    y: 84.08,
    lat: -33.87,
    lon: 151.21,
  },
] as const;
