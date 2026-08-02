/**
 * @file widgets/world-time/client/fetch-world-time-weather.ts
 * Browser fetch for World Time weather snapshots.
 *
 * Purpose: Isolate network + response parsing from the query hook.
 * Used in: widgets/world-time/client/world-time-weather-query.ts
 */

import type { WorldTimeWeatherResponse } from "@/widgets/world-time/model/city-weather";

/**
 * GET `/api/world-time/weather` and return the typed payload.
 *
 * @returns Slim weather list for World Time cities
 */
export async function fetchWorldTimeWeather(): Promise<WorldTimeWeatherResponse> {
  const response = await fetch("/api/world-time/weather");

  if (!response.ok) {
    const body = (await response.json().catch(function emptyBody() {
      return null;
    })) as { error?: string } | null;

    throw new Error(body?.error ?? "Failed to fetch weather.");
  }

  return (await response.json()) as WorldTimeWeatherResponse;
}
