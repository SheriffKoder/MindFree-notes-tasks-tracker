/**
 * @file widgets/world-time/model/city-weather.ts
 * Shared types for simplified per-city weather snapshots.
 *
 * Purpose: Contract between server fetch, API route, and client UI.
 * Used in: world-time weather server + client query + grid cells.
 */

/**
 * Minimal current-weather payload for one World Time city column.
 */
export interface CityWeather {
  /** Matches {@link WorldTimeCity.code}. */
  code: string;
  /** Current temperature in Celsius (metric units). */
  tempC: number;
  /** OpenWeather `weather[0].main` (e.g. `"Clear"`, `"Clouds"`). */
  conditionMain: string;
}

/**
 * Response body for `GET /api/world-time/weather`.
 */
export interface WorldTimeWeatherResponse {
  cities: CityWeather[];
}
