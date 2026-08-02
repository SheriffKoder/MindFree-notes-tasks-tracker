/**
 * @file widgets/world-time/lib/format-weather-temp.ts
 * Formats a Celsius temperature for the World Time weather row.
 *
 * Purpose: Single place for whole-degree display (e.g. `20°`).
 * Used in: weather cells under the World Time city grid.
 */

/**
 * Format a Celsius reading as a compact whole-degree label.
 *
 * @param tempC - Temperature in °C from OpenWeather (metric)
 * @returns Rounded display string such as `20°`
 */
export function formatWeatherTemp(tempC: number): string {
  return `${Math.round(tempC)}°`;
}
