/**
 * @file app/api/world-time/weather/route.ts
 * GET current weather for World Time city columns.
 *
 * Purpose: Keep `WEATHER_API_KEY` server-side; return slim city snapshots.
 * Used in: widgets/world-time client weather query.
 */

import { requireAuthenticatedUserId } from "@/shared/lib/auth/require-authenticated-user";
import type { WorldTimeWeatherResponse } from "@/widgets/world-time/model/city-weather";
import { getWorldTimeWeather } from "@/widgets/world-time/server/get-world-time-weather";

/**
 * Returns current weather for every World Time city.
 *
 * @returns `{ cities: CityWeather[] }`
 */
export async function GET() {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cities = await getWorldTimeWeather();
    const body: WorldTimeWeatherResponse = { cities };

    return Response.json(body);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch world time weather.";

    return Response.json({ error: message }, { status: 500 });
  }
}
