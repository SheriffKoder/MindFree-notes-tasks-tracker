/**
 * @file widgets/world-time/client/world-time-weather-query.ts
 * TanStack Query options for World Time weather.
 *
 * Purpose: Stable query key + stale window (matches OpenWeather refresh habit).
 * Used in: widgets/world-time/model/use-world-time-weather.ts
 */

import { queryOptions } from "@tanstack/react-query";

import { fetchWorldTimeWeather } from "@/widgets/world-time/client/fetch-world-time-weather";

/** Cache key for the World Time weather batch. */
export const WORLD_TIME_WEATHER_QUERY_KEY = ["world-time", "weather"] as const;

/** Refresh every 30 minutes — same cadence as the prototype widget. */
const STALE_MS = 30 * 60 * 1000;

/**
 * Query options for current weather across World Time cities.
 */
export function worldTimeWeatherQueryOptions() {
  return queryOptions({
    queryKey: WORLD_TIME_WEATHER_QUERY_KEY,
    queryFn: fetchWorldTimeWeather,
    staleTime: STALE_MS,
    refetchInterval: STALE_MS,
  });
}
