/**
 * @file widgets/world-time/server/fetch-open-weather-current.ts
 * Fetches current weather for one lat/lon from OpenWeatherMap.
 *
 * Purpose: Isolate the HTTP + response-shape concerns for a single location.
 * Used in: widgets/world-time/server/get-world-time-weather.ts
 *
 * Steps:
 * 1. Build the Current Weather API URL (metric, English).
 * 2. Fetch with the server-only `WEATHER_API_KEY`.
 * 3. Validate HTTP + payload shape.
 * 4. Return temp °C and condition main.
 */

/** OpenWeather Current Weather API base (free tier). */
const OPEN_WEATHER_CURRENT_URL =
  "https://api.openweathermap.org/data/2.5/weather";

/**
 * Minimal fields we read from OpenWeather Current Weather JSON.
 */
interface OpenWeatherCurrentPayload {
  main?: { temp?: number };
  weather?: Array<{ main?: string }>;
  cod?: number | string;
  message?: string;
}

/**
 * Coordinates for a single OpenWeather lookup.
 */
export interface OpenWeatherCoords {
  lat: number;
  lon: number;
}

/**
 * Parsed current-weather slice used by the World Time widget.
 */
export interface OpenWeatherCurrent {
  tempC: number;
  conditionMain: string;
}

/**
 * Fetch current weather for one coordinate pair.
 *
 * @param coords - City-center latitude / longitude
 * @param apiKey - `WEATHER_API_KEY` (never sent to the client)
 * @returns Temperature °C and OpenWeather condition `main`
 */
export async function fetchOpenWeatherCurrent(
  coords: OpenWeatherCoords,
  apiKey: string,
): Promise<OpenWeatherCurrent> {
  // 1. Build request URL — metric so UI can show whole °C without conversion.
  const url = new URL(OPEN_WEATHER_CURRENT_URL);
  url.searchParams.set("lat", String(coords.lat));
  url.searchParams.set("lon", String(coords.lon));
  url.searchParams.set("appid", apiKey);
  url.searchParams.set("units", "metric");
  url.searchParams.set("lang", "en");

  // 2. Call OpenWeather.
  const response = await fetch(url.toString(), {
    // Weather changes slowly; allow CDN/edge caching hints if deployed.
    next: { revalidate: 60 * 30 },
  });

  if (!response.ok) {
    throw new Error(`OpenWeather HTTP ${response.status}`);
  }

  // 3. Parse + validate payload.
  const payload = (await response.json()) as OpenWeatherCurrentPayload;

  if (payload.cod != null && Number(payload.cod) !== 200) {
    throw new Error(payload.message ?? "OpenWeather API error");
  }

  const tempC = payload.main?.temp;
  const conditionMain = payload.weather?.[0]?.main;

  if (typeof tempC !== "number" || !conditionMain) {
    throw new Error("OpenWeather response missing temp or condition");
  }

  // 4. Return the slim snapshot.
  return { tempC, conditionMain };
}
