/**
 * @file widgets/world-time/model/use-world-time-weather.ts
 * Hook: current weather map keyed by city code for the World Time grid.
 *
 * Purpose: Keep loading / data / lookup logic out of the dumb grid UI.
 * Used in: widgets/world-time/ui/world-time-city-times-grid.tsx
 */

"use client";

import { useQuery } from "@tanstack/react-query";

import { worldTimeWeatherQueryOptions } from "@/widgets/world-time/client/world-time-weather-query";
import type { CityWeather } from "@/widgets/world-time/model/city-weather";

/**
 * Loads World Time weather and exposes a `code → CityWeather` lookup.
 *
 * @returns `byCode` map plus query status flags
 */
export function useWorldTimeWeather() {
  const query = useQuery(worldTimeWeatherQueryOptions());

  // Derive lookup from the batch response (7 cities — cheap to rebuild).
  const byCode = new Map<string, CityWeather>();

  for (const city of query.data?.cities ?? []) {
    byCode.set(city.code, city);
  }

  return {
    byCode,
    isPending: query.isPending,
    isError: query.isError,
  };
}
