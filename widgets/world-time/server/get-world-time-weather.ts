/**
 * @file widgets/world-time/server/get-world-time-weather.ts
 * Loads current weather for every World Time city column.
 *
 * Purpose: Batch + map OpenWeather results onto city codes (no UI).
 * Used in: app/api/world-time/weather/route.ts
 *
 * Steps:
 * 1. Read `WEATHER_API_KEY` from the environment.
 * 2. Fetch each city in parallel (`allSettled` so one failure does not kill all).
 * 3. Map successes to {@link CityWeather}; skip failed cities.
 */

import { WORLD_TIME_CITIES } from "@/widgets/world-time/lib/cities";
import type { CityWeather } from "@/widgets/world-time/model/city-weather";
import { fetchOpenWeatherCurrent } from "@/widgets/world-time/server/fetch-open-weather-current";

/**
 * Fetch simplified current weather for all World Time cities.
 *
 * @returns Array of city weather snapshots (omits cities that failed)
 */
export async function getWorldTimeWeather(): Promise<CityWeather[]> {
  // 1. Require the server-only API key.
  const apiKey = process.env.WEATHER_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing WEATHER_API_KEY.");
  }

  // 2. Parallel lookups — one OpenWeather call per calibrated city.
  const settled = await Promise.allSettled(
    WORLD_TIME_CITIES.map(async function fetchCityWeather(city) {
      const current = await fetchOpenWeatherCurrent(
        { lat: city.lat, lon: city.lon },
        apiKey,
      );

      return {
        code: city.code,
        tempC: current.tempC,
        conditionMain: current.conditionMain,
      } satisfies CityWeather;
    }),
  );

  // 3. Keep only fulfilled results so the grid can still render partial data.
  const cities: CityWeather[] = [];

  for (const result of settled) {
    if (result.status === "fulfilled") {
      cities.push(result.value);
    }
  }

  return cities;
}
